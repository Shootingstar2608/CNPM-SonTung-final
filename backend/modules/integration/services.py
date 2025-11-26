import time
import uuid
from datetime import datetime
from typing import List, Optional
from core.models import (
    User, Role, Permission, SyncReport, SyncStatusEnum, 
    SyncStatus, SyncTypeEnum, AuthResult, SsoLogoutUrl, UserProfile
)
from core.database import db

#Mock clients

class MockDataCoreClient:
    """Giả lập Client gọi API sang hệ thống Đào tạo (DataCore)"""
    def fetch_user_profiles(self, user_ids: List[str]):
        print(f"[MockDataCore] Đang lấy thông tin profile cho: {user_ids}")
        # Giả lập trả về dữ liệu mẫu
        results = []
        for uid in user_ids:
            results.append({
                "id": uid, 
                "name": f"User {uid} (Synced)", 
                "email": f"{uid}@hcmut.edu.vn"
            })
        return results

    def fetch_all_roles(self):
        print(f"[MockDataCore] Đang lấy danh sách Roles & Permissions")
        return [
            {"id": "R_ADMIN", "name": "ADMIN", "perms": ["MANAGE_USER", "VIEW_LOGS", "SYNC_DATA"]},
            {"id": "R_TUTOR", "name": "TUTOR", "perms": ["CREATE_SCHEDULE", "UPLOAD_DOC"]},
            {"id": "R_STUDENT", "name": "STUDENT", "perms": ["BOOK_APT", "VIEW_DOC"]}
        ]

class MockSSOClient:
    """Giả lập Client gọi API sang hệ thống SSO (Single Sign-On)"""
    def exchange_code_for_token(self, code: str):
        if code == "INVALID_CODE":
            raise Exception("Mã xác thực không hợp lệ")
        # Giả lập trả về thông tin user sau khi login thành công
        return {
            "sso_id": "2012345",
            "email": "student@hcmut.edu.vn",
            "name": "Nguyen Van A"
        }

# --- 2. EXCEPTIONS ---
class UserDataProcessingError(Exception): pass
class RoleProcessingError(Exception): pass

# --- 3. REPOSITORIES (Lớp truy cập dữ liệu - Wrapper cho db dict) ---
class UserRepository:
    def get_all_users(self) -> List[User]:
        # Chuyển dict values thành list object User
        # Lưu ý: db['users'] đang lưu dict, cần convert sang object User nếu cần
        # Nhưng ở code hiện tại db['users'] lưu dict thuần do hàm init_db cũ.
        # Để đơn giản cho Mock, ta trả về list dict và xử lý ở service
        return list(db['users'].values())

    def update_or_create(self, user_data: dict):
        uid = user_data['id']
        if uid in db['users']:
            # Update thông tin (giữ nguyên password/role cũ)
            db['users'][uid]['name'] = user_data['name']
            db['users'][uid]['email'] = user_data['email']
        else:
            # Create mới (cần password/role mặc định)
            # Ở đây ta giả lập tạo user mới
            from core.database import create_user
            try:
                create_user(
                    name=user_data['name'],
                    email=user_data['email'],
                    password="default_password", # Mật khẩu mặc định khi sync về
                    role="PENDING"
                )
            except ValueError:
                pass # Bỏ qua nếu email trùng (đã xử lý ở logic trên)

class RoleRepository:
    def update_or_create(self, role_data: dict):
        # Lưu Role vào DB (cần cập nhật init_db hoặc cấu trúc db['roles'] nếu muốn lưu thật)
        # Hiện tại demo in ra log
        print(f"[DB] Đã cập nhật Role: {role_data['name']} với quyền {role_data['perms']}")

# --- 4. SERVICE IMPLEMENTATIONS (Logic chính) ---

