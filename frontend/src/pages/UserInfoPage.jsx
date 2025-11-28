import React from 'react';
import Header from '../components/Header';
import { CloudUpload } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserInfoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <Header />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">Thông tin cá nhân</span>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg w-full md:w-fit overflow-hidden">
          <button className="px-8 py-3 text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">Thông tin cá nhân</button>
          <button className="px-8 py-3 bg-blue-50 text-blue-600 font-bold border-b-2 border-blue-500 text-sm">Chỉnh sửa thông tin sinh viên</button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
           
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Chỉnh sửa thông tin người dùng</h2>
              <span className="text-xs text-gray-400 italic">Làm cập nhật cuối: 11/05/2023</span>
           </div>

           {/* --- SECTION 1: THÔNG TIN CÁ NHÂN --- */}
           <div className="bg-blue-600 text-white px-4 py-2 font-bold text-sm mb-4 rounded-sm">Thông tin cá nhân</div>
           <div className="grid grid-cols-12 gap-6 mb-8">
              {/* Avatar Upload */}
              <div className="col-span-12 md:col-span-3">
                 <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                    <CloudUpload className="text-gray-400 mb-2" size={24}/>
                    <span className="text-xs font-bold text-gray-500">Tải lên ảnh đại diện</span>
                 </div>
              </div>
              
              {/* Fields */}
              <div className="col-span-12 md:col-span-9 grid grid-cols-4 gap-4">
                 <div className="col-span-1"><Label>MSSV / MSCB</Label><Input disabled value="20119293" /></div>
                 <div className="col-span-1"><Label>Họ lót</Label><Input /></div>
                 <div className="col-span-1"><Label>Tên</Label><Input /></div>
                 <div className="col-span-1"><Label>Ngày sinh</Label><Input placeholder="dd/mm/yyyy" /></div>
                 
                 <div className="col-span-1"><Label>Giới tính</Label><Input /></div>
                 <div className="col-span-1"><Label>CCCD</Label><Input /></div>
                 <div className="col-span-1"><Label>Ngày cấp</Label><Input /></div>
                 <div className="col-span-1"><Label>Nơi cấp</Label><Input /></div>
                 
                 <div className="col-span-4"><Label>Quê quán</Label><Input /></div>
              </div>
           </div>

           {/* --- SECTION 2: THÔNG TIN ĐÀO TẠO --- */}
           <div className="bg-blue-600 text-white px-4 py-2 font-bold text-sm mb-4 rounded-sm">Thông tin đào tạo</div>
           <div className="grid grid-cols-6 gap-4 mb-8">
              <div className="col-span-1"><Label>Đơn vị quản lý</Label><Input /></div>
              <div className="col-span-1"><Label>Khoa</Label><Input value="KH&KT Máy tính" /></div>
              <div className="col-span-1"><Label>Mã lớp</Label><Input value="MT23KHM1" /></div>
              <div className="col-span-1"><Label>Năm CTĐT</Label><Input value="2023" /></div>
              <div className="col-span-1"><Label>Ngành</Label><Input value="Khoa học Máy tính" /></div>
              <div className="col-span-1"><Label>HK bắt đầu</Label><Input value="HK231" /></div>
              
              <div className="col-span-1"><Label>Số HK đào tạo chuẩn</Label><Input value="8" /></div>
              <div className="col-span-1"><Label>Số HK đào tạo tối đa</Label><Input value="12" /></div>
              <div className="col-span-1"><Label>Loại hình</Label><Input value="Chính quy" /></div>
              <div className="col-span-1"><Label>Cơ sở</Label><Input value="ĐHBK Cơ sở 2" /></div>
              <div className="col-span-1"><Label>Tình trạng</Label><Input value="Đang học" /></div>
              <div className="col-span-1"><Label>Chương trình</Label><Input value="Tiêu chuẩn" /></div>
           </div>

           {/* --- SECTION 3: THÔNG TIN TÀI KHOẢN --- */}
           <div className="bg-blue-600 text-white px-4 py-2 font-bold text-sm mb-4 rounded-sm">Thông tin tài khoản</div>
           <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="col-span-1"><Label>Tên tài khoản</Label><Input /></div>
              <div className="col-span-1"><Label>Số tài khoản</Label><Input /></div>
              <div className="col-span-1"><Label>Tên ngân hàng</Label><Input /></div>
              <div className="col-span-1"><Label>CIF</Label><Input /></div>
           </div>

           {/* --- SECTION 4: THÔNG TIN KHÁC --- */}
           <div className="bg-blue-600 text-white px-4 py-2 font-bold text-sm mb-4 rounded-sm">Thông tin khác</div>
           <div className="mb-8">
              <Label>Ghi chú</Label>
              <textarea className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20 bg-gray-50/30"></textarea>
           </div>

           {/* Footer Buttons */}
           <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
              <button className="px-8 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-50">Thoát</button>
              <button className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 shadow-sm">Lưu thay đổi</button>
           </div>

        </div>
      </main>
    </div>
  );
};

// Helper Components cho gọn code
const Label = ({children}) => <label className="block text-xs font-bold text-gray-600 mb-1 text-center">{children}</label>;
const Input = ({...props}) => <input {...props} className="w-full border border-gray-200 rounded-full px-3 py-1.5 text-xs text-center focus:outline-none focus:border-blue-500 text-blue-600 font-medium placeholder-gray-300" />;

export default UserInfoPage;