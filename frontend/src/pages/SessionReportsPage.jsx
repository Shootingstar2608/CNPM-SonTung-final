import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/slbk.jpg';

const SessionReportsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch('http://127.0.0.1:5000/info/appointments', { headers })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ appointments: [] })))
      .then((b) => setAppointments(b.appointments || []))
      .catch(() => setAppointments([]));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight">BKTutor</span>
          </button>
          <div className="text-sm font-semibold">Báo cáo buổi học</div>
          <div />
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto mt-6 rounded-[12px] overflow-hidden">
        <img src={heroBg} alt="hero" className="w-full h-40 object-cover rounded" />
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Danh sách buổi học</h2>
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="p-4 border rounded-lg hover:shadow cursor-pointer" onClick={() => setSelected(a)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-sm text-gray-500">{a.start_time} → {a.end_time}</div>
                    </div>
                    <div className="text-sm text-gray-600">Room: {a.place}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden md:block">
            <h3 className="font-semibold mb-3">Chi tiết báo cáo</h3>
            {selected ? (
              <div className="border rounded-lg p-4">
                <div className="mb-2 font-bold">{selected.name}</div>
                <div className="text-sm text-gray-600 mb-2">{selected.start_time} → {selected.end_time}</div>
                <div className="mb-2">Phòng: {selected.place}</div>
                <div className="mb-2">Sĩ số: {selected.report ? `${selected.report.present}/${selected.report.capacity}` : '–'}</div>
                <div className="mb-2">Ghi chú: {selected.report ? selected.report.notes : '–'}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Chọn một buổi học để xem báo cáo</div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SessionReportsPage;