class DataSyncService:
    def __init__(self):
        self.datacore_client = MockDataCoreClient()
        self.userRepo = UserRepository()
        self.roleRepo = RoleRepository()
        # Lưu lịch sử sync vào biến tạm (mất khi restart server)
        self._sync_history = {} 

    def run_scheduled_personal_data_sync(self) -> SyncReport:
        report = SyncReport(
            timestamp=datetime.now(),
            status=SyncStatusEnum.SUCCESS,
            message="Đồng bộ lịch trình (Scheduled) bắt đầu"
        )
        try:
            # Lấy tất cả user ID từ DB
            users = self.userRepo.get_all_users()
            # Vì db['users'] lưu dict, ta lấy key 'id'
            user_ids = [u.get('id') for u in users]
            
            self._core_pull_and_process_user_data(user_ids)
            
            report.message = "Đồng bộ hoàn tất thành công"
            report.records_processed = len(user_ids)
            self._update_sync_status(SyncTypeEnum.PERSONAL, report)
        except Exception as e:
            report.status = SyncStatusEnum.FAILED
            report.message = f"Lỗi hệ thống: {str(e)}"
            report.errors.append(str(e))
            self._update_sync_status(SyncTypeEnum.PERSONAL, report)
        
        return report

    def run_manual_personal_data_sync(self, user_id: str) -> SyncReport:
        report = SyncReport(
            timestamp=datetime.now(),
            status=SyncStatusEnum.SUCCESS,
            message=f"Đồng bộ thủ công cho user {user_id}"
        )
        try:
            self._core_pull_and_process_user_data([user_id])
            report.records_processed = 1
            report.message = "Đồng bộ thành công"
        except Exception as e:
            report.status = SyncStatusEnum.FAILED
            report.message = str(e)
            report.errors.append(str(e))
        
        return report

    def run_scheduled_role_sync(self) -> SyncReport:
        report = SyncReport(
            timestamp=datetime.now(),
            status=SyncStatusEnum.SUCCESS,
            message="Đồng bộ Role bắt đầu"
        )
        try:
            self._core_pull_and_process_all_roles()
            report.message = "Đồng bộ Role thành công"
            self._update_sync_status(SyncTypeEnum.ROLE, report)
        except Exception as e:
            report.status = SyncStatusEnum.FAILED
            report.message = str(e)
            self._update_sync_status(SyncTypeEnum.ROLE, report)
        
        return report

    def _core_pull_and_process_user_data(self, user_ids: list[str]) -> None:
        """Quy trình lõi: Gọi API -> Retry -> Cập nhật DB"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                data = self.datacore_client.fetch_user_profiles(user_ids)
                for user_data in data:
                    self.userRepo.update_or_create(user_data)
                return # Thành công, thoát hàm
            except Exception as e:
                print(f"[Sync] Lần thử {attempt+1} thất bại: {e}")
                if attempt == max_retries - 1:
                    raise UserDataProcessingError(f"Thất bại sau {max_retries} lần thử: {e}")
                time.sleep(1) # Chờ 1s trước khi thử lại

    def _core_pull_and_process_all_roles(self) -> None:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                roles_data = self.datacore_client.fetch_all_roles()
                for r_data in roles_data:
                    self.roleRepo.update_or_create(r_data)
                return
            except Exception as e:
                if attempt == max_retries - 1:
                    raise RoleProcessingError(f"Không thể đồng bộ Roles: {e}")
                time.sleep(1)

    def get_latest_sync_status(self, sync_type: SyncTypeEnum) -> SyncStatus:
        if sync_type in self._sync_history:
            report = self._sync_history[sync_type]
            return SyncStatus(
                last_run=report.timestamp,
                status=report.status,
                details=report.message
            )
        return SyncStatus(datetime.now(), SyncStatusEnum.FAILED, "Chưa có lịch sử đồng bộ")

    def _update_sync_status(self, type: SyncTypeEnum, report: SyncReport):
        self._sync_history[type] = report


class AuthService:
    def __init__(self):
        self.sso_config = {
            "sso_login_url": "https://sso.hcmut.edu.vn/login",
            "sso_password_reset_url": "https://sso.hcmut.edu.vn/reset-password",
            "client_id": "bktutor_app"
        }
        self.sso_client = MockSSOClient()

    def get_sso_login_redirect_url(self) -> str:
        # Tạo URL để FE redirect user sang trang SSO trường
        base = self.sso_config["sso_login_url"]
        cid = self.sso_config["client_id"]
        return f"{base}?client_id={cid}&response_type=code"

    def handle_sso_callback(self, authorization_code: str) -> AuthResult:
        try:
            # 1. Gọi Mock Client trao đổi code -> lấy info
            sso_info = self.sso_client.exchange_code_for_token(authorization_code)
            
            # 2. Tạo token cục bộ (đơn giản hóa bằng UUID)
            local_token = str(uuid.uuid4())
            
            # Trong thực tế: Lưu token vào session DB hoặc Redis
            
            return AuthResult(
                success=True,
                token=local_token,
                user_id=sso_info['sso_id']
            )
        except Exception as e:
            return AuthResult(success=False, error_message=str(e))

    def log_out(self, local_session_token: str) -> SsoLogoutUrl:
        # Xử lý xóa session...
        return SsoLogoutUrl(url="https://sso.hcmut.edu.vn/logout?redirect=myapp")

    def get_sso_password_reset_url(self) -> str:
        return self.sso_config["sso_password_reset_url"]

    def validate_local_token(self, local_session_token: str) -> bool:
        return True # Mock luôn đúng