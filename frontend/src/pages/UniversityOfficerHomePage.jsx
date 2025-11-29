import React, { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';

const UniversityOfficerHomePage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('http://127.0.0.1:5000/reporting/participation');
        if (resp.ok) setResults((await resp.json()).results || []);
      } catch (e) {}
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-xl font-bold mb-4">Phòng Đào tạo - Kết quả tham gia</h1>

        <section className="bg-white rounded p-6 border">
          <h3 className="font-semibold mb-3">Kết quả tham gia</h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 border-b">
              <tr><th className="py-2 text-left">Sinh viên</th><th className="py-2 text-left">Buổi</th><th className="py-2 text-left">Điểm</th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b"><td className="py-2">{r.student}</td><td>{r.session}</td><td>{r.score}</td></tr>
              ))}
              {results.length === 0 && <tr><td colSpan={3} className="py-4 text-gray-500 italic">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default UniversityOfficerHomePage;
