import React, { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';

const OfficerHomePage = () => {
  const [summary, setSummary] = useState(null);
  const [allocPayload, setAllocPayload] = useState({ note: '', items: [] });

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('http://127.0.0.1:5000/reporting/summary');
        if (resp.ok) setSummary(await resp.json());
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleAllocate = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:5000/reporting/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocPayload)
      });
      if (resp.ok) {
        alert('Phân bổ lưu thành công');
        setAllocPayload({ note: '', items: [] });
      } else {
        alert('Lỗi khi lưu phân bổ');
      }
    } catch (e) {
      alert('Lỗi kết nối');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold mb-4">Phòng Công tác Sinh viên - Báo cáo & Phân bổ</h1>

        <section className="bg-white rounded p-6 mb-6 border">
          <h3 className="font-semibold mb-2">Báo cáo tổng quan</h3>
          <pre className="text-xs bg-gray-50 p-3 rounded">{summary ? JSON.stringify(summary, null, 2) : 'Đang tải...'}</pre>
        </section>

        <section className="bg-white rounded p-6 border">
          <h3 className="font-semibold mb-2">Phân bổ nguồn lực</h3>
          <div className="space-y-3">
            <textarea className="w-full border p-2 rounded" placeholder="Ghi chú phân bổ" value={allocPayload.note}
              onChange={(e) => setAllocPayload(prev => ({ ...prev, note: e.target.value }))} />
            <div className="flex gap-3">
              <button onClick={handleAllocate} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu phân bổ</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OfficerHomePage;
