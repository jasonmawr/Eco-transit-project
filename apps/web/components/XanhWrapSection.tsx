'use client';

import React, { useState, useRef } from 'react';
import { getApiBaseUrl } from '../lib/api';
import { 
  Copy, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink,
  Sparkles,
  MapPin,
  Clock,
  Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  XanhWrapLeg, 
  XANHWRAP_PRESETS, 
  ALL_LABELS,
  XanhWrapLabelDef,
  SUGGESTED_LOCATIONS
} from '../lib/xanhwrapCore';

export default function XanhWrapSection() {
  // Step 1: Input Form State
  const [nickname, setNickname] = useState('');
  const [recordDate, setRecordDate] = useState('2026-07-23');
  const [reflection, setReflection] = useState('');
  const [luckyNumber, setLuckyNumber] = useState('555');

  // Legs array (Min 2, Max 8)
  const [legs, setLegs] = useState<XanhWrapLeg[]>([
    { from: 'Thủ Đức', to: 'Q1', depart_time: '07:00', mode: 'metro', distance_km: 14, duration_min: 52, transit_line: 'Metro số 1' },
    { from: 'Q1', to: 'Thảo Điền', depart_time: '12:15', mode: 'metro', distance_km: 8, duration_min: 25, transit_line: 'Metro số 1' },
  ]);

  // Loading & Step states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultReceipt, setResultReceipt] = useState<any | null>(null);

  // Step 3: Link submission states
  const [postUrl, setPostUrl] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);

  // Presets handling
  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    if (!presetId) return;
    const found = XANHWRAP_PRESETS.find(p => p.id === presetId);
    if (found && legs.length < 8) {
      const lastLegTime = legs[legs.length - 1]?.depart_time || '08:00';
      const [h, m] = lastLegTime.split(':').map(Number);
      const nextMins = (h * 60 + m + 90) % (24 * 60);
      const nextH = Math.floor(nextMins / 60);
      const nextM = nextMins % 60;
      const nextTimeStr = `${nextH < 10 ? '0' : ''}${nextH}:${nextM < 10 ? '0' : ''}${nextM}`;

      setLegs([
        ...legs,
        {
          from: found.from,
          to: found.to,
          depart_time: nextTimeStr,
          mode: found.transit_line.includes('Metro') ? 'metro' : 'bus',
          distance_km: found.distance_km,
          duration_min: found.duration_min,
          transit_line: found.transit_line,
        },
      ]);
    }
  };

  const handleLegChange = (index: number, field: keyof XanhWrapLeg, value: any) => {
    const updated = [...legs];
    updated[index] = { ...updated[index], [field]: value };
    setLegs(updated);
  };

  const addLeg = () => {
    if (legs.length >= 8) return;
    const lastLegTime = legs[legs.length - 1]?.depart_time || '12:00';
    const [h, m] = lastLegTime.split(':').map(Number);
    const nextMins = (h * 60 + m + 120) % (24 * 60);
    const nextH = Math.floor(nextMins / 60);
    const nextM = nextMins % 60;
    const nextTimeStr = `${nextH < 10 ? '0' : ''}${nextH}:${nextM < 10 ? '0' : ''}${nextM}`;

    setLegs([
      ...legs,
      {
        from: '',
        to: '',
        depart_time: nextTimeStr,
        mode: 'bus',
        distance_km: 5,
        duration_min: 20,
      },
    ]);
  };

  const removeLeg = (index: number) => {
    if (legs.length <= 2) return;
    setLegs(legs.filter((_, i) => i !== index));
  };

  // Submit form to create receipt
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultReceipt(null);
    setSubmissionResult(null);

    // Basic frontend checks
    if (!nickname.trim() || nickname.length < 2 || nickname.length > 20) {
      setError('Biệt danh phải từ 2 đến 20 ký tự.');
      return;
    }

    if (!reflection.trim() || reflection.length < 10 || reflection.length > 200) {
      setError('Dòng suy nghĩ phải từ 10 đến 200 ký tự.');
      return;
    }

    const luckyVal = parseInt(luckyNumber, 10);
    if (isNaN(luckyVal) || luckyVal < 1 || luckyVal > 999) {
      setError('Con số may mắn phải là số nguyên từ 1 đến 999.');
      return;
    }

    if (legs.length < 2 || legs.length > 8) {
      setError('Hành trình phải bao gồm từ 2 đến 8 chặng di chuyển.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/xanhwrap/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          recordDate,
          reflection: reflection.trim(),
          luckyNumber: luckyVal,
          legs,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo phiếu XanhWrap.');
      }

      setResultReceipt(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Submit contest post link
  const handleSubmitPostLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultReceipt?.id) return;
    setError(null);

    if (!postUrl.trim()) {
      setError('Vui lòng dán đường dẫn bài viết của bạn.');
      return;
    }

    setSubmittingLink(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/xanhwrap/submit-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          receiptId: resultReceipt.id,
          postUrl: postUrl.trim(),
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi nộp link dự thi.');
      }

      setSubmissionResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi hệ thống khi nộp link bài viết.');
    } finally {
      setSubmittingLink(false);
    }
  };

  // Copy sample caption
  const handleCopyCaption = async () => {
    if (!resultReceipt) return;
    const caption = `Nhãn của mình: [ ${resultReceipt.assignedLabelName} ] — độ hiếm ${resultReceipt.rarityPct ? resultReceipt.rarityPct + '%' : 'mới'}
Một ngày mình có ${resultReceipt.handsFreeMin || resultReceipt.transitMin} phút không phải cầm lái. Đổi sang buýt/metro thì lấy lại được ${resultReceipt.daysPerYear} ngày tự do mỗi năm!
💬 Dòng suy nghĩ: "${resultReceipt.reflection}"
🎲 Số dự thi may mắn: #${resultReceipt.luckyNumber}
#XanhWrap #LuotKhoiChamXanh #EcoTransit`;

    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Generate and Download 2 Square JPG receipt images via HTML5 Canvas
  const handleDownloadSquareImages = async () => {
    if (!resultReceipt) return;
    setDownloadingImages(true);

    try {
      const createSquareCanvas = (part: 1 | 2): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;

        // Background: Soft vintage receipt paper texture
        ctx.fillStyle = '#F8F6F0';
        ctx.fillRect(0, 0, 1920, 1920);

        // Outer border & padding
        ctx.strokeStyle = '#0E5140';
        ctx.lineWidth = 16;
        ctx.strokeRect(40, 40, 1840, 1840);

        if (part === 1) {
          // IMAGE 1: Top Half Master
          // Header Badge
          ctx.fillStyle = '#0E5140';
          ctx.fillRect(100, 100, 420, 70);
          ctx.fillStyle = '#00E08A';
          ctx.font = 'bold 32px "Space Mono", monospace';
          ctx.fillText('LƯỚT KHÓI · MINIGAME', 120, 146);

          // Header Title
          ctx.fillStyle = '#1A1A1A';
          ctx.font = 'black 64px "Space Mono", sans-serif';
          ctx.fillText('MỘT NGÀY LÁI XE,', 100, 260);
          ctx.fillText('BẠN LẤY LẠI ĐƯỢC', 100, 340);
          ctx.fillStyle = '#0E5140';
          ctx.fillText('BAO NHIÊU THỜI GIAN?', 100, 420);

          // Receipt Inner Card Frame
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E0DCD3';
          ctx.lineWidth = 6;
          ctx.fillRect(100, 480, 1720, 1340);
          ctx.strokeRect(100, 480, 1720, 1340);

          // Receipt Header
          ctx.fillStyle = '#0E5140';
          ctx.font = 'bold 44px "Space Mono", monospace';
          ctx.fillText('XANHWRAP · PHIẾU HOÀN THỜI GIAN', 140, 560);
          ctx.fillStyle = '#666666';
          ctx.font = '32px "Space Mono", monospace';
          ctx.fillText(`NGƯỜI LƯỚT CHẶNG: ${resultReceipt.nickname.toUpperCase()} · ${resultReceipt.recordDate}`, 140, 620);

          // Identity Label Badge Frame
          const isGreenGroup = resultReceipt.labelGroup === 'green';
          ctx.fillStyle = isGreenGroup ? '#0E5140' : '#2C2C2A';
          ctx.fillRect(140, 680, 1640, 220);

          ctx.fillStyle = isGreenGroup ? '#00E08A' : '#F5F1E8';
          ctx.font = 'black 72px "Space Mono", sans-serif';
          ctx.fillText(`▓▓ ${resultReceipt.assignedLabelName} ▓▓`, 180, 810);

          // Rarity line
          ctx.fillStyle = '#888888';
          ctx.font = 'bold 36px "Space Mono", monospace';
          const rarityText = resultReceipt.rarityPct ? `ĐỘ HIẾM ${resultReceipt.rarityPct}% · 1 TRONG 16 NHÃN` : '1 TRONG 16 NHÃN DANH TÍNH';
          ctx.fillText(rarityText, 140, 960);

          // Main Metric Card
          ctx.fillStyle = '#0E5140';
          ctx.fillRect(140, 1020, 1640, 360);

          ctx.fillStyle = '#00E08A';
          ctx.font = 'black 120px "Space Mono", sans-serif';
          ctx.fillText(`${resultReceipt.handsFreeMin || resultReceipt.transitMin} PHÚT`, 180, 1150);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 48px "Space Mono", monospace';
          ctx.fillText(`KHÔNG PHẢI CẦM LÁI = ${resultReceipt.daysPerYear} NGÀY TRONG NĂM NAY`, 180, 1240);
          ctx.fillText(`TƯƠNG ĐƯƠNG XEM ${resultReceipt.episodesPerYear} TẬP PHIM`, 180, 1310);

          // Summary footer line
          ctx.fillStyle = '#1A1A1A';
          ctx.font = 'bold 36px "Space Mono", monospace';
          ctx.fillText(`CHI TIẾT ${resultReceipt.legsJson?.length || 2} CHẶNG · TỔNG ${resultReceipt.totalKm} KM DI CHUYỂN`, 140, 1480);
          ctx.fillText(`CO2 GIẢM THIỂU: ${resultReceipt.co2SavedGrams} GRAMS`, 140, 1540);

        } else {
          // IMAGE 2: Bottom Half Master
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E0DCD3';
          ctx.lineWidth = 6;
          ctx.fillRect(100, 100, 1720, 1600);
          ctx.strokeRect(100, 100, 1720, 1600);

          ctx.fillStyle = '#0E5140';
          ctx.font = 'bold 44px "Space Mono", monospace';
          ctx.fillText('CHI TIẾT HÀNH TRÌNH TRONG NGÀY', 140, 180);

          // Render legs list
          const legsList: XanhWrapLeg[] = resultReceipt.legsJson || [];
          let currentY = 250;

          legsList.slice(0, 8).forEach((leg, idx) => {
            ctx.fillStyle = '#F4F2EC';
            ctx.fillRect(140, currentY, 1640, 100);

            ctx.fillStyle = '#1A1A1A';
            ctx.font = 'bold 32px "Space Mono", monospace';
            const modeName = leg.mode === 'metro' ? '🚆 Metro' : leg.mode === 'bus' ? '🚌 Xe buýt' : leg.mode === 'motorbike' ? '🛵 Xe máy' : '🚗 Ô tô';
            ctx.fillText(`${idx + 1}. [${leg.depart_time}] ${leg.from} → ${leg.to}`, 170, currentY + 45);

            ctx.fillStyle = '#0E5140';
            ctx.font = 'bold 28px "Space Mono", monospace';
            ctx.fillText(`${leg.distance_km}km · ${leg.duration_min} phút (${modeName})`, 170, currentY + 80);

            currentY += 115;
          });

          // Barcode representation
          ctx.fillStyle = '#1A1A1A';
          const barcodeY = Math.min(currentY + 40, 1350);
          for (let x = 140; x < 1780; x += 18) {
            const barWidth = Math.random() > 0.4 ? 10 : 4;
            ctx.fillRect(x, barcodeY, barWidth, 100);
          }

          // Lucky number
          ctx.fillStyle = '#0E5140';
          ctx.font = 'black 48px "Space Mono", monospace';
          ctx.fillText(`SỐ DỰ THI MAY MẮN: #${resultReceipt.luckyNumber}`, 140, barcodeY + 160);

          // Perforated edge bottom pattern
          ctx.fillStyle = '#F8F6F0';
          for (let px = 40; px < 1880; px += 40) {
            ctx.beginPath();
            ctx.arc(px, 1780, 14, 0, Math.PI * 2);
            ctx.fill();
          }

          // Footer hashtags banner
          ctx.fillStyle = '#0E5140';
          ctx.fillRect(40, 1800, 1840, 80);
          ctx.fillStyle = '#00E08A';
          ctx.font = 'bold 32px "Space Mono", monospace';
          ctx.fillText('QUAY SỐ TRÚNG VÉ THÁNG METRO · #XanhWrap #LuotKhoiChamXanh #EcoTransit', 80, 1850);
        }

        return canvas;
      };

      // Generate Image 1 & Image 2
      const canvas1 = createSquareCanvas(1);
      const canvas2 = createSquareCanvas(2);

      const link1 = document.createElement('a');
      link1.download = `xanhwrap_${resultReceipt.id}_1.jpg`;
      link1.href = canvas1.toDataURL('image/jpeg', 0.9);
      link1.click();

      setTimeout(() => {
        const link2 = document.createElement('a');
        link2.download = `xanhwrap_${resultReceipt.id}_2.jpg`;
        link2.href = canvas2.toDataURL('image/jpeg', 0.9);
        link2.click();
      }, 500);

    } catch (err) {
      console.error('Error rendering receipt canvas:', err);
    } finally {
      setDownloadingImages(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 px-2 sm:px-4">

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-eco-primary via-eco-primaryDeep to-eco-ink text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Printer className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-eco-mint/20 border border-eco-mint/40 text-eco-mint px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chiến dịch Lướt Khói Chạm Xanh · Minigame 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight">
            MÁY IN PHIẾU XANHWRAP
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Nhập 2 đến 8 chặng di chuyển trong ngày của bạn để máy in tự động cấp **Nhãn Danh Tính** độc bản và xuất bộ phiếu 2 ảnh vuông đăng mạng xã hội tham gia quay số may mắn!
          </p>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: FORM NHẬP HÀNH TRÌNH 2-8 CHẶNG */}
      {!resultReceipt && (
        <form onSubmit={handleSubmitForm} className="bg-white border border-eco-mint rounded-3xl p-6 sm:p-8 shadow-lg space-y-8">
          
          {/* Section 1: Thông tin chung */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-eco-primary flex items-center space-x-2 border-b border-eco-mint pb-2">
              <span>👤 1. Thông tin người lướt chặng</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-eco-ink mb-1">
                  Biệt danh / Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Hải, Minh Thư..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-eco-primary"
                  required
                />
                <span className="text-[10px] text-eco-muted">Từ 2 đến 20 ký tự</span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-eco-ink mb-1">
                  Ngày ghi nhận hành trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={recordDate}
                  min="2026-07-23"
                  max="2026-07-31"
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-eco-primary font-mono"
                  required
                />
                <span className="text-[10px] text-eco-muted">Trong thời gian chiến dịch (23/07 - 31/07/2026)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-eco-ink mb-1">
                  Dòng suy nghĩ / Khoảnh khắc di chuyển <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Ví dụ: Đi Metro số 1 buổi sáng thong thả ngắm nhìn thành phố không khói bụi..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  maxLength={200}
                  rows={2}
                  className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-eco-primary"
                  required
                />
                <span className="text-[10px] text-eco-muted">Từ 10 đến 200 ký tự (Dùng xét Giải Suy Nghĩ Ấn Tượng)</span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-eco-ink mb-1">
                  Số may mắn dự thi (1-999) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={luckyNumber}
                  onChange={(e) => setLuckyNumber(e.target.value)}
                  className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl px-4 py-3 text-sm font-black text-eco-primary font-mono focus:outline-none focus:ring-2 focus:ring-eco-primary"
                  required
                />
                <span className="text-[10px] text-eco-muted">Dùng quay số trúng vé tháng Metro</span>
              </div>
            </div>
          </div>

          {/* Section 2: Preset Chọn Tuyến Nhanh */}
          <div className="bg-eco-soft/30 border border-eco-mint rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-black uppercase text-eco-ink flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-eco-accentGreen" />
              <span>Gợi ý chặng phổ biến TP.HCM (Thêm nhanh)</span>
            </label>
            <select
              onChange={handleSelectPreset}
              defaultValue=""
              className="w-full bg-white border border-eco-primary/20 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-eco-primary"
            >
              <option value="" disabled>-- Chọn một cặp tuyến phổ biến để thêm nhanh vào chặng di chuyển --</option>
              {XANHWRAP_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.distance_km}km, ~{p.duration_min} phút theo {p.transit_line})
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: Mảng Chặng Legs[] */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-eco-mint pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-eco-primary flex items-center space-x-2">
                <span>🗺️ 2. Danh sách chặng di chuyển ({legs.length}/8 chặng)</span>
              </h3>
              <button
                type="button"
                onClick={addLeg}
                disabled={legs.length >= 8}
                className="flex items-center space-x-1 px-3 py-1.5 bg-eco-mint text-eco-primary hover:bg-eco-primary hover:text-white rounded-xl text-xs font-extrabold transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm chặng</span>
              </button>
            </div>

            <div className="space-y-4">
              {legs.map((leg, idx) => (
                <div key={idx} className="bg-white border border-eco-mint/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-eco-mint/40 pb-2">
                    <span className="text-xs font-black text-eco-ink uppercase font-mono">Chặng #{idx + 1}</span>
                    {legs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLeg(idx)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Điểm đi (Phường/Quận/Khu vực)</label>
                      <input
                        type="text"
                        list="suggested-locations"
                        placeholder="Thủ Đức, Q1, Thảo Điền, Nhà..."
                        value={leg.from}
                        onChange={(e) => handleLegChange(idx, 'from', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Điểm đến (Phường/Quận/Khu vực)</label>
                      <input
                        type="text"
                        list="suggested-locations"
                        placeholder="Q1, B.Thạnh, Nhà..."
                        value={leg.to}
                        onChange={(e) => handleLegChange(idx, 'to', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Giờ xuất phát (HH:mm)</label>
                      <input
                        type="time"
                        value={leg.depart_time}
                        onChange={(e) => handleLegChange(idx, 'depart_time', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Phương tiện di chuyển</label>
                      <select
                        value={leg.mode}
                        onChange={(e) => handleLegChange(idx, 'mode', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                      >
                        <option value="metro">🚆 Metro số 1</option>
                        <option value="bus">🚌 Xe buýt công cộng</option>
                        <option value="ride_hailing">🚗 Xe công nghệ (Grab/Be/XanhSM)</option>
                        <option value="motorbike">🛵 Xe máy cá nhân</option>
                        <option value="car">🚗 Ô tô cá nhân</option>
                        <option value="bicycle">🚲 Xe đạp</option>
                        <option value="walk">🚶 Đi bộ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Quãng đường (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="60"
                        value={leg.distance_km}
                        onChange={(e) => handleLegChange(idx, 'distance_km', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Thời gian (phút)</label>
                      <input
                        type="number"
                        min="3"
                        max="240"
                        value={leg.duration_min}
                        onChange={(e) => handleLegChange(idx, 'duration_min', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Soft warning for short private vehicle legs */}
                  {leg.distance_km < 3 && ['motorbike', 'car'].includes(leg.mode) && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      💡 <strong>Gợi ý:</strong> Chặng ngắn dưới 3km đi bộ hoặc xe đạp có khi còn nhanh hơn đó!
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Datalist gợi ý Phường / Quận / Địa điểm */}
          <datalist id="suggested-locations">
            {SUGGESTED_LOCATIONS.map((loc, i) => (
              <option key={i} value={loc} />
            ))}
          </datalist>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-eco-primary hover:bg-eco-primaryDeep text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Printer className="w-5 h-5" />
                <span>IN PHIẾU XANHWRAP NGAY</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: RECEIPT PREVIEW & IMAGE EXPORTER & LINK SUBMISSION */}
      {resultReceipt && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-eco-mint p-4 rounded-2xl shadow-sm">
            <button
              onClick={() => setResultReceipt(null)}
              className="px-4 py-2 bg-eco-soft text-eco-ink text-xs font-extrabold rounded-xl hover:bg-eco-mint transition-colors"
            >
              🔄 Nhập hành trình khác
            </button>

            <button
              onClick={handleDownloadSquareImages}
              disabled={downloadingImages}
              className="px-6 py-2.5 bg-eco-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-eco-primaryDeep shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {downloadingImages ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>TẢI CẢ 2 ẢNH (JPG 1920x1920)</span>
            </button>
          </div>

          {/* RECEIPT PAPER PREVIEW CONTAINER */}
          <div className="bg-[#F8F6F0] border-4 border-[#0E5140] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6 text-[#1A1A1A] font-mono">
            
            {/* Header Badge */}
            <div className="flex justify-between items-start border-b-2 border-dashed border-[#0E5140] pb-4">
              <div>
                <span className="bg-[#0E5140] text-[#00E08A] px-3 py-1 rounded text-xs font-black">
                  LƯỚT KHÓI · MINIGAME
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-2 text-[#0E5140]">
                  XANHWRAP PHIẾU HOÀN THỜI GIAN
                </h2>
                <p className="text-xs text-[#666666]">
                  NGƯỜI LƯỚT CHẶNG: <strong>{resultReceipt.nickname.toUpperCase()}</strong> · {resultReceipt.recordDate}
                </p>
              </div>
            </div>

            {/* IDENTITY LABEL BADGE */}
            <div className={`p-4 rounded-2xl text-center shadow-inner ${
              resultReceipt.labelGroup === 'green' ? 'bg-[#0E5140] text-[#00E08A]' : 'bg-[#2C2C2A] text-[#F5F1E8]'
            }`}>
              <span className="text-xs uppercase tracking-widest block opacity-75">Nhãn Danh Tính Của Bạn</span>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 tracking-wider">
                ▓▓ {resultReceipt.assignedLabelName} ▓▓
              </h3>
            </div>

            {/* Rarity Tag */}
            <div className="text-center text-xs text-[#666666] font-bold">
              {resultReceipt.rarityPct ? `🔥 ĐỘ HIẾM ${resultReceipt.rarityPct}% · 1 TRONG 16 NHÃN` : '✨ 1 TRONG 16 NHÃN DANH TÍNH ĐỘC ĐÁO'}
            </div>

            {/* MAIN METRIC BOX */}
            <div className="bg-[#0E5140] text-white p-6 rounded-2xl text-center space-y-2">
              <span className="text-xs text-[#00E08A] uppercase font-extrabold tracking-widest">Thời gian không phải cầm lái</span>
              <div className="text-4xl sm:text-5xl font-black text-[#00E08A]">
                {resultReceipt.handsFreeMin || resultReceipt.transitMin} PHÚT
              </div>
              <p className="text-xs font-bold text-white/90">
                = {resultReceipt.daysPerYear} NGÀY TỰ DO TRONG NĂM NAY
              </p>
              <p className="text-[11px] text-white/70">
                Tương đương thưởng thức {resultReceipt.episodesPerYear} tập phim truyền hình!
              </p>
            </div>

            {/* LEGS DETAIL */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0E5140]">
                CHI TIẾT {resultReceipt.legsJson?.length || 2} CHẶNG (TỔNG {resultReceipt.totalKm} KM)
              </h4>
              
              <div className="space-y-2">
                {(resultReceipt.legsJson || []).map((leg: XanhWrapLeg, i: number) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#0E5140]">{i + 1}. [{leg.depart_time}]</span> {leg.from} → {leg.to}
                    </div>
                    <span className="font-mono text-gray-600 font-bold shrink-0 ml-2">
                      {leg.distance_km}km ({leg.duration_min}m)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barcode & Lucky number */}
            <div className="border-t-2 border-dashed border-[#0E5140] pt-4 text-center space-y-2">
              <div className="h-10 bg-[repeating-linear-gradient(90deg,#1A1A1A,#1A1A1A_4px,transparent_4px,transparent_8px)] rounded max-w-sm mx-auto opacity-80" />
              <div className="text-sm font-black text-[#0E5140]">
                SỐ DỰ THI MAY MẮN: #{resultReceipt.luckyNumber}
              </div>
            </div>
          </div>

          {/* STEP 3: SHARE CAPTION & LINK SUBMISSION FORM */}
          <div className="bg-white border border-eco-mint rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 max-w-2xl mx-auto">
            <h3 className="text-md font-black uppercase text-eco-ink flex items-center space-x-2 border-b border-eco-mint pb-3">
              <ExternalLink className="w-5 h-5 text-eco-primary" />
              <span>Đăng Bài MXH & Nộp Link Nhận Giải</span>
            </h3>

            {/* Caption sample box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-eco-muted">Mẫu Caption dự thi (Đã chuẩn hóa):</span>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center space-x-1 text-xs font-bold text-eco-primary hover:text-eco-primaryDeep bg-eco-mint/40 px-3 py-1 rounded-lg transition-colors"
                >
                  {copiedCaption ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Đã chép Caption!' : 'Sao chép Caption'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={4}
                value={`Nhãn của mình: [ ${resultReceipt.assignedLabelName} ] — độ hiếm ${resultReceipt.rarityPct ? resultReceipt.rarityPct + '%' : 'mới'}
Một ngày mình có ${resultReceipt.handsFreeMin || resultReceipt.transitMin} phút không phải cầm lái. Đổi sang buýt/metro thì lấy lại được ${resultReceipt.daysPerYear} ngày tự do mỗi năm!
💬 Dòng suy nghĩ: "${resultReceipt.reflection}"
🎲 Số dự thi may mắn: #${resultReceipt.luckyNumber}
#XanhWrap #LuotKhoiChamXanh #EcoTransit`}
                className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl p-3 text-xs font-mono text-eco-ink select-all focus:outline-none"
              />
            </div>

            {/* Submission form */}
            {!submissionResult ? (
              <form onSubmit={handleSubmitPostLink} className="space-y-4 pt-2 border-t border-eco-mint">
                <div>
                  <label className="block text-xs font-extrabold text-eco-ink mb-1">
                    Dán URL bài viết công khai của bạn (Facebook / Instagram / Threads) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    className="w-full bg-eco-soft/40 border border-eco-primary/20 rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-eco-primary"
                    required
                  />
                  <span className="text-[10px] text-eco-muted">Bài đăng kèm 2 ảnh phiếu vừa tải về và mở chế độ Công khai</span>
                </div>

                <button
                  type="submit"
                  disabled={submittingLink}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submittingLink ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>NỘP LINK BÀI DỰ THI MINIGAME</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-scale-up">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-md font-black text-emerald-900 uppercase">NỘP BÀI DỰ THI THÀNH CÔNG!</h4>
                <p className="text-xs text-emerald-700 font-semibold">
                  Mã xác nhận dự thi của bạn:
                </p>
                <div className="text-2xl font-black font-mono text-emerald-800 bg-white border border-emerald-300 py-2 px-4 rounded-xl inline-block shadow-sm">
                  {submissionResult.confirmationCode}
                </div>
                <p className="text-[11px] text-emerald-600">
                  BTC sẽ tiến hành đối soát số may mắn #{resultReceipt.luckyNumber} và trao giải sau ngày 31/07/2026.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
