import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

const ResourceMenuPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // State lưu vai trò
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy Profile để biết Role
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch('http://127.0.0.1:5000/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Lưu role (TUTOR, STUDENT, ADMIN...)
          setRole(data.user.role);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">Tài liệu học tập</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Tiêu đề chào mừng */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
                Xin chào, {role === 'TUTOR' ? 'Giảng viên/Tutor' : role === 'STUDENT' ? 'Sinh viên' : 'Quản trị viên'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Chọn chức năng bạn muốn thực hiện</p>
        </div>

        {/* Grid các chức năng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* --- CARD 1: Dành cho SINH VIÊN (Tìm kiếm) --- */}
          {/* Hiện nếu là STUDENT hoặc ADMIN */}
          {(role === 'STUDENT' || role === 'ADMIN') && (
            <div onClick={() => navigate('/resources/student')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:-translate-y-1">
              <div className="h-48 bg-[#6B5B95] flex items-center justify-center relative">
                 <img
                   src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                   alt="Sinh viên"
                   className="h-32 object-contain opacity-90"
                 />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-center font-bold text-gray-800 text-lg mb-4">Kho Tài Liệu & Tìm Kiếm</h3>
                <p className="text-center text-sm text-gray-500 mb-4 flex-1">
                    Tìm kiếm tài liệu học tập, xem chi tiết và tải về phục vụ việc học.
                </p>
                <div className="border-t pt-4 flex justify-center text-sm mt-auto">
                  <span className="text-blue-600 font-bold hover:underline">Truy cập ngay</span>
                </div>
              </div>
            </div>
          )}

          {/* --- CARD 2: Dành cho TUTOR (Đăng tải) --- */}
          {/* Hiện nếu là TUTOR hoặc ADMIN */}
          {(role === 'TUTOR' || role === 'ADMIN') && (
            <div
              onClick={() => navigate('/resources/upload')}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:-translate-y-1"
            >
              <div className="h-48 bg-[#584B7A] flex items-center justify-center relative">
                 <img
                   src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                   alt="Tutor"
                   className="h-32 object-contain opacity-90"
                 />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-center font-bold text-gray-800 text-lg mb-4">Đăng Tải Tài Liệu</h3>
                <p className="text-center text-sm text-gray-500 mb-4 flex-1">
                    Chia sẻ tài liệu, bài giảng và đề thi cho sinh viên.
                </p>
                <div className="border-t pt-4 flex justify-center text-sm mt-auto">
                  <span className="text-blue-600 font-bold hover:underline">Truy cập ngay</span>
                </div>
              </div>
            </div>
          )}

          {/* --- CARD 3: Lịch sử (AI CŨNG THẤY) --- */}
            <div
            onClick={() => navigate('/resources/history')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:-translate-y-1"
            >
            <div className="h-48 bg-blue-50 flex items-center justify-center relative">
               <img
                 src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                 alt="Lịch sử"
                 className="h-32 object-contain"
               />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-center font-bold text-gray-800 text-lg mb-4">Lịch Sử Hoạt Động</h3>
              <p className="text-center text-sm text-gray-500 mb-4 flex-1">
                  Xem lại nhật ký truy cập, các tài liệu đã xem hoặc đã chia sẻ.
              </p>
              <div className="border-t pt-4 flex justify-center text-sm mt-auto">
                <span className="text-blue-600 font-bold hover:underline">Xem lịch sử</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResourceMenuPage;