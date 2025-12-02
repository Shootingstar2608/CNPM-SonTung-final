import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/slbk.jpg';

const DepartmentStatsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({ score: '', conduct_points: '', scholarship_level: '' });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch('http://127.0.0.1:5000/info/appointments', { headers }).then(r => r.ok ? r.json() : { appointments: [] }),
      fetch('http://127.0.0.1:5000/info/users', { headers }).then(r => r.ok ? r.json() : { users: [] })
    ]).then(([apptsBody, usersBody]) => {
      const appts = apptsBody.appointments || [];
      const us = usersBody.users || [];
      setAppointments(appts);
      setUsers(us);

      // Compute simple stats:
      // - sessions per tutor
      const perTutor = {};
      let totalPresent = 0;
      let totalCapacity = 0;
      const roomCounts = {};

      appts.forEach(a => {
        const tutor = a.tutor_id || 'unknown';
        perTutor[tutor] = (perTutor[tutor] || 0) + 1;
        if (a.report) {
          totalPresent += Number(a.report.present || 0);
          totalCapacity += Number(a.report.capacity || 0);
        }
        const room = a.place || 'Unknown';
        roomCounts[room] = (roomCounts[room] || 0) + 1;
      });

      const avgAttendance = totalCapacity > 0 ? (totalPresent / totalCapacity) * 100 : null;

      setStats({ perTutor, totalSessions: appts.length, avgAttendance, roomCounts });
    }).catch(() => {
      setAppointments([]);
      setUsers([]);
      setStats({ perTutor: {}, totalSessions: 0, avgAttendance: null, roomCounts: {} });
    });
  }, []);

  const openEdit = (u) => {
    setSelectedStudent(u);
    setForm({
      score: u.score ?? '',
      conduct_points: u.conduct_points ?? '',
      scholarship_level: u.scholarship_level ?? ''
    });
    setEditOpen(true);
  };

  const saveStudent = async () => {
    if (!selectedStudent) return;
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const body = {
      score: form.score === '' ? null : Number(form.score),
      conduct_points: form.conduct_points === '' ? null : Number(form.conduct_points),
      scholarship_level: form.scholarship_level || null
    };

    const res = await fetch(`http://127.0.0.1:5000/info/users/${selectedStudent.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const j = await res.json();
      const updated = j.user;
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
      setEditOpen(false);
      setSelectedStudent(null);
    } else {
      // simple error handling
      alert('Không thể lưu. Hãy kiểm tra quyền hoặc backend.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight">BKTutor</span>
          </button>
          <div className="text-sm font-semibold">Thống kê Khoa/Phòng</div>
          <div />
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto mt-6 rounded-[12px] overflow-hidden">
        <img src={heroBg} alt="hero" className="w-full h-40 object-cover rounded" />
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold mb-4">Thống kê buổi học</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Tổng số buổi</div>
            <div className="text-2xl font-bold">{stats ? stats.totalSessions : '–'}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Sĩ số trung bình</div>
            <div className="text-2xl font-bold">{stats && stats.avgAttendance !== null ? `${stats.avgAttendance.toFixed(1)}%` : '–'}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Số tutors</div>
            <div className="text-2xl font-bold">{Object.keys(stats ? stats.perTutor : {}).length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Buổi theo giảng viên</h3>
            <ul className="space-y-2">
              {stats && Object.entries(stats.perTutor).map(([tid, count]) => {
                const u = users.find(x => x.id === tid);
                return (
                  <li key={tid} className="flex items-center justify-between">
                    <div>{u ? u.name : tid}</div>
                    <div className="font-semibold">{count}</div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Buổi theo phòng</h3>
            <ul className="space-y-2">
              {stats && Object.entries(stats.roomCounts).map(([room, cnt]) => (
                <li key={room} className="flex items-center justify-between">
                  <div>{room}</div>
                  <div className="font-semibold">{cnt}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Danh sách sinh viên (Cập nhật điểm)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.filter(u => (u.role || '').toString().toUpperCase() === 'STUDENT').map(u => (
              <div key={u.id} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-sm text-gray-500">Score: {u.score ?? '–'} · Conduct: {u.conduct_points ?? '–'} · Scholarship: {u.scholarship_level ?? '–'}</div>
                </div>
                <div>
                  <button onClick={() => openEdit(u)} className="px-3 py-1 bg-blue-600 text-white rounded">Sửa</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {editOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditOpen(false)} />
            <div className="bg-white p-6 rounded-lg z-60 w-full max-w-md">
              <h4 className="font-bold mb-3">Cập nhật điểm - {selectedStudent.name}</h4>
              <label className="block mb-2 text-sm">Điểm (score)</label>
              <input value={form.score} onChange={e => setForm(f => ({...f, score: e.target.value}))} className="w-full border px-3 py-2 rounded mb-3" />
              <label className="block mb-2 text-sm">Điểm rèn luyện (conduct_points)</label>
              <input value={form.conduct_points} onChange={e => setForm(f => ({...f, conduct_points: e.target.value}))} className="w-full border px-3 py-2 rounded mb-3" />
              <label className="block mb-2 text-sm">Mức xét học bổng (scholarship_level)</label>
              <input value={form.scholarship_level} onChange={e => setForm(f => ({...f, scholarship_level: e.target.value}))} className="w-full border px-3 py-2 rounded mb-4" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditOpen(false)} className="px-4 py-2 border rounded">Hủy</button>
                <button onClick={saveStudent} className="px-4 py-2 bg-green-600 text-white rounded">Lưu</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DepartmentStatsPage;
