import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Upload, Share2, Download, Clock, ArrowLeft } from 'lucide-react'; // Import ArrowLeft

const HistoryPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/library/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const getActionConfig = (action) => {
    switch (action) {
      case 'VIEW': return { label: 'Đã xem', color: 'bg-blue-100 text-blue-600', icon: <Eye size={14}/> };
      case 'UPLOAD': return { label: 'Đã đăng tải', color: 'bg-green-100 text-green-600', icon: <Upload size={14}/> };
      case 'SENT': return { label: 'Đã chia sẻ', color: 'bg-orange-100 text-orange-600', icon: <Share2 size={14}/> };
      case 'RECEIVED': return { label: 'Được chia sẻ', color: 'bg-purple-100 text-purple-600', icon: <Download size={14}/> };
      default: return { label: action, color: 'bg-gray-100 text-gray-600', icon: <Clock size={14}/> };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700 pb-10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">›</span>
        <Link to="/resources" className="hover:text-blue-600">Tài liệu học tập</Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-gray-700">Lịch sử truy cập</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* NÚT QUAY LẠI */}
        <button
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4 transition-colors font-medium"
        >
            <ArrowLeft size={20} /> Quay lại Menu
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">Lịch sử hoạt động cá nhân</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            {loading ? (
                <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 w-40">Hoạt động</th>
                            <th className="px-6 py-4">Tên tài liệu</th>
                            <th className="px-6 py-4">Người dùng liên quan</th>
                            <th className="px-6 py-4 text-right">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.length > 0 ? logs.map((log) => {
                            const config = getActionConfig(log.action);
                            return (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
                                            {config.icon} {config.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{log.doc_title || 'Tài liệu không xác định'}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {log.action === 'SENT' && log.partner_name && <span>Đến: <span className="font-semibold text-gray-700">{log.partner_name}</span></span>}
                                        {log.action === 'RECEIVED' && log.partner_name && <span>Từ: <span className="font-semibold text-gray-700">{log.partner_name}</span></span>}
                                        {(log.action === 'VIEW' || log.action === 'UPLOAD') && <span className="text-gray-400 italic text-xs">- Bạn -</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">{log.timestamp}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-gray-400 italic">Chưa có lịch sử hoạt động nào được ghi nhận.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;