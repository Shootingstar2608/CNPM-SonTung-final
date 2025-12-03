# 🚀 Quick Start - User Registration System

## Đã fix gì?

### ❌ Trước đây:
- Không có trang đăng ký
- UserManagement chỉ là hardcode fake data
- Không có cách nào tạo user mới
- Admin "quản lý" nhưng không thật sự làm gì

### ✅ Bây giờ:
- ✅ Có trang đăng ký hoàn chỉnh (`/register`)
- ✅ UserManagement kết nối API thật
- ✅ Admin có thể phân quyền cho users
- ✅ User mới đăng ký → Admin approve → User login

---

## 🎯 Quick Test

### 1. Đăng ký user mới
```
URL: http://127.0.0.1:5173/register
Fill: 
  - Name: Test User
  - Email: newuser@hcmut.edu.vn
  - Password: 123
  - Confirm: 123
Click: Đăng ký
```

### 2. Admin phân quyền
```
URL: http://127.0.0.1:5173/login
Login: admin@hcmut.edu.vn / admin
→ Navigate to /user-management
→ Tab "Phân quyền thủ công"
→ Find "Test User" (role: PENDING)
→ Change to "STUDENT"
```

### 3. Login với user mới
```
URL: http://127.0.0.1:5173/login
Login: newuser@hcmut.edu.vn / 123
→ Success! (vì đã có role STUDENT)
```

---

## 📝 API Summary

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/auth/register` | POST | `{name, email, password}` | `{user, message}` |
| `/admin/users` | GET | - | `{users: [...]}` |
| `/admin/grant-role` | POST | `{user_id, role}` | `{user, message}` |

---

## 🔑 Default Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@hcmut.edu.vn | admin | ADMIN |
| student@hcmut.edu.vn | 123 | STUDENT |
| tutor@hcmut.edu.vn | 123 | TUTOR |

---

## 📁 Changed Files

**Backend:**
- `backend/modules/integration/auth_routes.py` → Added `/auth/register`

**Frontend:**
- `frontend/src/pages/RegisterPage.jsx` → Complete registration form
- `frontend/src/pages/UserManagementPage.jsx` → Real API integration

**Documentation:**
- `USER_REGISTRATION_GUIDE.md` → Full documentation
- `QUICK_START.md` → This file

---

## 💡 Important Notes

1. **New users start with role: PENDING**
2. **PENDING users cannot login** until admin assigns a role
3. **Admin doesn't create users** - only assigns roles
4. **Email must be unique** - no duplicates allowed

---

✨ **System is now production-ready with proper user management!**
