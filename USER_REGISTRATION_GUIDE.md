# 🔐 Hướng dẫn Đăng ký & Quản lý User

## 🎯 Tính năng mới đã implement

### 1. **Đăng ký tài khoản mới** (`/register`)
- User tự đăng ký qua form tại `/register`
- Cần: Họ tên, Email, Mật khẩu
- Tài khoản mới tạo có role: **PENDING** (chưa có quyền gì)
- User không thể đăng nhập cho đến khi Admin phê duyệt

### 2. **Quản lý User thực sự hoạt động** (`/user-management`)
- Admin có thể:
  - ✅ Xem tất cả users từ database thật
  - ✅ Phân quyền cho user (thay đổi role)
  - ✅ Refresh danh sách
- **Lưu ý**: Admin KHÔNG tạo user trực tiếp, chỉ phân quyền

---

## 🚀 Flow đăng ký & phê duyệt

```
1. User mới → Truy cập /register
              ↓
2. Điền form (name, email, password)
              ↓
3. Submit → Tạo account với role PENDING
              ↓
4. User chưa thể login (role PENDING không hợp lệ)
              ↓
5. Admin → Vào /user-management
              ↓
6. Chọn role phù hợp cho user (STUDENT, TUTOR, etc.)
              ↓
7. User giờ có thể login với role đã được cấp
```

---

## 📝 API Endpoints mới

### Backend (`auth_routes.py`)

#### `POST /auth/register`
Đăng ký tài khoản mới

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "a.nguyen@hcmut.edu.vn",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công! Vui lòng đợi admin phê duyệt.",
  "user": {
    "id": "u7",
    "name": "Nguyễn Văn A",
    "email": "a.nguyen@hcmut.edu.vn",
    "role": "PENDING"
  }
}
```

**Response (400 - Email exists):**
```json
{
  "error": "Email already exists"
}
```

---

### Backend (`admin_routes.py`) - Đã có sẵn, giờ được dùng

#### `GET /admin/users`
Lấy danh sách tất cả users (cần quyền ADMIN)

**Response:**
```json
{
  "count": 7,
  "users": [
    {
      "id": "u1",
      "name": "Đỗ Hồng Phúc",
      "email": "tutor@hcmut.edu.vn",
      "role": "TUTOR"
    },
    {
      "id": "u7",
      "name": "Nguyễn Văn A",
      "email": "a.nguyen@hcmut.edu.vn",
      "role": "PENDING"
    }
  ]
}
```

#### `POST /admin/grant-role`
Cấp quyền cho user (cần quyền ADMIN)

**Request:**
```json
{
  "user_id": "u7",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "message": "Đã cập nhật quyền STUDENT thành công",
  "user": {
    "id": "u7",
    "name": "Nguyễn Văn A",
    "email": "a.nguyen@hcmut.edu.vn",
    "role": "STUDENT"
  }
}
```

---

## 🎨 Frontend Components

### `RegisterPage.jsx`
- Form đăng ký với validation đầy đủ
- Kiểm tra: email hợp lệ, password match, không để trống
- Modal thông báo thành công
- Auto redirect về `/login` sau khi đăng ký

### `UserManagementPage.jsx` (Cải thiện)
- Fetch users từ API thay vì dữ liệu giả
- Dropdown role có thể thay đổi thật
- Gọi API `grant-role` khi admin thay đổi role
- Button "Refresh danh sách" để reload data
- Ẩn form "Tạo user" cũ (không dùng nữa)

---

## 🔧 Roles có sẵn

| Role | Mô tả |
|------|-------|
| `PENDING` | Mặc định khi đăng ký, chưa có quyền gì |
| `STUDENT` | Sinh viên |
| `TUTOR` | Giảng viên/Tutor |
| `OFFICER` | Phòng Đào tạo/CTSV |
| `DEPARTMENT` | Khoa/Bộ môn |
| `UNIVERSITY_OFFICER` | Cán bộ trường |
| `ADMIN` | Quản trị viên |

---

## 🧪 Test Flow

### Test 1: Đăng ký user mới
1. Vào `http://127.0.0.1:5173/register`
2. Điền:
   - Name: Test User
   - Email: test@hcmut.edu.vn
   - Password: 123
   - Confirm: 123
3. Click "Đăng ký"
4. Thấy modal "Đăng ký thành công"
5. Auto redirect về `/login`

### Test 2: Admin phân quyền
1. Login với admin (email: admin@hcmut.edu.vn, pass: admin)
2. Vào `/user-management`
3. Tab "Phân quyền thủ công"
4. Tìm user "Test User" (role: PENDING)
5. Đổi role thành "STUDENT"
6. Thấy modal "Thành công"

### Test 3: User mới login
1. Logout admin
2. Login với test@hcmut.edu.vn / 123
3. Giờ đã login được (vì có role STUDENT)

---

## ⚠️ Lưu ý

1. **Email phải unique** - Không cho đăng ký trùng email
2. **Password minimum 3 ký tự** - Validation ở frontend
3. **Role PENDING không login được** - Phải admin cấp role trước
4. **Admin không tạo user** - Chỉ phân quyền cho user tự đăng ký

---

## 🐛 Troubleshooting

### Lỗi: "Email already exists"
→ Email đã được dùng, thử email khác

### Lỗi: "Không thể tải danh sách người dùng"
→ Kiểm tra backend đã chạy chưa (`python app.py`)
→ Kiểm tra token admin còn hợp lệ không

### User đăng ký rồi nhưng không thấy trong list
→ Click button "🔄 Refresh danh sách" ở UserManagement

---

## 📦 Files đã thay đổi

### Backend
- `backend/modules/integration/auth_routes.py` - Thêm endpoint `/auth/register`

### Frontend
- `frontend/src/pages/RegisterPage.jsx` - Form đăng ký hoàn chỉnh
- `frontend/src/pages/UserManagementPage.jsx` - Kết nối API thật
- `frontend/src/pages/LoginPage.jsx` - Đã có link đến register (không đổi)
- `frontend/src/App.jsx` - Route `/register` đã có sẵn (không đổi)

---

## ✅ Checklist hoàn thành

- [x] API đăng ký user mới
- [x] Trang đăng ký với form đầy đủ
- [x] Validation đầy đủ
- [x] User mới có role PENDING
- [x] Admin fetch real users từ API
- [x] Admin có thể thay đổi role thật
- [x] API grant-role hoạt động
- [x] Modal thông báo đẹp
- [x] Link giữa Login và Register
- [x] Documentation đầy đủ

---

🎉 **Dự án giờ đã có hệ thống đăng ký & quản lý user hoàn chỉnh!**
