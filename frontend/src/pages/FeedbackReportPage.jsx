import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Calendar, MapPin, User, MessageSquare } from 'lucide-react';

const FeedbackReportPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'UNIVERSITY_OFFICER') {
      navigate('/login', { replace: true });
      return;
    }

    fetchFeedbacks();
  }, [navigate]);

  const fetchFeedbacks = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://127.0.0.1:5000/info/feedbacks/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        setFilteredFeedbacks(data.feedbacks || []);
      } else {
        console.error('Failed to fetch feedbacks');
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = feedbacks;

    // Filter by search term
    if (searchTerm.trim()) {
      result = result.filter((fb) =>
        fb.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.appointment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.tutor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      result = result.filter((fb) => fb.rating === rating);
    }

    setFilteredFeedbacks(result);
  }, [searchTerm, ratingFilter, feedbacks]);

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: feedbacks.filter(fb => fb.rating === 5).length,
    4: feedbacks.filter(fb => fb.rating === 4).length,
    3: feedbacks.filter(fb => fb.rating === 3).length,
    2: feedbacks.filter(fb => fb.rating === 2).length,
    1: feedbacks.filter(fb => fb.rating === 1).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo Phản hồi Chất lượng</h1>
            <button
              onClick={() => navigate('/university-officer-home')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="text-sm text-gray-500 mb-1">Tổng phản hồi</div>
            <div className="text-3xl font-bold text-blue-600">{feedbacks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="text-sm text-gray-500 mb-1">Đánh giá trung bình</div>
            <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
              {averageRating} <Star size={24} className="fill-current" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="text-sm text-gray-500 mb-1">5 sao</div>
            <div className="text-3xl font-bold text-yellow-500">{ratingDistribution[5]}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="text-sm text-gray-500 mb-1">Dưới 3 sao</div>
            <div className="text-3xl font-bold text-red-600">{ratingDistribution[1] + ratingDistribution[2]}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sinh viên, môn học, giảng viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedbacks Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || ratingFilter !== 'all' 
                ? 'Không tìm thấy phản hồi phù hợp' 
                : 'Chưa có phản hồi nào'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Thời gian</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Môn học</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Giảng viên</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Sinh viên</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Đánh giá</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFeedbacks.map((fb) => (
                    <tr key={fb.feedback_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-xs">{formatDate(fb.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{fb.appointment_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} />
                          {fb.place}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{fb.tutor_name}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{fb.student_name}</div>
                        <div className="text-xs text-gray-500">{fb.student_email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${getRatingColor(fb.rating)}`}>
                          {fb.rating} <Star size={14} className="fill-current" />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedFeedback(fb)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedFeedback(null)} />
          <div className="bg-white rounded-xl shadow-2xl z-10 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Chi tiết phản hồi</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Môn học</div>
                    <div className="font-semibold text-gray-900">{selectedFeedback.appointment_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Thời gian học</div>
                    <div className="font-semibold text-gray-900">{selectedFeedback.start_time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Địa điểm</div>
                    <div className="font-semibold text-gray-900">{selectedFeedback.place}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Giảng viên</div>
                    <div className="font-semibold text-gray-900">{selectedFeedback.tutor_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Sinh viên</div>
                    <div className="font-semibold text-gray-900">{selectedFeedback.student_name}</div>
                    <div className="text-xs text-gray-500">{selectedFeedback.student_email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Thời gian phản hồi</div>
                    <div className="font-semibold text-gray-900">{formatDate(selectedFeedback.created_at)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">Đánh giá</div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${getRatingColor(selectedFeedback.rating)}`}>
                      {selectedFeedback.rating} <Star size={20} className="fill-current" />
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Nội dung phản hồi
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedFeedback.comment || '(Không có nhận xét)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackReportPage;
