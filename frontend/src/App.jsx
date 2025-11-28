import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- IMPORT CÁC TRANG (PAGES) ---
// Đảm bảo tên file trong thư mục src/pages đúng y hệt như này
import MeetingPage from './pages/MeetingPage';
import OpenSessionPage from './pages/OpenSessionPage';
import FreeSchedulePage from './pages/FreeSchedulePage';
import SessionInfoPage from './pages/SessionInfoPage';

import ResourceMenuPage from './pages/ResourceMenuPage';
import ResourcePage from './pages/ResourcePage';
import HistoryPage from './pages/HistoryPage';
import StudentResourcePage from './pages/StudentResourcePage';

import UserManagementPage from './pages/UserManagementPage';
import UserInfoPage from './pages/UserInfoPage'; // <--- Trang mới nhất

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- NHÓM 1: QUẢN LÝ BUỔI GẶP (Trang chủ) --- */}
        <Route path="/" element={<MeetingPage />} />
        <Route path="/create-session" element={<OpenSessionPage />} />
        <Route path="/free-schedule" element={<FreeSchedulePage />} />
        <Route path="/session-info" element={<SessionInfoPage />} />

        {/* --- NHÓM 2: TÀI LIỆU HỌC TẬP --- */}
        {/* Menu chính */}
        <Route path="/resources" element={<ResourceMenuPage />} />
        {/* Upload (Tutor) */}
        <Route path="/resources/upload" element={<ResourcePage />} />
        {/* Lịch sử */}
        <Route path="/resources/history" element={<HistoryPage />} />
        {/* Tìm kiếm (Sinh viên) */}
        <Route path="/resources/student" element={<StudentResourcePage />} />

        {/* --- NHÓM 3: QUẢN TRỊ (ADMIN) --- */}
        <Route path="/user-management" element={<UserManagementPage />} />

        {/* --- NHÓM 4: THÔNG TIN CÁ NHÂN (USER) --- */}
        <Route path="/user-info" element={<UserInfoPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;