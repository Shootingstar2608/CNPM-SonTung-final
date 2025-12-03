import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, LogOut } from 'lucide-react';
import heroBg from '../assets/slbk.jpg';
import logoBKTutor from '../assets/logo.png';

const UniversityOfficerHomePage = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const roleStored = (localStorage.getItem('user_role') || '').toUpperCase();
    if (roleStored !== 'UNIVERSITY_OFFICER') {
      navigate('/login', { replace: true });
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch('http://127.0.0.1:5000/info/overview', { headers })
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then(setOverview)
      .catch(() => {});

    fetch('http://127.0.0.1:5000/info/users', { headers })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ users: [] })))
      .then((b) => setUsers(b.users || []))
      .catch(() => {});

    fetch('http://127.0.0.1:5000/info/appointments', { headers })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ appointments: [] })))
      .then((b) => setAppointments(b.appointments || []))
      .catch(() => {});

    fetch('http://127.0.0.1:5000/info/documents', { headers })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ documents: [] })))
      .then((b) => setDocuments(b.documents || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avatarLabel = (() => {
    try {
      const ud = localStorage.getItem('user_data');
      return ud ? JSON.parse(ud).name.charAt(0).toUpperCase() : 'U';
    } catch (e) {
      return 'U';
    }
  })();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate('/university-officer-home')} className="flex items-center gap-2">
            <img src={logoBKTutor} alt="logo" className="h-9 w-auto" />
            <span className="font-extrabold text-2xl tracking-tight">BKTutor</span>
          </button>
          <nav className="hidden md:flex items-center gap-5">
            <button className="text-sm font-semibold py-1 text-blue-600 border-b-2 border-blue-600">Trang chủ</button>
            <button onClick={() => setInfoOpen(true)} className="text-sm font-semibold py-1 text-gray-700 hover:text-blue-600">Thông tin</button>
            <button onClick={() => navigate('/session-reports')} className="text-sm font-semibold py-1 text-gray-700 hover:text-blue-600">Báo cáo buổi học</button>
            <button onClick={() => navigate('/feedback-reports')} className="text-sm font-semibold py-1 text-gray-700 hover:text-blue-600">Phản hồi chất lượng</button>
          </nav>
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-gray-500" />
            <div className="relative">
              <button onClick={() => setMenuOpen((p) => !p)} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold">
                <span className="bg-purple-200 text-purple-800 rounded-full w-7 h-7 flex items-center justify-center">{avatarLabel}</span>
                <ChevronDown size={14} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border bg-white shadow-lg z-20">
                    <button onClick={() => navigate('/user-info')} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left"><User size={16} /> Thông tin cá nhân</button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left rounded-b-2xl"><LogOut size={16} /> Đăng xuất</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto mt-6 rounded-[32px] overflow-hidden border shadow-[0_30px_80px_-60px_rgba(15,98,254,0.8)]">
        <img src={heroBg} alt="BK campus" className="w-full h-64 md:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-500 mt-4">Trang chủ</div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-[20px] border border-gray-200 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-400">Users</p>
            <h3 className="text-2xl font-bold">{overview ? overview.users_count : '–'}</h3>
            <p className="text-sm text-gray-600 mt-2">Tổng số người dùng trong hệ thống</p>
          </div>
          <div className="rounded-[20px] border border-gray-200 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-400">Appointments</p>
            <h3 className="text-2xl font-bold">{overview ? overview.appointments_count : '–'}</h3>
            <p className="text-sm text-gray-600 mt-2">Số buổi đã tạo</p>
          </div>
          <div className="rounded-[20px] border border-gray-200 p-6 bg-white shadow-sm">
            <p className="text-sm text-gray-400">Documents</p>
            <h3 className="text-2xl font-bold">{overview ? overview.documents_count : '–'}</h3>
            <p className="text-sm text-gray-600 mt-2">Tài liệu học tập có sẵn</p>
          </div>
          <div 
            onClick={() => navigate('/feedback-reports')}
            className="rounded-[20px] border border-blue-200 p-6 bg-gradient-to-br from-blue-50 to-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-blue-600 font-semibold">📊 Phản hồi</p>
            <h3 className="text-2xl font-bold text-blue-700">Xem báo cáo</h3>
            <p className="text-sm text-gray-600 mt-2">Phản hồi chất lượng buổi học</p>
          </div>
        </div>
      </section>

      {infoOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInfoOpen(false)} />
          <div className="relative z-50 w-full max-w-5xl bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Quản lý thông tin</h3>
              <button onClick={() => setInfoOpen(false)} className="text-sm text-gray-600 px-3">Đóng</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold">Danh sách người dùng</h4>
                  <div className="mt-3 max-h-60 overflow-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2">ID</th>
                          <th className="text-left px-3 py-2">Name</th>
                          <th className="text-left px-3 py-2">Email</th>
                          <th className="text-left px-3 py-2">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t">
                            <td className="px-3 py-2">{u.id}</td>
                            <td className="px-3 py-2">{u.name}</td>
                            <td className="px-3 py-2">{u.email}</td>
                            <td className="px-3 py-2">{typeof u.role === 'string' ? u.role : (u.role && u.role.name)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Danh sách appointments</h4>
                  <div className="mt-3 max-h-60 overflow-auto border rounded-lg p-3 text-sm">
                    {appointments.map((a) => (
                      <div key={a.id} className="mb-3">
                        <div className="font-medium">{a.id} — {a.name}</div>
                        <div className="text-gray-500">{a.start_time} → {a.end_time} — {a.place}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Documents</h4>
                <div className="mt-3 max-h-40 overflow-auto border rounded-lg p-3 text-sm">
                  {documents.map((d) => (
                    <div key={d.id} className="mb-2">
                      <div className="font-medium">{d.id} — {d.title}</div>
                      <div className="text-gray-500">{d.course_code} — Uploaded by {d.uploader_id}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityOfficerHomePage;