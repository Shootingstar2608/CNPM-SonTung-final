import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, User, Calendar, RefreshCcw, Save } from 'lucide-react';
import StatusModal from '../components/StatusModal';

const UserManagementPage = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [isAutoSyncOn, setIsAutoSyncOn] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // State quản lý danh sách người dùng (fetch từ API)
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);

  // State form tạo mới
  const [newUser, setNewUser] = useState({
    id: '', name: '', dob: '', email: '', role: 'PENDING'
  });

  // State Modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false, type: 'success', title: '', message: '', confirmText: 'OK', onConfirm: null
  });

  // Fetch users từ API khi component mount
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://127.0.0.1:5000/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const formattedUsers = data.users.map(u => ({
          id: u.id,
          name: u.name,
          dob: '---',
          email: u.email,
          role: u.role || 'PENDING',
          link: 'N/A'
        }));
        setUsers(formattedUsers);
        setDisplayedUsers(formattedUsers);
      } else {
        setStatusModal({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Không thể tải danh sách người dùng' });
      }
    } catch (e) {
      console.error(e);
      setStatusModal({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Lỗi kết nối server' });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: TÌM KIẾM ---
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setDisplayedUsers(users);
      return;
    }
    const results = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (results.length > 0) {
      setDisplayedUsers(results);
    } else {
      setDisplayedUsers([]);
      // Modal gợi ý tạo mới nếu không tìm thấy
      setStatusModal({
        isOpen: true,
        type: 'error-action',
        title: 'Failed',
        message: 'Người dùng không tồn tại, tạo mới người dùng chứ?',
        confirmText: 'Thêm',
        onConfirm: () => {
            setStatusModal({ ...statusModal, isOpen: false });
            setNewUser(prev => ({ ...prev, name: searchTerm })); // Điền sẵn tên
            setActiveTab('manual'); // Chắc chắn đang ở tab manual
            setTimeout(() => {
                document.getElementById('create-user-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
      });
    }
  };

  // --- LOGIC: TẠO MỚI NGƯỜI DÙNG ---
  const handleCreateUser = () => {
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Thông báo',
      message: 'Vui lòng yêu cầu người dùng tự đăng ký qua trang /register. Admin chỉ phân quyền, không tạo user.',
      confirmText: 'OK'
    });
  };

  // --- LOGIC: CẬP NHẬT ROLE ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://127.0.0.1:5000/admin/grant-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, role: newRole })
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Thành công',
          message: `Đã cập nhật quyền ${newRole} cho user ${userId}`,
          onConfirm: () => {
            setStatusModal({ ...statusModal, isOpen: false });
            fetchUsers();
          }
        });
      } else {
        setStatusModal({ isOpen: true, type: 'error', title: 'Lỗi', message: data.error || 'Không thể cập nhật role' });
      }
    } catch (e) {
      console.error(e);
      setStatusModal({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Lỗi kết nối server' });
    }
  };

  // --- RENDER TAB 1: ĐỒNG BỘ TỰ ĐỘNG ---
  const renderAutoSyncTab = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <h3 className="font-bold text-gray-800 text-lg">Tự động đồng bộ</h3>
        <div 
          onClick={() => setIsAutoSyncOn(!isAutoSyncOn)}
          className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isAutoSyncOn ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${isAutoSyncOn ? 'translate-x-7' : ''}`}></div>
        </div>
      </div>

      {/* Cài đặt lịch */}
      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Cài đặt lịch</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-gray-600 w-24">Thời gian</label>
              <input type="time" defaultValue="00:00" className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-blue-500 outline-none" />
           </div>
           <div className="flex items-center gap-4 relative">
              <label className="text-sm font-bold text-gray-600 w-28">Chọn ngày</label>
              <input type="date" className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-blue-500 outline-none" />
           </div>
           <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-gray-600 w-24">Tần suất</label>
              <select className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-blue-500 outline-none bg-white w-40">
                 <option>Hàng ngày</option>
                 <option>Hàng tuần</option>
                 <option>Hàng tháng</option>
              </select>
           </div>
           <div className="flex items-center justify-end gap-4">
              <span className="text-xs text-blue-500 italic">Đồng bộ lần cuối: 01/11/2025</span>
              <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Đồng bộ ngay</button>
           </div>
        </div>
      </div>

      {/* Cài đặt kết nối */}
      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Cài đặt kết nối</h4>
        <div className="space-y-4 max-w-3xl">
           <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-sm font-bold text-gray-600">DATACORE API URL</label>
              <input type="text" placeholder="https://api.datacore.com/v1..." className="col-span-9 border border-gray-300 rounded px-3 py-1.5 text-sm w-full outline-none focus:border-blue-500" />
           </div>
           <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-sm font-bold text-gray-600">API Key/Token</label>
              <input type="password" placeholder="••••••••••••" className="col-span-9 border border-gray-300 rounded px-3 py-1.5 text-sm w-full outline-none focus:border-blue-500" />
           </div>
           <div className="flex justify-end">
              <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Kiểm tra kết nối</button>
           </div>
        </div>
      </div>

      <div className="flex justify-end">
         <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-sm flex items-center gap-2">
            <Save size={16}/> Lưu cấu hình
         </button>
      </div>
    </div>
  );

  // --- RENDER TAB 2: PHÂN QUYỀN TỰ ĐỘNG ---
  const renderAutoRoleTab = () => (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
       {/* Sidebar Nhật ký */}
       <div className="lg:w-1/4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <RefreshCcw size={16} className="text-blue-600"/> Nhật ký hoạt động
             </h4>
             <div className="text-xs space-y-3 text-gray-600 border-t pt-3">
                <p><span className="font-bold text-gray-800">Trạng thái:</span> <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">Đã cập nhật</span></p>
                <p>Lần đồng bộ tự động cuối:<br/> <span className="italic text-gray-500">01/11/2025 00:00:01</span></p>
                <div className="bg-red-50 p-2 rounded border border-red-100">
                   <p className="font-bold text-red-600">Phát hiện lỗi:</p>
                   <p className="italic text-gray-500">2 user thiếu thông tin role.</p>
                   <a href="#" className="text-blue-500 underline italic hover:text-blue-700 block mt-1">Xem chi tiết log</a>
                </div>
             </div>
          </div>
       </div>

       {/* Main Table */}
       <div className="lg:w-3/4">
          {/* Reuse Search & Table Layout from Manual Tab for display only */}
          <div className="flex gap-4 mb-4">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Tìm kiếm trong log..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
             </div>
             <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm text-sm">Tìm kiếm</button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                 <tr>
                   <th className="px-4 py-3">MSSV</th>
                   <th className="px-4 py-3">Họ và tên</th>
                   <th className="px-4 py-3">Email</th>
                   <th className="px-4 py-3 text-center">Vai trò (Auto)</th>
                   <th className="px-4 py-3 text-right">Trạng thái</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 {users.map((user, i) => (
                   <tr key={i} className="hover:bg-gray-50">
                     <td className="px-4 py-3 text-gray-600">{user.id}</td>
                     <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                     <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                     <td className="px-4 py-3 text-center"><span className="border px-2 py-1 rounded text-xs bg-gray-100">{user.role}</span></td>
                     <td className="px-4 py-3 text-right">
                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Success</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  // --- RENDER TAB 3: PHÂN QUYỀN THỦ CÔNG ---
  const renderManualTab = () => (
    <div className="animate-fade-in">
        {/* Search */}
        <div className="flex gap-4 max-w-2xl mx-auto mb-8">
            <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập tên hoặc MSSV để tìm..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            </div>
            <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm text-sm">
            Tìm kiếm
            </button>
        </div>

        {/* Kết quả tìm kiếm */}
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Kết quả tìm kiếm ({displayedUsers.length}):</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg mb-10">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                <th className="px-4 py-3 whitespace-nowrap">MSSV / MSCB</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Ngày sinh</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-center">Vai trò</th>
                <th className="px-4 py-3 text-right">Lịch sử chỉnh sửa</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                <tr className="bg-white h-20">
                    <td colSpan="6" className="text-center text-gray-400 italic">Đang tải dữ liệu...</td>
                </tr>
                ) : displayedUsers.length > 0 ? (
                displayedUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-600">{user.id}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.dob}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                        <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:border-blue-500 cursor-pointer"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="TUTOR">TUTOR</option>
                            <option value="OFFICER">OFFICER</option>
                            <option value="DEPARTMENT">DEPARTMENT</option>
                            <option value="UNIVERSITY_OFFICER">UNIVERSITY_OFFICER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs italic">{user.link}</td>
                </tr>
                ))
                ) : (
                <tr className="bg-white h-20">
                    <td colSpan="6" className="text-center text-gray-400 italic">Không tìm thấy dữ liệu</td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Thông báo về registration */}
        <div id="create-user-section" className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">💡 Hướng dẫn thêm người dùng</h3>
            <p className="text-gray-600 text-sm mb-4">Admin không tạo user trực tiếp. Người dùng tự đăng ký qua <strong>/register</strong>, sau đó Admin phân quyền tại đây.</p>
            <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white font-bold rounded text-sm hover:bg-blue-700">
                🔄 Refresh danh sách
            </button>
        </div>

        {/* Form cũ - ẩn đi */}
        <div id="old-create-form" className="hidden">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Tạo mới người dùng</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                <div className="grid grid-cols-6 gap-4 text-xs font-bold text-gray-500 mb-2 px-2">
                    <div className="col-span-1">MSSV / MSCB</div>
                    <div className="col-span-1">Họ và tên</div>
                    <div className="col-span-1">Ngày sinh</div>
                    <div className="col-span-1">Email</div>
                    <div className="col-span-1 text-center">Vai trò</div>
                    <div className="col-span-1 text-right"></div>
                </div>

                <div className="grid grid-cols-6 gap-4 items-center bg-white border border-gray-200 rounded-md p-2 shadow-sm">
                    <div className="col-span-1">
                        <input type="text" placeholder="Nhập mã số..." value={newUser.id} onChange={(e) => setNewUser({...newUser, id: e.target.value})} className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm py-1"/>
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User size={12}/></div>
                        <input type="text" placeholder="Nhập tên..." value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm py-1 text-blue-600 font-medium"/>
                    </div>
                    <div className="col-span-1">
                        <input type="text" placeholder="dd/mm/yyyy" value={newUser.dob} onChange={(e) => setNewUser({...newUser, dob: e.target.value})} className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm py-1 text-gray-500"/>
                    </div>
                    <div className="col-span-1">
                        <input type="text" placeholder="Tự động tạo..." value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none text-sm py-1 text-gray-500"/>
                    </div>
                    <div className="col-span-1">
                        <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-xs cursor-pointer">
                            <option value="Sinh viên">Sinh viên</option>
                            <option value="Tutor">Tutor</option>
                            <option value="Phòng ĐT / CTSV">Phòng ĐT / CTSV</option>
                            <option value="Khoa / Bộ môn">Khoa / Bộ môn</option>
                        </select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                        <button onClick={handleCreateUser} className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded text-xs hover:bg-blue-700 shadow-sm">
                            Tạo mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">›</span>
        <span>Quản lý người dùng và phân quyền</span>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">
            {activeTab === 'auto-sync' ? 'Đồng bộ dữ liệu tự động' : activeTab === 'auto-role' ? 'Phân quyền tự động' : 'Phân quyền thủ công'}
        </span>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Trang Quản lý dữ liệu và phân quyền</h1>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm w-full md:w-fit overflow-hidden">
          <button onClick={() => setActiveTab('auto-sync')} className={`px-8 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'auto-sync' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}>Đồng bộ dữ liệu tự động</button>
          <button onClick={() => setActiveTab('auto-role')} className={`px-8 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'auto-role' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}>Phân quyền tự động</button>
          <button onClick={() => setActiveTab('manual')} className={`px-8 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'manual' ? 'bg-orange-50 text-blue-600 border-blue-500' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}>Phân quyền thủ công</button>
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px]">
           {activeTab === 'auto-sync' && renderAutoSyncTab()}
           {activeTab === 'auto-role' && renderAutoRoleTab()}
           {activeTab === 'manual' && renderManualTab()}
        </div>
      </main>

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        onConfirm={statusModal.onConfirm} 
        confirmText={statusModal.confirmText} 
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  );
};

export default UserManagementPage;