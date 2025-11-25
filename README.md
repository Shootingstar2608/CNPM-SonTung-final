# LO4-SonTung-CNPM
Tóm tắt nhanh — Hướng dẫn cho team

**Mục đích**: Tài liệu ngắn gọn này tóm tắt các điểm cần lưu ý khi phát triển và tích hợp frontend/backend.

**1. Database (HashMap - dev)**
- **Cách truy cập**: import `db` từ `core/database.py` (biến toàn cục).
- **Sử dụng**: Thêm bảng/key mới cho module của bạn: `db['appointments']`, `db['schedules']`, `db['feedbacks'] = {}`.
- **Lưu ý**: Đây là lưu trữ tạm (HashMap). Server restart sẽ mất dữ liệu — dùng `init_db()` để seed dữ liệu mẫu khi cần.

**2. Bảo vệ API (Phân quyền)**
- **Decorator**: Dùng `@require_role(...)` từ `core/security.py` để giới hạn quyền truy cập.
- **Ví dụ**: API chỉ cho tutor gọi:
	- `@require_role('TUTOR')`

**3. Lấy thông tin user hiện tại**
- Đừng decode token thủ công. Hệ thống đã xử lý và gán thông tin user vào `flask.g`.

**4. Định nghĩa Model**
- Các model dùng `dataclass` trong `core/models.py`.
- Nếu cần model mới (ví dụ `Feedback`, `Report`), thêm vào đây hoặc file model riêng nhưng giữ format `dataclass`.

**5. Ghi chú cho Frontend (FE)**
- **Base URL (dev)**: `http://localhost:5000`.
- **Header bắt buộc**: `Authorization: Bearer <access_token>` (có khoảng trắng sau `Bearer`).

**6. Các API Auth chính (tổng quan)**
- `POST /auth/login` — body: `{ "email":..., "password":... }` → trả `access_token`.
- `POST /auth/register` — body: `{ "name":..., "email":..., "password":... }` → user mới mặc định role `PENDING`.
- `POST /auth/grant-role` — **Chỉ Admin**: dùng `Authorization: Bearer <token_admin>` để cấp role cho user (`TUTOR` hoặc `STUDENT`).

**7. Seed / Test accounts**
- Có một số tài khoản test đã được tạo sẵn — dùng để kiểm thử nhanh mà không cần đăng ký.

**Tóm tắt hành động nhanh**
- Backend: import `db`, dùng `require_role`, thêm model bằng `dataclass`, seed dữ liệu khi cần.
- Frontend: gửi token trong header `Authorization`, gọi các endpoint auth để nhận token.

