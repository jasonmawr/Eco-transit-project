'use client';

import React, { useState } from 'react';
import { apiFetch, getApiBaseUrl } from '../lib/api';
import { Share2, Copy, AlertCircle, CheckCircle, RefreshCw, Leaf, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FreeTextSuggestionInput from './ui/free-text-suggestion-input';

const XANHWRAP_PLACE_SUGGESTIONS = [
  'Ga Bến Thành',
  'Ga Ba Son',
  'Ga Nhà hát Thành phố',
  'Thảo Điền',
  'Suối Tiên',
  'Nhà',
  'Trường học',
  'Văn phòng',
  'Bến xe buýt điện',
  'Highlands Coffee gần ga'
];

export default function XanhWrapSection() {
  const [form, setForm] = useState({
    nickname: '',
    origin: '',
    destination: '',
    duration: '15',
    luckyNumber: '555',
    moment: 'Buổi sáng đi làm',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Chặn HTML injection
    const htmlRegex = /<[^>]*>/g;
    if (
      htmlRegex.test(form.nickname) ||
      htmlRegex.test(form.origin) ||
      htmlRegex.test(form.destination) ||
      htmlRegex.test(form.moment)
    ) {
      setError('Nội dung nhập vào không được chứa thẻ HTML.');
      return;
    }

    // Kiểm tra độ dài đầu vào
    if (form.nickname.length > 30) {
      setError('Nickname tối đa 30 ký tự.');
      return;
    }
    if (form.origin.length > 50 || form.destination.length > 50) {
      setError('Tên điểm xuất phát/đến tối đa 50 ký tự.');
      return;
    }
    if (form.moment.length > 55) {
      setError('Khoảnh khắc di chuyển tối đa 55 ký tự.');
      return;
    }

    if (!form.nickname.trim() || !form.origin.trim() || !form.destination.trim() || !form.duration.trim() || !form.luckyNumber.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const durationVal = parseInt(form.duration, 10);
    if (isNaN(durationVal) || durationVal < 1 || durationVal > 1440) {
      setError('Thời gian di chuyển phải là số nguyên từ 1 đến 1440 phút.');
      return;
    }

    const luckyVal = parseInt(form.luckyNumber, 10);
    if (isNaN(luckyVal) || luckyVal < 1 || luckyVal > 999) {
      setError('Con số may mắn dự thi phải là số nguyên từ 1 đến 999.');
      return;
    }

    setLoading(true);

    try {
      // Ước tính khoảng cách thực tế (giả định tốc độ trung bình 20km/h cho buýt/metro nội thành)
      // distanceKm = (durationVal * 20) / 60
      const estimatedDistance = parseFloat(((durationVal * 20) / 60).toFixed(1));

      const response = await fetch(`${getApiBaseUrl()}/api/time-bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          originLabel: form.origin.trim(),
          destinationLabel: form.destination.trim(),
          durationMinutes: durationVal,
          distanceKm: estimatedDistance,
          preferenceSummary: `Hành khách: ${form.nickname.trim()} | Khoảnh khắc: ${form.moment}`,
          weatherSummary: 'normal',
          nickname: form.nickname.trim(),
          moment: form.moment.trim(),
          luckyNumber: luckyVal,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo hóa đơn XanhWrap.');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi hệ thống khi tạo XanhWrap. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = result ? `${siteUrl}/share/${result.shareSlug}` : '';

  // Caption share bám sát yêu cầu
  const shareCaption = result
    ? `Tôi vừa hoàn thành XanhWrap - Hóa đơn lướt khỏi khói của mình! 🛤️ Hành trình từ ${result.originLabel} đến ${result.destinationLabel} trong ${result.durationMinutes} phút đạt điểm xanh ${result.greenScore}/100! Con số may mắn dự thi của tôi là #${result.luckyNumber}. Hãy cùng lướt khói chạm xanh vì một tương lai trong lành hơn. #XanhWrap #LuotKhoiChamXanh #EcoTransit ${shareUrl}`
    : '';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCaption = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareCaption);
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Input Form */}
      <div className="lg:col-span-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-eco-ink uppercase tracking-tight font-display-campaign">
            TỰ TẠO XANHWRAP CỦA BẠN
          </h3>
          <p className="text-xs text-eco-muted mt-1 leading-normal">
            Nhập nhanh hành trình di chuyển thực tế hàng ngày của bạn bằng phương tiện công cộng để nhận ngay thẻ thống kê chỉ số bảo vệ môi trường!
          </p>
        </div>

        <form onSubmit={validateAndSubmit} noValidate className="space-y-4 bg-eco-soft/40 p-5 rounded-3xl border border-eco-primary/5">
          
          {/* Nickname */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-eco-ink uppercase tracking-wider block">
              Biệt danh / Nickname <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nickname"
              required
              value={form.nickname}
              onChange={handleInputChange}
              placeholder="VD: Hải Đăng, commuter_99"
              maxLength={30}
              className="w-full bg-white border border-gray-200 focus:border-eco-primary focus:ring-1 focus:ring-eco-primary outline-none px-4 py-2.5 rounded-2xl text-xs text-eco-ink font-medium transition-all"
            />
          </div>

          {/* Path inputs */}
          <div className="grid grid-cols-2 gap-4">
            <FreeTextSuggestionInput
              label="Điểm xuất phát"
              name="origin"
              required
              value={form.origin}
              onChange={(val) => setForm((prev) => ({ ...prev, origin: val }))}
              placeholder="VD: Ga Bến Thành, Nhà, Trường, Văn phòng..."
              suggestions={XANHWRAP_PLACE_SUGGESTIONS}
            />
            <FreeTextSuggestionInput
              label="Điểm đến"
              name="destination"
              required
              value={form.destination}
              onChange={(val) => setForm((prev) => ({ ...prev, destination: val }))}
              placeholder="VD: Ga Bến Thành, Nhà, Trường, Văn phòng..."
              suggestions={XANHWRAP_PLACE_SUGGESTIONS}
            />
          </div>
          <span className="text-[10px] text-eco-muted block font-medium -mt-2">
            Bạn có thể nhập tự do hoặc chọn gợi ý ga/địa điểm quen thuộc.
          </span>

          {/* Duration & Lucky Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-eco-ink uppercase tracking-wider block">
                Thời gian đi (Phút) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                max="1440"
                required
                value={form.duration}
                onChange={handleInputChange}
                placeholder="VD: 15"
                className="w-full bg-white border border-gray-200 focus:border-eco-primary focus:ring-1 focus:ring-eco-primary outline-none px-4 py-2.5 rounded-2xl text-xs text-eco-ink font-bold transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-eco-ink uppercase tracking-wider block">
                Số may mắn dự thi (1-999) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="luckyNumber"
                min="1"
                max="999"
                required
                value={form.luckyNumber}
                onChange={handleInputChange}
                placeholder="VD: 555"
                className="w-full bg-white border border-gray-200 focus:border-eco-primary focus:ring-1 focus:ring-eco-primary outline-none px-4 py-2.5 rounded-2xl text-xs text-eco-ink font-bold transition-all"
              />
            </div>
          </div>

          {/* Moment */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-eco-ink uppercase tracking-wider block">
              Khoảnh khắc di chuyển
            </label>
            <input
              type="text"
              name="moment"
              value={form.moment}
              onChange={handleInputChange}
              placeholder="VD: Đi làm buổi sáng, đi học lúc tan tầm..."
              maxLength={50}
              className="w-full bg-white border border-gray-200 focus:border-eco-primary focus:ring-1 focus:ring-eco-primary outline-none px-4 py-2.5 rounded-2xl text-xs text-eco-ink font-medium transition-all"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex justify-between items-center gap-4">
            {error && (
              <div className="flex-grow flex items-center space-x-1.5 text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 p-2.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <button
              disabled={loading}
              type="submit"
              className="shrink-0 ml-auto bg-eco-primary hover:bg-eco-primaryDeep text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm disabled:opacity-60 flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin animate-infinite" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Tạo XanhWrap 🎫</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Minigame Rules Panel */}
        <div className="bg-emerald-50/50 border border-emerald-200/50 p-5 rounded-3xl space-y-2 mt-4">
          <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center space-x-1.5">
            <span>🎁 THỂ LỆ MINIGAME XANHWRAP</span>
          </h4>
          <p className="text-[11px] text-emerald-900 leading-relaxed font-semibold">
            Chia sẻ XanhWrap kèm hashtag <strong className="text-emerald-700">#XanhWrap #LuotKhoiChamXanh</strong> và một con số từ 1–999 để có cơ hội nhận vé tháng xe buýt/metro.
          </p>
          <div className="text-[9px] text-emerald-700/80 leading-normal space-y-1 pt-1.5 border-t border-emerald-200/30">
            <p>• Ban tổ chức sẽ tiến hành đối soát và xác minh nội dung/tương tác thủ công trước khi trao giải.</p>
            <p>• Sau khi chia sẻ hành trình, hãy gửi minh chứng để đội ngũ xét duyệt.</p>
            <p>• Lượt tương tác trên mạng xã hội không được tự động ghi nhận.</p>
            <p>• Kết quả cuối cùng sẽ được công bố chính thức tại trang chủ chiến dịch.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic XanhWrap Card & Share Details */}
      <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[350px] relative">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm flex flex-col space-y-4"
            >
              {/* Premium Graduated TimeBill Card Container */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden font-inter select-none">
                
                {/* Visual top ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none" />

                {/* Card Title Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl">🌿</span>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">XANHWRAP</span>
                      <span className="text-[8px] text-white/50 tracking-wider font-extrabold uppercase block">Hóa Đơn Lướt Khói</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-white/40 block font-bold uppercase">Người tạo</span>
                    <span className="text-xs font-black text-white/90 truncate max-w-[120px] block font-mono">
                      @{result.nickname || 'commuter'}
                    </span>
                  </div>
                </div>

                {/* Path representation */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col space-y-2 mb-4">
                  <div className="text-[9px] text-emerald-400 font-extrabold tracking-wider uppercase">Lộ trình xanh thực tế</div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs shrink-0">🟢</span>
                      <span className="text-xs font-extrabold truncate text-white/90">{result.originLabel}</span>
                    </div>
                    <div className="w-0.5 h-3 bg-white/20 ml-1.5" />
                    <div className="flex items-center space-x-2">
                      <span className="text-xs shrink-0">🔴</span>
                      <span className="text-xs font-extrabold truncate text-white/90">{result.destinationLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Grid score & parameters */}
                <div className="grid grid-cols-12 gap-3 items-center bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                  <div className="col-span-5 flex flex-col items-center justify-center border-r border-white/10 pr-2">
                    <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider text-center mb-1">ĐIỂM XANH</span>
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md">
                      <div className="absolute inset-0.5 bg-slate-900 rounded-full flex flex-col items-center justify-center">
                        <span className="text-xl font-black font-mono leading-none text-emerald-400">{result.greenScore}</span>
                        <span className="text-[7px] font-bold text-white/40 mt-0.5">/ 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 pl-2 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[8px] text-white/40 font-bold uppercase block">Thời gian</span>
                        <span className="font-bold text-white/90 font-mono block">{result.durationMinutes} phút</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-white/40 font-bold uppercase block">Số dự thi</span>
                        <span className="font-black text-yellow-300 font-mono block">#{result.luckyNumber || 555}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-white/40 font-bold uppercase block">Khoảnh khắc</span>
                      <span className="font-bold text-emerald-300 truncate block text-[11px]">
                        {result.moment || 'Di chuyển trong ngày'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Savings indicators */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center flex flex-col items-center">
                    <Leaf className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[8px] text-emerald-400 font-extrabold uppercase">Giảm CO2</span>
                    <span className="text-sm font-mono font-black text-emerald-300 mt-0.5">
                      -{result.estimatedCo2SavedGrams}g
                    </span>
                  </div>
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-3 text-center flex flex-col items-center">
                    <Landmark className="w-4 h-4 text-teal-400 mb-1" />
                    <span className="text-[8px] text-teal-400 font-extrabold uppercase">Tối ưu chi phí</span>
                    <span className="text-sm font-mono font-black text-teal-300 mt-0.5">
                      -{result.estimatedMoneySavedVnd?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="border-t border-white/5 pt-3.5 text-center">
                  <p className="text-[8px] text-white/35 italic leading-normal">
                    ⚠️ Các chỉ số xanh là ước tính tham khảo cho chiến dịch, không thay thế dữ liệu đo đạc thực tế.
                  </p>
                </div>

              </div>

              {/* Share actions triggers */}
              <div className="bg-eco-soft border border-eco-primary/10 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-[10px] text-eco-muted font-bold uppercase">
                  <span>Chia sẻ hóa đơn</span>
                  <span className="text-eco-accentGreenDeep">#XanhWrap</span>
                </div>

                {/* Share Link Row */}
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-2xl p-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-[10px] text-eco-ink w-full outline-none font-mono px-1 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-eco-primary hover:bg-eco-primaryDeep text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLink ? 'Đã copy' : 'Copy link'}</span>
                  </button>
                </div>

                {/* Caption Share Row */}
                <button
                  onClick={handleCopyCaption}
                  className="w-full bg-eco-ink hover:bg-eco-primary text-white text-[10px] font-black uppercase py-2.5 rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedCaption ? 'Đã chép nội dung ✓' : 'Sao chép caption chia sẻ'}</span>
                </button>
              </div>

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center p-8 bg-eco-soft/40 border border-dashed border-gray-200 rounded-3xl max-w-sm w-full text-eco-muted flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-eco-mint flex items-center justify-center text-3xl mb-4 shadow-sm border border-eco-primary/5">
                🎫
              </div>
              <h4 className="text-xs font-black text-eco-ink uppercase">Hóa Đơn Xanh Trống</h4>
              <p className="text-[10px] text-eco-muted mt-2 leading-relaxed">
                Điền thông tin hành trình của bạn vào biểu mẫu bên cạnh để tạo thẻ chia sẻ XanhWrap độc quyền.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
