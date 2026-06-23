'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { BookOpen, Calendar, Tag, Loader2, AlertCircle, Play, Video } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuidesSection() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal display for details
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch('/api/guides');
        setGuides(data || []);
      } catch (err: any) {
        console.error('Fetch public guides error:', err);
        setError('Không thể tải cẩm nang chiến dịch. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const openGuideDetail = async (guide: any) => {
    try {
      const detail = await apiFetch(`/api/guides/${guide.slug}`);
      setSelectedGuide(detail);
    } catch (err) {
      console.error(err);
      setSelectedGuide(guide); // Fallback to basic list data
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Introduction */}
      <div>
        <h3 className="text-lg font-black text-eco-ink uppercase tracking-tight font-display-campaign">
          CẨM NANG LƯỚT XANH & HÀNH TRÌNH ĐÔ THỊ
        </h3>
        <p className="text-xs text-eco-muted mt-1 leading-normal">
          Khám phá các cẩm nang du lịch xanh, mẹo di chuyển metro và bản tin cộng đồng EcoTransit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Guides List */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-black text-eco-primary uppercase tracking-wider">
            📖 Bài viết & Cẩm nang hướng dẫn
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-eco-muted">
              <Loader2 className="w-6 h-6 animate-spin text-eco-primary mb-2" />
              <p className="text-[10px] font-bold">Đang tải danh sách bài viết...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          ) : guides.length === 0 ? (
            <div className="p-8 text-center bg-eco-soft/50 border border-dashed border-gray-200 rounded-3xl text-eco-muted">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-bold">Hiện tại chưa có bài viết cẩm nang nào được xuất bản.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => openGuideDetail(guide)}
                  className="bg-white border border-eco-primary/10 hover:border-eco-primary/30 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {guide.tags && guide.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-eco-mint text-eco-primary rounded-md">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <h5 className="text-xs font-black text-eco-ink line-clamp-2 leading-snug">
                      {guide.title}
                    </h5>
                    <p className="text-[10px] text-eco-muted line-clamp-2 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-eco-primary/5 text-[9px] text-eco-muted font-bold">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(guide.createdAt).toLocaleDateString('vi-VN')}</span>
                    </span>
                    <span className="text-eco-primary font-black uppercase tracking-wider">Đọc tiếp →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Campaign Video / Feed Placeholder */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-black text-eco-ink uppercase tracking-wider">
            🎬 Video & Social Feed chiến dịch
          </h4>
          
          <div className="bg-slate-950 text-white rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] text-center shadow-lg">
            
            {/* Visual background element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 mb-3 animate-pulse">
              <Video className="w-6 h-6" />
            </div>

            <h5 className="text-xs font-black tracking-wider uppercase text-emerald-400">Video chiến dịch & Tin tức</h5>
            <p className="text-[10px] text-white/50 max-w-xs mt-2 leading-relaxed font-semibold">
              Chưa có nội dung mới. Hãy quay lại sau nhé.<br />
              Những câu chuyện xanh mới sẽ sớm xuất hiện tại đây.
            </p>

          </div>
        </div>

      </div>

      {/* Guide Detail Modal Popup */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-eco-primary/10 flex flex-col justify-between max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-eco-primary/10 bg-eco-soft/40 flex justify-between items-start shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase bg-eco-ink text-white px-2 py-0.5 rounded-md tracking-wider">
                  Chi tiết cẩm nang
                </span>
                <h4 className="text-sm sm:text-base font-black text-eco-ink mt-2 leading-snug">
                  {selectedGuide.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-eco-muted hover:text-eco-ink font-bold text-lg p-1"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-eco-ink">
              <p className="italic text-eco-muted border-l-2 border-eco-accentGreen pl-3 py-0.5">
                {selectedGuide.excerpt}
              </p>
              
              <div className="whitespace-pre-line text-[11px] font-medium leading-relaxed bg-eco-soft/30 p-4 rounded-2xl border border-eco-primary/5">
                {selectedGuide.content}
              </div>

              {selectedGuide.tags && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedGuide.tags.map((t: string) => (
                    <span key={t} className="text-[9px] font-bold bg-eco-mint text-eco-primary px-2.5 py-0.5 rounded-lg">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-eco-primary/10 bg-eco-soft/40 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedGuide(null)}
                className="bg-eco-ink hover:bg-eco-primary text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
