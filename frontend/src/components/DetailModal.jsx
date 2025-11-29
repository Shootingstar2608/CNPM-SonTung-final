import React from 'react';
import { X, ExternalLink, Share2 } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, data, onShare }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Chi Tiết Tài Liệu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6 overflow-y-auto">

           <div className="flex gap-6 items-start">
              {/* Icon / Ảnh giả lập */}
              <div className="w-24 h-24 bg-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center text-blue-500 font-bold text-2xl border border-blue-200">
                  {data.course_code ? data.course_code.substring(0, 2) : 'DOC'}
              </div>

              <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">{data.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    Người đăng: <span className="font-semibold text-gray-700">{data.uploader_name || 'Unknown'}</span>
                  </p>
                  <p className="text-sm text-gray-500">Ngày đăng: {data.created_at}</p>
              </div>
           </div>

           <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mô tả nội dung</label>
               <p className="text-sm text-gray-700 leading-relaxed">
                   {data.description || 'Không có mô tả chi tiết cho tài liệu này.'}
               </p>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Môn học</label>
                   <div className="font-medium text-gray-800">{data.course_code}</div>
               </div>
               <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Định dạng</label>
                   <div className="font-medium text-gray-800">Online Link</div>
               </div>
           </div>

        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
           {/* Nút Xem (Mở link thật) */}
           <a
               href={data.link}
               target="_blank"
               rel="noreferrer"
               className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm no-underline"
           >
             <ExternalLink size={16} /> Mở Tài Liệu
           </a>

           {/* Nút Chia sẻ (Mở ShareModal) */}
           <button
               onClick={onShare}
               className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm"
           >
             <Share2 size={16} /> Chia Sẻ
           </button>
        </div>

      </div>
    </div>
  );
};

export default DetailModal;