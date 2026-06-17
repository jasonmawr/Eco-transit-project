'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, Star, FileText, ChevronRight, MessageSquare, PlusCircle, LogIn, Sparkles, Send, Loader2, X } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface StationExperienceProps {
  selectedStationId?: string;
  onStationSelect?: (stationId: string) => void;
  user: any;
  onLoginClick: () => void;
}

export default function StationExperience({
  selectedStationId,
  onStationSelect,
  user,
  onLoginClick,
}: StationExperienceProps) {
  const [stations, setStations] = useState<any[]>([]);
  const [activeStationId, setActiveStationId] = useState<string>('');
  const [experienceData, setExperienceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Tất cả');

  // Place & Guide Details drawer state
  const [activePlace, setActivePlace] = useState<any>(null);
  const [activeGuide, setActiveGuide] = useState<any>(null);

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch all stations for browsing dropdown
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await apiFetch('/api/stations');
        setStations(data);
        // Default select first station if none passed
        if (data.length > 0 && !selectedStationId) {
          setActiveStationId(data[0].id);
          if (onStationSelect) onStationSelect(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch stations list:', err);
      }
    };
    fetchStations();
  }, []);

  // Update active station when prop changes
  useEffect(() => {
    if (selectedStationId) {
      setActiveStationId(selectedStationId);
    }
  }, [selectedStationId]);

  // Fetch experience data for active station
  useEffect(() => {
    if (!activeStationId) return;

    const fetchExperience = async () => {
      setLoading(true);
      setCategoryFilter('Tất cả');
      setReviewSuccess(null);
      setReviewError(null);
      try {
        const data = await apiFetch(`/api/stations/${activeStationId}/experience`);
        setExperienceData(data);
      } catch (err) {
        console.error('Failed to fetch experience details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [activeStationId]);

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setActiveStationId(value);
    if (onStationSelect) onStationSelect(value);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(null);
    setReviewError(null);

    if (content.trim().length < 10) {
      setReviewError('Nội dung đánh giá phải dài ít nhất 10 ký tự.');
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        stationId: activeStationId,
        rating,
        content,
        displayName: displayName.trim() || undefined,
      };

      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setReviewSuccess(res.message || 'Đánh giá của bạn đã được gửi và đang chờ ban quản trị duyệt.');
      setContent('');
      setDisplayName('');
      setRating(5);
    } catch (err: any) {
      setReviewError(err.message || 'Có lỗi xảy ra khi gửi nhận xét của bạn.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Convert technical category names to localized strings
  const localizeCategory = (cat: string) => {
    const mapping: Record<string, string> = {
      cafe: 'Cà phê',
      food: 'Ẩm thực',
      shopping: 'Mua sắm',
      service: 'Dịch vụ',
      attraction: 'Tham quan',
      'study/work friendly': 'Học & Làm việc',
    };
    return mapping[cat.toLowerCase()] || cat;
  };

  const filteredPlaces = experienceData?.places?.filter((p: any) => {
    if (categoryFilter === 'Tất cả') return true;
    return localizeCategory(p.category) === categoryFilter;
  }) || [];

  return (
    <section id="stations" className="scroll-mt-20 font-inter">
      
      {/* Exploration Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-eco-primary/10 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-eco-primary uppercase font-display-campaign flex items-center gap-2 tracking-tight">
            <Compass className="w-6 h-6 text-eco-accentGreen animate-pulse" />
            Khám Phá Ga Đô Thị
          </h2>
          <p className="text-xs text-eco-muted font-medium mt-1">
            Tìm hiểu các địa điểm ăn uống, vui chơi xanh mát và cẩm nang di chuyển quanh các nhà ga.
          </p>
        </div>

        {/* Station Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-eco-muted uppercase tracking-wider whitespace-nowrap">Chọn nhà ga:</label>
          <div className="relative">
            <select
              value={activeStationId}
              onChange={handleStationChange}
              className="appearance-none pl-4 pr-10 py-2 text-xs font-black bg-white border border-eco-primary/20 rounded-full text-eco-primary shadow-sm hover:border-eco-primary focus:outline-none focus:ring-1 focus:ring-eco-primary cursor-pointer transition-all duration-200"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  Ga {s.name} ({s.lineName.includes('Tuyến 1') ? 'Metro 1' : 'Bus'})
                </option>
              ))}
            </select>
            <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-accentGreen pointer-events-none" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-eco-muted">
          <Loader2 className="w-8 h-8 animate-spin text-eco-primary mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Đang tải dữ liệu nhà ga...</p>
        </div>
      )}

      {!loading && experienceData && (
        <div className="space-y-10">
          
          {/* Station Summary Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-r from-eco-bgBeige/60 to-eco-mint/20 border border-eco-mint/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-eco-accentGreen/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[9px] font-black uppercase bg-eco-primary text-white px-2.5 py-1 rounded-full border border-eco-primary/10">
                {experienceData.station.lineName}
              </span>
              <h3 className="text-xl font-black text-eco-ink uppercase">Ga {experienceData.station.name}</h3>
              <p className="text-xs text-eco-muted leading-relaxed font-medium">
                {experienceData.station.description || 'Không gian ga hiện đại, thoáng đãng phục vụ hành khách kết nối thuận tiện.'}
              </p>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-eco-primary/10 pt-4 lg:pt-0 lg:pl-6 space-y-3 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-eco-muted uppercase tracking-wider">Tiện ích tại nhà ga:</span>
              <div className="flex flex-wrap gap-1.5">
                {experienceData.station.facilities.length > 0 ? (
                  experienceData.station.facilities.map((fac: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold text-eco-primary bg-white border border-eco-primary/10 px-2.5 py-1 rounded-full"
                    >
                      ✨ {fac}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-eco-muted italic">Đang cập nhật tiện ích...</span>
                )}
              </div>
            </div>
          </div>

          {/* Places Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-eco-ink uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-eco-accentGreen" />
                  Địa điểm xung quanh ga ({filteredPlaces.length})
                </h4>
                <p className="text-[11px] text-eco-muted">Đi bộ xanh từ lối ra ga để ghé thăm.</p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['Tất cả', ...experienceData.categories.map((c: string) => localizeCategory(c))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all duration-200 border ${
                      categoryFilter === cat
                        ? 'bg-eco-primary border-eco-primary text-white shadow-sm'
                        : 'bg-white border-eco-primary/10 text-eco-muted hover:border-eco-primary/40 hover:text-eco-ink'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Places Grid */}
            {filteredPlaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlaces.map((place: any) => (
                  <motion.div
                    key={place.id}
                    whileHover={{ y: -3 }}
                    className="flex flex-col bg-white border border-eco-primary/10 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Visual Placeholder Header (CSS Pattern to avoid copyright issues) */}
                    <div className="h-32 bg-gradient-to-br from-eco-bgBeige to-eco-mint/40 relative flex items-center justify-center overflow-hidden border-b border-eco-primary/5">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold bg-white text-eco-primary shadow-sm">
                        {localizeCategory(place.category)}
                      </div>
                      {place.featured && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[9px] font-black uppercase bg-eco-accentGreen text-white shadow-sm tracking-wide">
                          ⭐ Nổi bật
                        </div>
                      )}
                      
                      {/* Stylized Visual Placeholder */}
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-xl font-bold font-display-campaign text-eco-primary/70">{place.name}</span>
                        <span className="text-[9px] text-eco-muted font-bold mt-1 uppercase tracking-wider">{place.district}</span>
                      </div>
                    </div>

                    {/* Place Body */}
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <h5 className="text-xs font-black text-eco-ink group-hover:text-eco-primary transition-colors">{place.name}</h5>
                        <p className="text-[10px] text-eco-muted leading-relaxed mt-1 font-medium line-clamp-2">
                          {place.shortDescription}
                        </p>
                      </div>

                      {/* Distance / Highlights */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[9px] text-eco-muted font-bold">
                          <span className="flex items-center gap-1">
                            🚶 {place.walkingMinutes} phút đi bộ ({place.distanceMeters}m)
                          </span>
                          <span>
                            {'💵'.repeat(place.priceLevel)}
                          </span>
                        </div>

                        {/* Highlights list */}
                        <div className="flex flex-wrap gap-1">
                          {place.highlights.slice(0, 2).map((h: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[8px] font-bold text-eco-accentGreen bg-eco-accentGreen/10 border border-eco-accentGreen/20 px-1.5 py-0.5 rounded-md"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setActivePlace(place)}
                        className="w-full flex items-center justify-center py-2 px-3 border border-eco-primary/10 hover:border-eco-primary hover:bg-eco-primary hover:text-white transition-all duration-200 text-[10px] font-bold rounded-xl text-eco-primary space-x-1 mt-1"
                      >
                        <span>Xem chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-eco-primary/10 rounded-2xl py-12 text-center text-eco-muted">
                <MapPin className="w-8 h-8 text-eco-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Không tìm thấy địa điểm thuộc danh mục này quanh ga.</p>
              </div>
            )}
          </div>

          {/* Guides / Articles Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-black text-eco-ink uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-eco-accentGreen" />
                Cẩm nang di chuyển & Trải nghiệm đô thị
              </h4>
              <p className="text-[11px] text-eco-muted">Tận hưởng hành trình di chuyển thông minh, thân thiện môi trường.</p>
            </div>

            {experienceData.guides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {experienceData.guides.map((guide: any) => (
                  <div
                    key={guide.id}
                    className="flex flex-col justify-between bg-white border border-eco-primary/10 rounded-2xl p-5 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1">
                        {guide.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[8px] font-bold text-eco-primary bg-eco-mint border border-eco-primary/5 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h5 className="text-xs font-black text-eco-ink group-hover:text-eco-primary transition-colors">
                        {guide.title}
                      </h5>
                      <p className="text-[10px] text-eco-muted font-medium leading-relaxed line-clamp-2">
                        {guide.excerpt}
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const detail = await apiFetch(`/api/guides/${guide.slug}`);
                          setActiveGuide(detail);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="flex items-center space-x-1 text-[10px] font-bold text-eco-primary hover:text-eco-primaryDeep mt-4"
                    >
                      <FileText className="w-3.5 h-3.5 mr-0.5" />
                      <span>Đọc bài viết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-eco-primary/10 rounded-2xl py-8 text-center text-eco-muted">
                <p className="text-xs">Đang soạn thảo cẩm nang cho ga này...</p>
              </div>
            )}
          </div>

          {/* UGC Reviews Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-eco-primary/10 pt-10">
            
            {/* Reviews Summary Stats */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-eco-ink uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-eco-primary" />
                Cộng đồng nhận xét ga
              </h4>
              
              <div className="bg-eco-bgBeige/40 border border-eco-primary/5 rounded-2xl p-6 text-center space-y-2">
                <div className="text-4xl font-black font-display-campaign text-eco-primary">
                  {experienceData.reviewsSummary.averageRating}
                </div>
                <div className="flex items-center justify-center space-x-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(experienceData.reviewsSummary.averageRating)
                          ? 'fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-eco-muted font-bold tracking-wide">
                  Có {experienceData.reviewsSummary.totalCount} đánh giá đã duyệt
                </p>
              </div>
            </div>

            {/* Review List & Submission Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Review Form */}
              <div className="bg-white border border-eco-mint rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-eco-ink uppercase flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-eco-accentGreen" />
                  Gửi đánh giá của bạn về Ga {experienceData.station.name}
                </h5>

                {reviewSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">
                    🎉 {reviewSuccess}
                  </div>
                )}

                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                    ⚠️ {reviewError}
                  </div>
                )}

                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-bold text-eco-muted uppercase tracking-wider">Xếp hạng của bạn:</span>
                      <div className="flex space-x-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRating(val)}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-6 h-6 ${val <= rating ? 'fill-current' : 'text-gray-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-bold text-eco-muted uppercase tracking-wider mb-1">
                          Tên hiển thị (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          placeholder="Biệt danh (VD: Người di chuyển xanh)"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-eco-bgBeige/30 border border-eco-primary/10 rounded-xl focus:border-eco-primary focus:outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-eco-muted uppercase tracking-wider mb-1">
                          Nội dung nhận xét (Tối thiểu 10 ký tự)
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Nhập trải nghiệm thực tế của bạn tại nhà ga này (cơ sở vật chất, thái độ phục vụ, lối kết nối xanh...)"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-eco-bgBeige/30 border border-eco-primary/10 rounded-xl focus:border-eco-primary focus:outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-40 transition-all duration-200"
                    >
                      {submittingReview ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Gửi nhận xét</span>
                    </button>
                  </form>
                ) : (
                  <div className="border border-dashed border-eco-primary/15 rounded-xl p-6 text-center space-y-3 bg-eco-bgBeige/20">
                    <p className="text-xs text-eco-muted font-medium">Bạn cần đăng nhập để gửi nhận xét công khai.</p>
                    <button
                      onClick={onLoginClick}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-sm transition-all duration-200"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng nhập để nhận xét</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h5 className="text-xs font-black text-eco-ink uppercase tracking-wider">
                  Nhận xét đã duyệt ({experienceData.reviewsSummary.list.length})
                </h5>
                
                {experienceData.reviewsSummary.list.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {experienceData.reviewsSummary.list.map((review: any) => (
                      <div
                        key={review.id}
                        className="bg-eco-bgBeige/20 border border-eco-primary/5 rounded-2xl p-4 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-eco-ink">{review.displayName || 'Hành khách xanh'}</span>
                          <span className="text-[9px] text-eco-muted font-semibold">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        
                        <div className="flex space-x-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating ? 'fill-current' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-eco-muted leading-relaxed font-medium">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-eco-muted text-xs italic">
                    Chưa có đánh giá nào cho nhà ga này. Hãy là người đầu tiên chia sẻ trải nghiệm xanh!
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Place Details Modal Overlay */}
      <AnimatePresence>
        {activePlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePlace(null)}
              className="absolute inset-0 bg-eco-ink/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-eco-mint rounded-3xl shadow-2xl overflow-hidden z-10 font-inter max-h-[90vh] flex flex-col"
            >
              {/* Header Branding */}
              <div className="p-6 pb-4 bg-gradient-to-br from-eco-bgBeige via-white to-eco-mint/20 border-b border-eco-primary/10 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase bg-eco-primary text-white px-2 py-0.5 rounded">
                    {localizeCategory(activePlace.category)}
                  </span>
                  <h3 className="text-lg font-black text-eco-ink uppercase mt-1.5">{activePlace.name}</h3>
                  <p className="text-[10px] text-eco-muted font-bold mt-0.5 uppercase tracking-wide">
                    📍 {activePlace.address} ({activePlace.district})
                  </p>
                </div>
                <button
                  onClick={() => setActivePlace(null)}
                  className="p-1.5 rounded-full text-eco-muted hover:bg-eco-mint/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-grow">
                
                {/* Visual Placeholder in detail modal */}
                <div className="h-44 bg-gradient-to-br from-eco-bgBeige to-eco-mint/30 rounded-2xl flex items-center justify-center border border-eco-mint/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <Sparkles className="w-8 h-8 text-eco-accentGreen animate-pulse opacity-45" />
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-eco-muted uppercase tracking-wider block">Mô tả địa điểm:</span>
                  <p className="text-xs text-eco-muted leading-relaxed font-medium">
                    {activePlace.description || activePlace.shortDescription}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-eco-primary/10 py-4">
                  <div>
                    <span className="text-[10px] font-bold text-eco-muted uppercase tracking-wider block">Thời gian đi bộ:</span>
                    <span className="text-xs font-bold text-eco-ink flex items-center gap-1 mt-0.5">
                      🚶 {activePlace.walkingMinutes} phút ({activePlace.distanceMeters} mét)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-eco-muted uppercase tracking-wider block">Mức chi phí:</span>
                    <span className="text-xs font-bold text-eco-primary mt-0.5 block">
                      {'💵'.repeat(activePlace.priceLevel)}
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-eco-muted uppercase tracking-wider block">Điểm nhấn dịch vụ:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activePlace.highlights.map((h: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-eco-accentGreen/5 border border-eco-accentGreen/15 rounded-xl text-[10px] font-bold text-eco-ink"
                      >
                        <span className="text-eco-accentGreen">✓</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activePlace.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold text-eco-muted bg-eco-bgBeige/60 border border-eco-primary/5 px-2.5 py-1 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guide Details Modal Overlay */}
      <AnimatePresence>
        {activeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGuide(null)}
              className="absolute inset-0 bg-eco-ink/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white border border-eco-mint rounded-3xl shadow-2xl overflow-hidden z-10 font-inter max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 pb-4 bg-gradient-to-br from-eco-bgBeige via-white to-eco-mint/20 border-b border-eco-primary/10 flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap gap-1">
                    {activeGuide.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[8px] font-bold text-eco-primary bg-eco-mint border border-eco-primary/5 px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-black text-eco-ink uppercase mt-2">{activeGuide.title}</h3>
                  <p className="text-[9px] text-eco-muted font-bold mt-0.5">
                    Ngày đăng: {new Date(activeGuide.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="p-1.5 rounded-full text-eco-muted hover:bg-eco-mint/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guide Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-grow text-xs leading-relaxed text-eco-muted font-medium">
                {activeGuide.content.split('\n\n').map((paragraph: string, idx: number) => {
                  // Basic list markdown processing
                  if (paragraph.startsWith('1.') || paragraph.startsWith('-')) {
                    return (
                      <div key={idx} className="bg-eco-bgBeige/20 border border-eco-mint/20 rounded-xl p-4 my-2 text-eco-ink">
                        {paragraph.split('\n').map((line, lIdx) => (
                          <p key={lIdx} className="mb-1.5 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-justify">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 bg-eco-bgBeige/30 border-t border-eco-primary/5 flex items-center justify-between">
                <span className="text-[10px] text-eco-muted font-bold">
                  {activeGuide.relatedStationName ? `Liên quan ga: Ga ${activeGuide.relatedStationName}` : 'Tài liệu di chuyển chung'}
                </span>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="px-4 py-1.5 bg-eco-primary hover:bg-eco-primaryDeep text-white text-[10px] font-bold rounded-lg"
                >
                  Đồng ý
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
