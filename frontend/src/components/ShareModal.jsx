import React, { useState } from 'react';
import { X, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, onShowAlert, onConfirm }) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [userList, setUserList] = useState([]);

  // --- DỮ LIỆU ĐỒNG BỘ VỚI FILE database.py CỦA BACKEND ---
  // Backend hiện đang có 3 user này được khởi tạo trong init_db()
  const dbUsers = [
    { id: 'u1', name: 'Đỗ Hồng Phúc', email: 'tutor@hcmut.edu.vn', role: 'TUTOR' },
    { id: 'u2', name: 'Duy Khang', email: 'student@hcmut.edu.vn', role: 'STUDENT' },
    { id: 'u3', name: 'Tín', email: 'admin@hcmut.edu.vn', role: 'ADMIN' },
  ];

  const handleSearch = () => {
    // 1. Validate rỗng
    if (!searchTerm.trim()) {
      if (onShowAlert) {
        onShowAlert('error', 'Lỗi nhập liệu', 'Vui lòng nhập tên hoặc email người nhận.');
      }
      return;
    }

    const term = searchTerm.toLowerCase();

    // 2. Logic tìm kiếm: Ưu tiên tìm theo EMAIL vì API Backend share theo email
    // Tuy nhiên vẫn cho phép tìm theo tên để thuận tiện cho người dùng
    const results = dbUsers.filter(user =>
      user.email.toLowerCase().includes(term) ||
      user.name.toLowerCase().includes(term)
    );

    if (results.length > 0) {
      setUserList(results);
    } else {
      setUserList([]);
      if (onShowAlert) {
        onShowAlert(
          'warning',
          'Không tìm thấy',
          `Không tìm thấy người dùng nào khớp với "${searchTerm}" trong hệ thống`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-up min-h-[400px] flex flex-col">

        {/* Header Search */}
        <div className="p-6 border-b border-gray-100 flex gap-4 items-center relative bg-gray-50">
           <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                // Placeholder nhắc người dùng nhập Email
                placeholder="Nhập email (VD: student@hcmut...) hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                autoFocus
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>
              )}
           </div>

           <button
             onClick={handleSearch}
             className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
           >
             Tìm Kiếm
           </button>

           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200">
             <X size={20} />
           </button>
        </div>

        {/* Body Result */}
        <div className="flex-1 p-6 bg-white overflow-y-auto">
           {userList.length > 0 ? (
             <div className="space-y-3">
               <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Kết quả tìm kiếm</h4>
               {userList.map((user) => (
                 <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <User size={20} />
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{user.name}</h4>
                            {/* Hiển thị Role để dễ phân biệt */}
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">{user.role}</span>
                          </div>
                          <p className="text-xs text-gray-500">{user.email}</p>
                       </div>
                    </div>

                    {/* NÚT CHIA SẺ: Truyền EMAIL về vì API backend cần email */}
                    <button
                      onClick={() => onConfirm(user.email)}
                      className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      Chia sẻ
                    </button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[200px]">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                 <Search size={32} className="opacity-20" />
               </div>
               <p className="text-sm">Nhập <strong>email</strong> hoặc tên người dùng trong hệ thống (VD: Khang, Tín...)</p>
             </div>
           )}
        </div>

        {/* Footer (Pagination) */}
        {userList.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShareModal;