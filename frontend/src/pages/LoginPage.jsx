// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header'; // Tận dụng Header nếu muốn, hoặc bỏ đi để làm trang login riêng biệt
import './LoginPage.css'; // Chúng ta sẽ tạo file CSS ngay sau đây

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Gọi API Login
      const response = await fetch('http://127.0.0.1:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      // 2. Lưu Token vào LocalStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_id', data.user_id); // Lưu thêm user_id nếu cần

      // 3. Chuyển hướng vào trang chính (MeetingPage)
      alert("Đăng nhập thành công!");
      navigate('/');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">🔐 Đăng nhập BKTutor</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap_email@hcmut.edu.vn"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" className="btn-auth">Đăng nhập</button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;