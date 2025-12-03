from flask import Blueprint, request, jsonify, g, redirect
import os
from modules.integration.services import AuthService
from core.security import require_login
from core.database import db, create_user
bp = Blueprint('auth', __name__, url_prefix='/auth')

auth_service = AuthService()


@bp.route('/sso/login-url', methods=['GET'])
def get_sso_url():
    try:
        url = auth_service.get_sso_login_redirect_url()
        return jsonify({'redirect_url': url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/sso/callback', methods=['GET', 'POST'])
def sso_callback():
    code = request.args.get('code') or (request.get_json() or {}).get('code')

    if not code:
        return jsonify({'error': 'Missing authorization code'}), 400

    result = auth_service.handle_sso_callback(code)

    if result.success:
        # Redirect back to frontend with token as query params so frontend can
        # persist token into localStorage and continue the SPA flow.
        frontend_url = os.environ.get('FRONTEND_URL', 'http://127.0.0.1:5173')
        redirect_to = f"{frontend_url}/sso/callback?token={result.token}&user_id={result.user_id}"
        return redirect(redirect_to)
    else:
        # In case of failure, redirect back with error message
        frontend_url = os.environ.get('FRONTEND_URL', 'http://127.0.0.1:5173')
        redirect_to = f"{frontend_url}/sso/callback?error={result.error_message}"
        return redirect(redirect_to)

@bp.route('/logout', methods=['POST'])
def logout():
    data = request.get_json() or {}
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Token required'}), 400

    logout_info = auth_service.log_out(token)
    return jsonify({'message': 'Logged out', 'sso_logout_url': logout_info.url}), 200

@bp.route('/verify', methods=['POST'])
def verify():
    token = request.get_json().get('token')
    is_valid = auth_service.validate_local_token(token)
    return jsonify({'valid': is_valid}), 200

@bp.route('/profile', methods=['GET'])
@require_login
def get_my_profile():
    # `require_login` already set `g.current_user`
    user = g.get('current_user')
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'user': user}), 200

@bp.route('/tutors', methods=['GET'])
def list_tutors():
    """API lấy danh sách tất cả Tutor trong hệ thống"""
    tutors_list = []
    
    # Duyệt qua database users để lọc ra ai là TUTOR
    for user in db['users'].values():
        # Xử lý lấy role (do role có thể là string hoặc object tùy lúc init)
        role = user.get('role')
        role_name = role if isinstance(role, str) else role.get('name', '')
        
        if role_name == 'TUTOR':
            tutors_list.append({
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                # Các trường giả lập thêm để hiển thị đẹp trên UI (vì DB chưa có)
                "faculty": user.get('faculty', 'Khoa KH&KT Máy tính'),
                "group": "01", 
                "room": "H6-304", 
                "location": "Cơ sở 2"
            })
            
    return jsonify(tutors_list), 200

@bp.route('/register', methods=['POST'])
def register():
    """Đăng ký tài khoản mới (chưa có role - PENDING)"""
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({'error': 'Cần có name, email và password'}), 400
    
    try:
        # Tạo user với role PENDING (chưa có quyền gì)
        user = create_user(name=name, email=email, password=password, role='PENDING')
        return jsonify({
            'message': 'Đăng ký thành công! Vui lòng đợi admin phê duyệt.',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Lỗi server khi đăng ký'}), 500

@bp.route('/verify-credentials', methods=['POST'])
def verify_credentials():
    """Verify email/password cho SSO server (internal endpoint)"""
    from core.database import authenticate, get_user_by_email
    
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing credentials'}), 400
    
    # Authenticate using bcrypt
    user_id = authenticate(email, password)
    
    if user_id:
        user = get_user_by_email(email)
        return jsonify({
            'user_id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user.get('role', 'PENDING')
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401