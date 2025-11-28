# BKTutor - Frontend Project

Dự án Frontend cho hệ thống quản lý gia sư/sinh viên BKTutor.
Giao diện được xây dựng dựa trên **React (Vite)** và **Tailwind CSS**.

---

## 🛠 Tech Stack

* **Core:** [React](https://react.dev/) (Vite)
* **Styling:** [Tailwind CSS v4.0](https://tailwindcss.com/)
* **Routing:** [React Router DOM](https://reactrouter.com/) (v6)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Hướng dẫn cài đặt & Chạy

1.  **Clone dự án:**
    ```bash
    git clone <repository_url>
    cd bktutor-frontend
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Chạy môi trường Dev:**
    ```bash
    npm run dev
    ```
    Truy cập: `http://localhost:5173`

---

## 📦 Các tính năng đã triển khai (Implemented Use Cases)

Phiên bản hiện tại đã hoàn thiện giao diện và logic giả lập (Mock Data) cho 3 Use Case chính:

### 1. UC5: Quản lý Tài liệu học tập (Resources)
Hệ thống phân chia luồng chức năng riêng biệt cho Tutor và Sinh viên.

* **Menu Điều hướng:** Trang `ResourceMenuPage` với 3 thẻ lớn để chọn vai trò.
* **Chức năng cho Tutor (Đăng tải):**
    * **Trang:** `ResourcePage`.
    * **Logic:** Form nhập liệu có Validation. Nếu bấm đăng tải mà trường thông tin rỗng -> Hiện Modal báo lỗi (Icon đỏ).
    * **UI:** Giao diện kéo thả file, danh sách lớp học dạng Checkbox bên phải.
* **Chức năng cho Sinh viên (Tìm kiếm & Xem):**
    * **Trang:** `StudentResourcePage`.
    * **Logic Tìm kiếm:** Tìm tài liệu theo tên trong Mock Data.
    * **Phản hồi hệ thống:**
        * *Tìm thấy:* Hiện danh sách kết quả dạng thẻ.
        * *Không tìm thấy:* Hiện Modal **Cảnh báo (Warning - Icon Tam giác vàng)** thông báo không có kết quả.
        * *Rỗng:* Hiện Modal Lỗi (Error) yêu cầu nhập từ khóa.
* **Chức năng chung:**
    * **Lịch sử truy cập (`HistoryPage`):** Xem danh sách đã xem và nút **Xóa lịch sử** (Có Modal Confirm xác nhận trước khi xóa).
    * **Xem chi tiết (`DetailModal`):** Popup hiện thông tin chi tiết tài liệu khi bấm vào kết quả.
    * **Chia sẻ tài liệu (`ShareModal`):** Popup tìm kiếm người dùng để chia sẻ. Có logic báo lỗi Warning nếu nhập tên người dùng không tồn tại trong hệ thống.

### 2. UC6: Quản lý Người dùng & Phân quyền (User Management)
Dành cho vai trò Admin/Host.

* **Header riêng biệt:** Sử dụng `AdminHeader` (Menu khác biệt hoàn toàn với User thường).
* **Trang quản lý (`UserManagementPage`):** Bao gồm 3 tabs chức năng:
    1.  **Đồng bộ tự động:** Giao diện cấu hình API, Lịch đồng bộ, Kiểm tra kết nối.
    2.  **Phân quyền tự động:** Xem Log hoạt động và danh sách user được đồng bộ.
    3.  **Phân quyền thủ công:**
        * **Tìm kiếm:** Lọc user theo Tên hoặc MSSV/MSCB.
        * **Gợi ý tạo mới:** Nếu tìm kiếm không có kết quả -> Hiện Modal gợi ý chuyển xuống form tạo mới.
        * **Tạo mới người dùng:** Form nhập liệu có Validate chặt chẽ:
            * *Check rỗng:* Báo lỗi nếu thiếu thông tin.
            * *Check trùng:* Báo lỗi nếu nhập MSSV đã tồn tại.
        * **Real-time Update:** Sau khi tạo thành công, danh sách hiển thị được cập nhật ngay lập tức (State).

### 3. UC7: Thông tin cá nhân (User Profile)
Dành cho tất cả người dùng đã đăng nhập.

* **Truy cập:** Thông qua **Dropdown Menu** tại Avatar (góc phải Header).
* **Trang thông tin (`UserInfoPage`):**
    * Hiển thị chi tiết thông tin cá nhân, thông tin đào tạo, tài khoản ngân hàng.
    * Giao diện Form nhập liệu chia theo Section rõ ràng, mạch lạc.

---

## 🎨 Kiến trúc Header & Navigation

Hệ thống sử dụng cơ chế **Dynamic Header** tùy theo ngữ cảnh trang:

### 1. Header Người dùng (`src/components/Header.jsx`)
* **Đối tượng:** Sinh viên, Tutor, User thường.
* **Tính năng:**
    * **Active State:** Tự động highlight (tô xanh) menu đang đứng dựa trên `useLocation()` (Ví dụ: Đang ở `/resources/upload` thì menu "Tài liệu học tập" sẽ sáng).
    * **User Dropdown:** Bấm vào Avatar (chữ U) sẽ xổ xuống menu con chứa link tới `UserInfoPage`, Lịch, Đăng xuất.

### 2. Header Quản trị (`src/components/AdminHeader.jsx`)
* **Đối tượng:** Admin, Host.
* **Phạm vi áp dụng:** Chỉ xuất hiện ở các trang quản trị (`/user-management`).
* **Tính năng:** Menu đơn giản hóa, tập trung vào các tác vụ quản trị hệ thống (Trang chủ, Quản lý user, Danh sách Admin).

---

## 📂 Cấu trúc thư mục (Folder Structure)

```text
src/
├── assets/                 # Chứa hình ảnh, logo, static files
├── components/             # Các thành phần tái sử dụng
│   ├── AdminHeader.jsx     # Header riêng cho trang Admin
│   ├── Header.jsx          # Header chung cho User/Sinh viên
│   ├── DetailModal.jsx     # Modal xem chi tiết tài liệu (UC5)
│   ├── MinutesModal.jsx    # Modal biên bản buổi gặp
│   ├── RescheduleModal.jsx # Modal đổi lịch
│   ├── SearchBar.jsx       # Thanh tìm kiếm tái sử dụng
│   ├── ShareModal.jsx      # Modal tìm kiếm người dùng để chia sẻ (UC5)
│   └── StatusModal.jsx     # Modal thông báo đa năng (Success/Failed/Warning/Confirm)
├── pages/                  # Các trang màn hình chính
│   ├── FreeSchedulePage.jsx    # Thiết lập lịch rảnh
│   ├── HistoryPage.jsx         # Lịch sử truy cập (UC5)
│   ├── MeetingPage.jsx         # Trang chủ (Quản lý buổi gặp)
│   ├── OpenSessionPage.jsx     # Form mở buổi tư vấn
│   ├── ResourceMenuPage.jsx    # Menu chính Tài liệu (UC5)
│   ├── ResourcePage.jsx        # Đăng tải tài liệu - Tutor (UC5)
│   ├── SessionInfoPage.jsx     # Chi tiết buổi tư vấn
│   ├── StudentResourcePage.jsx # Tìm kiếm tài liệu - Sinh viên (UC5)
│   ├── UserInfoPage.jsx        # Thông tin cá nhân (UC7)
│   └── UserManagementPage.jsx  # Trang Admin - Phân quyền (UC6)
├── App.jsx                 # Cấu hình Routing
└── index.css               # Cấu hình Tailwind (@import "tailwindcss";)