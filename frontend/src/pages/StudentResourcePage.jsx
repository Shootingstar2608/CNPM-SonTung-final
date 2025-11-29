import React, { useState } from 'react';
import Header from '../components/Header';
import { Search, Filter, ExternalLink, Share2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DetailModal from '../components/DetailModal';
import ShareModal from '../components/ShareModal';
import StatusModal from '../components/StatusModal';

// Danh sách môn học để hiển thị trong Dropdown
const MOCK_COURSES = [
    { code: "GENERAL", name: "Tài liệu chung" },
    { code: "CH1003", name: "Hóa đại cương" },
    { code: "SP1037", name: "Tư tưởng Hồ Chí Minh" },
    { code: "CO2001", name: "Kỹ năng Chuyên nghiệp cho Kỹ sư" },
    { code: "CO3001", name: "Công nghệ Phần mềm" },
    { code: "CO3005", name: "Nguyên lý Ngôn ngữ Lập trình" },
    { code: "CO3093", name: "Mạng máy tính" },
    { code: "CO3011", name: "Quản lý Dự án Phần mềm" },
    { code: "CO3013", name: "Xây dựng Chương trình Dịch" },
    { code: "CO3015", name: "Kiểm tra Phần mềm" },
    { code: "CO3017", name: "Kiến trúc Phần mềm" },
    { code: "CO3021", name: "Hệ Quản trị Cơ sở Dữ Liệu" },
    { code: "CO3023", name: "CSDL Phân tán và Hướng đối tượng" },
    { code: "CO3027", name: "Thương mại Điện tử" },
    { code: "CO3029", name: "Khai phá Dữ liệu" },
    { code: "CO3031", name: "Phân tích và Thiết kế Giải Thuật" },
    { code: "CO3033", name: "Bảo mật Hệ thống Thông tin" },
    { code: "CO3035", name: "Hệ thời gian thực" },
    { code: "CO3037", name: "Phát triển Ứng dụng IoT" },
    { code: "CO3041", name: "Hệ thống Thông minh" },
    { code: "CO3043", name: "Phát triển Ứng dụng Di động" },
    { code: "CO3045", name: "Lập trình Game" },
    { code: "CO3047", name: "Mạng máy tính nâng cao" },
    { code: "CO3049", name: "Lập trình Web" },
    { code: "CO3051", name: "Hệ thống thiết bị di động" },
    { code: "CO3057", name: "Xử lý Ảnh số và Thị giác Máy tính" },
    { code: "CO3059", name: "Đồ họa Máy tính" },
    { code: "CO3061", name: "Nhập môn Trí tuệ Nhân tạo" },
    { code: "CO3065", name: "Công nghệ Phần mềm Nâng cao" },
    { code: "CO3067", name: "Tính toán Song song" },
    { code: "CO3069", name: "Mật mã và An ninh mạng" },
    { code: "CO3071", name: "Hệ phân bố" },
    { code: "CO3083", name: "Mật mã học và Mã hóa Thông tin" },
    { code: "CO3085", name: "Xử lý Ngôn ngữ Tự nhiên" },
    { code: "CO3089", name: "Chủ đề Nâng cao KHMT" },
    { code: "CO3101", name: "Đồ án Tổng hợp - AI" },
    { code: "CO3103", name: "Đồ án Tổng hợp - CNPM" },
    { code: "CO3105", name: "Đồ án Tổng hợp - HTTT" },
    { code: "CO3109", name: "Thực tập Đồ án Đa ngành - CNPM" },
    { code: "CO4031", name: "Kho dữ Liệu và Hỗ trợ Quyết định" },
    { code: "TH3636", name: "Đặc sản Nem chua" }
];

const StudentResourcePage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [courseCode, setCourseCode] = useState('');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [status, setStatus] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const token = localStorage.getItem('access_token');

  const fetchDocuments = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const queryParams = new URLSearchParams({ q: keyword, course: courseCode }).toString();
      const response = await fetch(`http://127.0.0.1:5000/library/?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (doc) => {
    if (token) {
        try {
            await fetch(`http://127.0.0.1:5000/library/${doc.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.warn(e); }
    }
    setSelectedDoc(doc);
    setIsDetailOpen(true);
  };

  const openShareFromDetail = () => {
    setIsDetailOpen(false);
    setIsShareOpen(true);
  };

  const handleShareSubmit = async (receiverEmail) => {
    if (!selectedDoc) return;
    try {
      const res = await fetch('http://127.0.0.1:5000/library/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ doc_id: selectedDoc.id, receiver_email: receiverEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setIsShareOpen(false);
        setStatus({ isOpen: true, type: 'success', title: 'Thành công', message: `Đã chia sẻ tài liệu cho ${receiverEmail}` });
      } else {
        setStatus({ isOpen: true, type: 'error', title: 'Lỗi chia sẻ', message: data.error || 'Không tìm thấy người dùng này.' });
      }
    } catch (err) {
      setStatus({ isOpen: true, type: 'error', title: 'Lỗi hệ thống', message: 'Không thể kết nối đến server.' });
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
        <span className="font-medium text-gray-700">Tìm kiếm tài liệu</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* NÚT QUAY LẠI */}
        <button
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-4 transition-colors font-medium"
        >
            <ArrowLeft size={20} /> Quay lại Menu
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Kho Tài Liệu Sinh Viên</h1>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Nhập tên tài liệu..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
            />
          </div>
          <div className="md:w-80 relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

             {/* DROPDOWN DANH SÁCH MÔN HỌC */}
             <select
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white truncate"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
             >
                <option value="">-- Tất cả môn học --</option>
                {MOCK_COURSES.map((course) => (
                    <option key={course.code} value={course.code}>
                        {course.code} - {course.name}
                    </option>
                ))}
             </select>
             {/* Mũi tên custom cho select */}
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
          <button onClick={fetchDocuments} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Tìm Kiếm
          </button>
        </div>

        {!hasSearched ? (
           <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nhập từ khóa và bấm tìm kiếm để bắt đầu...</p>
           </div>
        ) : loading ? (
            <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.length > 0 ? documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">{doc.course_code}</span>
                        <span className="text-xs text-gray-400">{doc.created_at?.split(' ')[0]}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2" title={doc.title}>{doc.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{doc.description || 'Không có mô tả chi tiết'}</p>
                    <div className="border-t pt-3 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">{doc.uploader_name ? doc.uploader_name.charAt(0) : 'U'}</div>
                            <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">{doc.uploader_name}</span>
                        </div>
                        <button onClick={() => handleViewClick(doc)} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer">Xem chi tiết</button>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">Không tìm thấy tài liệu nào phù hợp với từ khóa "{keyword}".</div>
            )}
            </div>
        )}
      </main>

      <DetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedDoc} onShare={openShareFromDetail} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} onConfirm={(userEmail) => handleShareSubmit(userEmail)} onShowAlert={(type, title, msg) => setStatus({ isOpen: true, type, title, message: msg })} />
      <StatusModal isOpen={status.isOpen} onClose={() => setStatus({ ...status, isOpen: false })} type={status.type} title={status.title} message={status.message} />
    </div>
  );
};

export default StudentResourcePage;