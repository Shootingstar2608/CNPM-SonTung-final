import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const API_BASE = 'http://127.0.0.1:5000';

    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch all appointments và filter những buổi mà student đã đăng ký
    fetch(`${API_BASE}/appointments/`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Cannot fetch appointments');
        const data = await res.json();
        const all = Array.isArray(data) ? data : (data.appointments || []);
        
        // Chỉ lấy appointments mà userId có trong current_slots (đã đăng ký)
        const myAppointments = all.filter((a) => {
          return (a.current_slots || []).includes(userId);
        });
        
        setAppointments(myAppointments);
      })
      .catch((e) => {
        console.error('Error fetching appointments:', e);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openFeedback = (appt) => {
    setSelected(appt);
    setRating(5);
    setComment('');
  };

  const submit = () => {
    if (!selected) return;
    setSubmitting(true);
    const token = localStorage.getItem('access_token');
    const studentId = localStorage.getItem('user_id');
    const API_BASE = 'http://127.0.0.1:5000';
    fetch(`${API_BASE}/info/appointments/${selected.id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ student_id: studentId, rating, comment })
    })
      .then((r) => r.json().then((b) => ({ ok: r.ok, body: b })))
      .then(({ ok, body }) => {
        if (!ok) throw body;
        // update local appointments list to include feedback
        setAppointments((prev) => prev.map((a) => (a.id === selected.id ? { ...a, feedback: [...(a.feedback||[]), body.feedback] } : a)));
        alert('Gửi phản hồi thành công. Cảm ơn bạn!');
        setSelected(null);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.error || 'Đã có lỗi khi gửi phản hồi');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Phản hồi chất lượng buổi học</h1>

        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="space-y-4">
            {appointments.length === 0 && <div>Bạn chưa có buổi học nào để phản hồi.</div>}
            {appointments.map((a) => (
              <div key={a.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm text-gray-500">{a.start_time} - {a.place}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/session-info/${a.id}`)} className="text-sm text-[#0F62FE]">Chi tiết</button>
                  <button onClick={() => openFeedback(a)} className="text-sm bg-[#0F62FE] text-white px-3 py-1 rounded">Phản hồi</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <div className="bg-white rounded-lg p-6 z-50 w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-3">Phản hồi: {selected.name}</h2>
              <label className="block text-sm mb-2">Đánh giá (1-5)</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded px-2 py-1 mb-3">
                {[5,4,3,2,1].map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
              <label className="block text-sm mb-2">Nội dung phản hồi</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border rounded p-2 mb-4" rows={5} />
              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded">Hủy</button>
                <button onClick={submit} disabled={submitting} className="px-4 py-2 bg-[#0F62FE] text-white rounded">{submitting ? 'Đang gửi...' : 'Gửi phản hồi'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FeedbackPage;
