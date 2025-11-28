# sso_server.py
from flask import Flask, request, jsonify, redirect
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)

MOCK_USERS = {
    "student": { "sso_id": "u2", "name": "Bùi Trần Duy Khang", "email": "student@hcmut.edu.vn", "role": "STUDENT" },
    "tutor":   { "sso_id": "u1", "name": "Đỗ Hồng Phúc", "email": "tutor@hcmut.edu.vn", "role": "TUTOR" },
    "admin":   { "sso_id": "u3", "name": "Lê Trọng Tín", "email": "admin@hcmut.edu.vn", "role": "ADMIN" },
    
    "officer": { "sso_id": "u4", "name": "Mai Đức Trung", "email": "mai.trung@hcmut.edu.vn", "role": "OFFICER" },
    "dept":    { "sso_id": "u5", "name": "Quản Thành Thơ", "email": "thothanhquan@hcmut.edu.vn", "role": "DEPARTMENT" }
}

active_codes = {}

def clean_expired_codes():
    now = datetime.now()
    expired_codes = [
        code for code, data in active_codes.items()
        if now - data['created_at'] > timedelta(minutes=5)
    ]
    for code in expired_codes:
        del active_codes[code]
        print(f"[SSO] Cleaned expired code: {code}")

@app.route('/', methods=['GET'])
def home():
    return "<h1>HCMUT SSO Simulator (Port 5001)</h1>"

@app.route('/authorize', methods=['GET'])
def authorize():
    redirect_uri = request.args.get('redirect_uri', '')
    return f"""
    <div style="text-align:center; padding-top:20px; font-family:sans-serif">
        <h2>Giả lập SSO (5 Roles)</h2>
        <p>Chọn tài khoản để đăng nhập:</p>
        <form action="/login-action" method="POST">
            <input type="hidden" name="redirect_uri" value="{redirect_uri}">
            
            <div style="margin-bottom: 15px;">
                <button name="user" value="admin" style="padding:10px; width: 200px; cursor:pointer; background:#fce4ec; border:1px solid #880e4f">
                    <strong>Admin:</strong> Lê Trọng Tín
                </button>
            </div>

            <div style="margin-bottom: 15px;">
                <button name="user" value="tutor" style="padding:10px; width: 200px; cursor:pointer; background:#fff3e0; border:1px solid #e65100">
                    <strong>Tutor:</strong> Đỗ Hồng Phúc
                </button> 
                <button name="user" value="student" style="padding:10px; width: 200px; cursor:pointer; background:#e0f7fa; border:1px solid #006064">
                    <strong>Student:</strong> Duy Khang
                </button> 
            </div>
            
            <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 20px;">
                <p><strong>Nhóm Quản lý & Phòng ban:</strong></p>
                <button name="user" value="officer" style="padding:10px; width: 200px; cursor:pointer; background:#e8eaf6; border:1px solid #1a237e">
                    <strong>Officer:</strong> Mai Đức Trung<br>(Phòng Đào tạo)
                </button> 
                <button name="user" value="dept" style="padding:10px; width: 200px; cursor:pointer; background:#f3e5f5; border:1px solid #4a148c">
                    <strong>Dept:</strong> Quản Thành Thơ<br>(Phòng CTSV)
                </button>
            </div>
        </form>
    </div>
    """

@app.route('/login-action', methods=['POST'])
def login_action():
    user_key = request.form.get('user')
    redirect_uri = request.form.get('redirect_uri')
    
    if user_key not in MOCK_USERS:
        return "User not found", 400

    clean_expired_codes()
    
    code = f"auth_{uuid.uuid4().hex[:8]}"
    active_codes[code] = {
        'user_info': MOCK_USERS[user_key],
        'created_at': datetime.now(),
        'used': False
    }
    
    print(f"[SSO] Generated code: {code} for user: {user_key}")
    print(f"[SSO] Redirecting to: {redirect_uri}?code={code}")
    return redirect(f"{redirect_uri}?code={code}")

@app.route('/token', methods=['POST'])
def token_exchange():
    data = request.get_json()
    code = data.get('code')
    
    print(f"[SSO] Token exchange request for code: {code}")
    
    if not code:
        return jsonify({"error": "Code is required"}), 400
    clean_expired_codes()
    
    if code not in active_codes:
        print(f"[SSO] Code not found: {code}")
        print(f"[SSO] Active codes: {list(active_codes.keys())}")
        return jsonify({"error": "Invalid code"}), 400
    
    code_data = active_codes[code]
    
    if code_data['used']:
        print(f"[SSO] Code already used: {code}")
        return jsonify({"error": "Code already used"}), 400
    
    if datetime.now() - code_data['created_at'] > timedelta(minutes=5):
        del active_codes[code]
        print(f"[SSO] Code expired: {code}")
        return jsonify({"error": "Code expired"}), 400
    
    code_data['used'] = True
    user_info = code_data['user_info']
    
    print(f"[SSO] Token exchange successful for: {user_info['name']}")
    
    return jsonify(user_info), 200

@app.route('/logout', methods=['GET'])
def logout():
    """SSO Logout endpoint"""
    return """
    <div style="text-align:center; padding-top:50px; font-family:sans-serif">
        <h2>Đã đăng xuất khỏi HCMUT SSO</h2>
        <p>Bạn có thể đóng tab này.</p>
    </div>
    """

@app.route('/reset', methods=['GET'])
def reset_password():
    return """
    <div style="text-align:center; padding-top:50px; font-family:sans-serif">
        <h2>Đặt lại mật khẩu</h2>
        <p>Đây là trang giả lập reset password</p>
        <form>
            <input type="email" placeholder="Email" style="padding:10px; width:300px"><br><br>
            <button style="padding:10px 20px; cursor:pointer">Gửi link reset</button>
        </form>
    </div>
    """
    
@app.route('/debug/codes', methods=['GET'])
def debug_codes():
    """Xem danh sách active codes (chỉ để debug)"""
    clean_expired_codes()
    codes_info = []
    for code, data in active_codes.items():
        codes_info.append({
            'code': code,
            'user': data['user_info']['name'],
            'created_at': data['created_at'].isoformat(),
            'used': data['used'],
            'age_seconds': (datetime.now() - data['created_at']).seconds
        })
    
    return jsonify({
        'total_codes': len(active_codes),
        'codes': codes_info
    }), 200

if __name__ == '__main__':
    print("=" * 50)
    print("HCMUT SSO Mock Server Starting...")
    print("URL: http://localhost:5001")
    print("Debug: http://localhost:5001/debug/codes")
    print("=" * 50)
    app.run(port=5001, debug=True)