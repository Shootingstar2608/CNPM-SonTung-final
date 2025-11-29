import React, { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';

const DeptHomePage = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('http://127.0.0.1:5000/reporting/list');
        if (resp.ok) setReports((await resp.json()).reports || []);
      } catch (e) {}
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold mb-4">Khoa / Bộ môn - Xem báo cáo</h1>

        <section className="bg-white rounded p-6 border">
          <h3 className="font-semibold mb-3">Danh sách báo cáo</h3>
          <div className="divide-y">
            {reports.map(r => (
              <div key={r.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.owner} • {r.created_at}</div>
                </div>
                <div>
                  <a href="#" className="text-blue-600">Xem</a>
                </div>
              </div>
            ))}
            {reports.length === 0 && <div className="py-4 text-gray-500 italic">Không có báo cáo</div>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DeptHomePage;
