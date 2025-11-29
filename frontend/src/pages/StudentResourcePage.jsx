import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './StudentResourcePage.css';

const StudentResourcePage = () => {
  const [keyword, setKeyword] = useState('');
  const [course, setCourse] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy token (nếu có)
  const token = localStorage.getItem('access_token');

  // --- HÀM TÌM KIẾM ---
  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      // FIX 1: Dùng 127.0.0.1 thay vì localhost để ổn định hơn trên Windows
      const url = `http://127.0.0.1:5000/library?q=${keyword}&course=${course}`;

      console.log("Đang gọi API:", url); // Log để kiểm tra

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Chỉ gửi token nếu token tồn tại (tránh gửi chuỗi "null")
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        // Nếu lỗi 401/403/500...
        const errText = await response.text();
        throw new Error(`Lỗi Server (${response.status}): ${errText}`);
      }

      const data = await response.json();
      console.log("Dữ liệu nhận được:", data); // Log dữ liệu
      setDocuments(data);

    } catch (err) {
      console.error("Lỗi chi tiết:", err);
      // Hiển thị lỗi rõ ràng hơn: Failed to fetch nghĩa là không nối được tới server
      if (err.message === 'Failed to fetch') {
        setError('🔴 Không thể kết nối tới Backend. Hãy kiểm tra: 1. Server đã chạy chưa? 2. Đã cài flask-cors chưa?');
      } else {
        setError(err.message);
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (docId, link) => {
    try {
      // Gọi API ghi log (không quan trọng kết quả, cứ gọi rồi mở link)
      await fetch(`http://127.0.0.1:5000/library/${docId}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
    } catch (e) {
      console.warn("Không thể ghi log lịch sử", e);
    }
    window.open(link, '_blank');
  };

  // Tự động tìm kiếm khi vào trang
  useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Header />
      <div className="student-resource-container">
        <h1 className="page-title">📚 Tài nguyên học tập</h1>

        {/* Khung tìm kiếm */}
        <div className="search-area">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Nhập tên tài liệu, chủ đề..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="filter-group">
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Tất cả môn học</option>
              <option value="CO3001">CO3001 - CNPM</option>
              <option value="CO3005">CO3005 - PPL</option>
              <option value="MT1003">MT1003 - Giải tích 1</option>
              <option value="GENERAL">Tài liệu chung</option>
            </select>
          </div>
          <button className="btn-search" onClick={handleSearch}>Tìm kiếm</button>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="status-msg" style={{color: 'red', background: '#ffe6e6', padding: '15px', borderRadius: '5px'}}>
            {error}
          </div>
        )}

        {/* Danh sách kết quả */}
        <div className="document-grid">
          {loading && <div className="status-msg">⏳ Đang tải...</div>}

          {!loading && !error && documents.length === 0 && (
            <div className="status-msg">Không tìm thấy tài liệu nào.</div>
          )}

          {!loading && documents.map((doc) => (
            <div className="doc-card" key={doc.id}>
              <div className="doc-header">
                <span className="course-tag">{doc.course_code}</span>
                <small>{doc.created_at}</small>
              </div>
              <div className="doc-title">{doc.title}</div>
              <div className="doc-meta">
                <p>👤 {doc.uploader_name}</p>
                <p>📄 {doc.description}</p>
              </div>
              <button className="btn-view" onClick={() => handleViewDocument(doc.id, doc.link)}>
                👁️ Xem & Tải xuống
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentResourcePage;