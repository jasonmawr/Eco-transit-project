'use client';

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { 
  XanhWrapLeg, 
  XANHWRAP_PRESETS, 
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
    { from: '', to: '', depart_time: '07:15', mode: 'metro', distance_km: 10, duration_min: 25, transit_line: 'Metro số 1' },
    { from: '', to: '', depart_time: '17:30', mode: 'bus', distance_km: 10, duration_min: 30, transit_line: 'Buýt công cộng' },
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

  // Helper drawing realistic leaf graphics on canvas
  const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angleDeg: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angleDeg * Math.PI) / 180);
    
    ctx.strokeStyle = '#2E963D';
    ctx.lineWidth = Math.max(3, size * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.4);
    ctx.quadraticCurveTo(size * 0.1, 0, size * 0.9, -size * 0.7);
    ctx.stroke();

    ctx.fillStyle = '#39B54A';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.6, -size * 0.3, -size * 0.5, -size * 0.9, size * 0.2, -size * 1.1);
    ctx.bezierCurveTo(size * 0.8, -size * 0.9, size * 0.7, -size * 0.3, 0, 0);
    ctx.fill();

    ctx.strokeStyle = '#1D6829';
    ctx.lineWidth = Math.max(2, size * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.2, -size * 1.05);
    ctx.stroke();

    ctx.restore();
  };

  // Helper drawing wind streak curves on canvas
  const drawWindStreak = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, opacity: number = 0.6) => {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1 - 100, y1 + (y2 - y1) * 0.5, x2 + 100, y1 + (y2 - y1) * 0.5, x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  // Generate and Download 2 Square JPG receipt images via HTML5 Canvas (Matching Official Campaign Visual 100%)
  const handleDownloadSquareImages = async () => {
    if (!resultReceipt) return;
    setDownloadingImages(true);

    try {
      const createSquareCanvas = (part: 1 | 2): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;

        // 1. Sky Blue Background Gradient (#84D0FF to #B6E5FF)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
        bgGrad.addColorStop(0, '#84D0FF');
        bgGrad.addColorStop(1, '#B6E5FF');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1920, 1920);

        // 2. Wind Streaks Graphics (Hiệu ứng gió)
        drawWindStreak(ctx, 100, 1400, 400, 1800, 0.7);
        drawWindStreak(ctx, 60, 1200, 300, 1600, 0.5);
        drawWindStreak(ctx, 1600, 800, 1900, 1300, 0.6);
        drawWindStreak(ctx, 1500, 1000, 1850, 1500, 0.4);

        // 3. Floating Green Leaves (Hiệu ứng lá cây lướt gió)
        drawLeaf(ctx, 120, 1500, 110, -30);
        drawLeaf(ctx, 80, 1750, 130, 20);
        drawLeaf(ctx, 220, 1850, 100, -10);
        drawLeaf(ctx, 1820, 1200, 140, 45);
        drawLeaf(ctx, 1780, 1500, 120, -25);
        drawLeaf(ctx, 1860, 1780, 110, 15);

        if (part === 1) {
          // PART 1: TOP HALF MASTER
          // 4. Top Brand Header Bar Logos (Đã bỏ dòng 20 NĂM ĐẤT NƯỚC)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = '900 30px "Space Mono", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FPT UNIVERSITY   |   COMMUNICATION TECHNOLOGY   |   LUOT KHOI CHAM XANH', 960, 80);

          // 5. Left Slanted Slogan Logo Badge "LƯỚT KHÓI CHẠM XANH"
          ctx.save();
          ctx.translate(220, 210);
          ctx.rotate((-12 * Math.PI) / 180);
          
          ctx.fillStyle = '#0054A6';
          ctx.font = '900 64px "Space Mono", sans-serif';
          ctx.fillText('LUOT', 0, 0);

          ctx.fillStyle = '#8CC63F';
          ctx.beginPath();
          ctx.roundRect(140, -55, 230, 75, [16]);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('KHOI', 160, 0);

          ctx.fillStyle = '#0054A6';
          ctx.font = '900 52px "Space Mono", sans-serif';
          ctx.fillText('CHAM XANH', 0, 60);
          ctx.restore();

          // 6. Title Text: "MỘT NGÀY LÁI XE BẠN LẤY LẠI ĐƯỢC BAO NHIÊU THỜI GIAN?"
          ctx.fillStyle = '#0054A6';
          ctx.textAlign = 'center';
          ctx.font = '900 86px "Space Mono", sans-serif';
          ctx.fillText('MỘT NGÀY LÁI XE', 960, 360);
          ctx.font = '800 68px "Space Mono", sans-serif';
          ctx.fillText('BẠN LẤY LẠI ĐƯỢC', 960, 450);
          ctx.font = '900 86px "Space Mono", sans-serif';
          ctx.fillText('BAO NHIÊU THỜI GIAN?', 960, 540);

          // 7. Realistic Leaf Top-Right of Receipt Paper Corner
          drawLeaf(ctx, 1640, 660, 140, 15);

          // 8. Solid Blue Backing Frame (#0054A6)
          ctx.fillStyle = '#0054A6';
          ctx.fillRect(250, 620, 1420, 1300);

          // 9. Cream Receipt Paper (#FFF7E3)
          ctx.fillStyle = '#FFF7E3';
          ctx.fillRect(275, 645, 1370, 1275);

          // Receipt Header Inside Paper
          ctx.textAlign = 'center';
          ctx.fillStyle = '#1C480C';
          ctx.font = '900 56px "Space Mono", monospace';
          ctx.fillText('X A N H W R A P', 960, 740);
          ctx.font = '700 36px "Space Mono", monospace';
          ctx.fillText('PHIẾU HOÀN THỜI GIAN', 960, 790);

          // Dashed Divider Line
          ctx.strokeStyle = '#1C480C';
          ctx.lineWidth = 6;
          ctx.setLineDash([20, 15]);
          ctx.beginPath();
          ctx.moveTo(330, 830);
          ctx.lineTo(1590, 830);
          ctx.stroke();
          ctx.setLineDash([]);

          // Metadata row: Đã thay thế NGƯỜI LƯỚT CHẶNG thành Tên biệt danh của người dùng gõ
          ctx.textAlign = 'left';
          ctx.font = '800 38px "Space Mono", monospace';
          ctx.fillText(`NGƯỜI LƯỚT CHẶNG: ${resultReceipt.nickname.toUpperCase()}`, 330, 900);
          ctx.textAlign = 'right';
          ctx.fillText(resultReceipt.recordDate || '2026-07-23', 1590, 900);

          // Identity Label Badge (#8CC63F Pill shape)
          ctx.fillStyle = '#8CC63F';
          ctx.beginPath();
          ctx.roundRect(330, 950, 1260, 140, [70]);
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.fillStyle = '#1C480C';
          ctx.font = '900 60px "Space Mono", sans-serif';
          ctx.fillText(resultReceipt.assignedLabelName.toUpperCase(), 960, 1045);

          // Dashed Divider
          ctx.setLineDash([20, 15]);
          ctx.beginPath();
          ctx.moveTo(330, 1130);
          ctx.lineTo(1590, 1130);
          ctx.stroke();
          ctx.setLineDash([]);

          // Render first legs
          const legsList: XanhWrapLeg[] = resultReceipt.legsJson || [];
          let yPos = 1210;

          legsList.slice(0, 4).forEach((leg) => {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#1C480C';
            ctx.font = '700 38px "Space Mono", monospace';
            const legStr = `${leg.depart_time} ${leg.from.toUpperCase()} → ${leg.to.toUpperCase()}`;
            ctx.fillText(legStr, 330, yPos);

            ctx.textAlign = 'right';
            ctx.fillText(`${leg.distance_km}KM           ${leg.duration_min}'`, 1590, yPos);

            yPos += 85;
          });

        } else {
          // PART 2: BOTTOM HALF MASTER
          // 4. Solid Blue Backing Frame (#0054A6) with bottom-right folded corner shape
          ctx.fillStyle = '#0054A6';
          ctx.beginPath();
          ctx.moveTo(250, 0);
          ctx.lineTo(1670, 0);
          ctx.lineTo(1670, 1640);
          ctx.lineTo(1570, 1740); // 45-deg folded corner
          ctx.lineTo(250, 1740);
          ctx.closePath();
          ctx.fill();

          // 5. Cream Receipt Paper (#FFF7E3)
          ctx.fillStyle = '#FFF7E3';
          ctx.beginPath();
          ctx.moveTo(275, 0);
          ctx.lineTo(1645, 0);
          ctx.lineTo(1645, 1615);
          ctx.lineTo(1545, 1715);
          ctx.lineTo(275, 1715);
          ctx.closePath();
          ctx.fill();

          // Render remaining legs if any
          const legsList: XanhWrapLeg[] = resultReceipt.legsJson || [];
          let yPos = 80;

          if (legsList.length > 4) {
            legsList.slice(4, 8).forEach((leg) => {
              ctx.textAlign = 'left';
              ctx.fillStyle = '#1C480C';
              ctx.font = '700 38px "Space Mono", monospace';
              const legStr = `${leg.depart_time} ${leg.from.toUpperCase()} → ${leg.to.toUpperCase()}`;
              ctx.fillText(legStr, 330, yPos);

              ctx.textAlign = 'right';
              ctx.fillText(`${leg.distance_km}KM           ${leg.duration_min}'`, 1590, yPos);

              yPos += 85;
            });
          }

          // Dashed Divider Line
          ctx.strokeStyle = '#1C480C';
          ctx.lineWidth = 6;
          ctx.setLineDash([20, 15]);
          ctx.beginPath();
          ctx.moveTo(330, yPos);
          ctx.lineTo(1590, yPos);
          ctx.stroke();
          ctx.setLineDash([]);
          yPos += 75;

          // Comparison lines
          ctx.textAlign = 'left';
          ctx.fillStyle = '#1C480C';
          ctx.font = '800 40px "Space Mono", monospace';
          ctx.fillText('TỰ LÁI HÔM NAY', 330, yPos);
          ctx.textAlign = 'right';
          const totalHours = Math.floor(resultReceipt.totalMin / 60);
          const totalMinsRem = resultReceipt.totalMin % 60;
          ctx.fillText(`${resultReceipt.totalKm}KM         ${totalHours}H ${totalMinsRem < 10 ? '0' : ''}${totalMinsRem}'`, 1590, yPos);
          yPos += 75;

          ctx.textAlign = 'left';
          ctx.fillText('NẾU ĐI PHƯƠNG TIỆN CÔNG CỘNG', 330, yPos);
          ctx.textAlign = 'right';
          const pubMins = resultReceipt.handsFreeMin || resultReceipt.transitMin || resultReceipt.metricValue || resultReceipt.totalMin;
          const pubHours = Math.floor(pubMins / 60);
          const pubMinsRem = pubMins % 60;
          ctx.fillText(`${pubHours > 0 ? pubHours + 'H ' : ''}${pubMinsRem}'`, 1590, yPos);
          yPos += 95;

          // Highlight Green Card Box (#8CC63F)
          ctx.fillStyle = '#8CC63F';
          ctx.beginPath();
          ctx.roundRect(330, yPos, 1260, 360, [32]);
          ctx.fill();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#1C480C';
          ctx.font = '900 50px "Space Mono", sans-serif';
          ctx.fillText('HOÀN LẠI CHO BẠN', 390, yPos + 85);

          const savedText = `${pubMins}'`;

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '900 115px "Space Mono", sans-serif';
          ctx.fillText(savedText, 390, yPos + 220);

          ctx.fillStyle = '#1C480C';
          ctx.font = '900 50px "Space Mono", sans-serif';
          ctx.fillText('MỖI NGÀY', 1050, yPos + 220);

          ctx.fillStyle = '#0054A6';
          ctx.font = '900 52px "Space Mono", sans-serif';
          ctx.fillText(`= ${resultReceipt.daysPerYear} NGÀY TRONG NĂM NAY`, 390, yPos + 310);

          yPos += 440;

          // Barcode graphics
          ctx.fillStyle = '#1A1A1A';
          for (let x = 390; x < 1530; x += 18) {
            const barWidth = Math.random() > 0.4 ? 12 : 5;
            ctx.fillRect(x, yPos, barWidth, 130);
          }
          yPos += 175;

          ctx.textAlign = 'center';
          ctx.fillStyle = '#1C480C';
          ctx.font = '800 42px "Space Mono", monospace';
          ctx.fillText(`MÃ HD ${resultReceipt.id.slice(0, 4).toUpperCase()}   •   SỐ DỰ THẺ ${resultReceipt.luckyNumber}`, 960, yPos);
          yPos += 75;

          // Bottom Solid Blue Diagonal Zig-Zag Perforated Teeth (#0054A6)
          ctx.fillStyle = '#0054A6';
          for (let px = 275; px <= 1500; px += 60) {
            ctx.beginPath();
            ctx.moveTo(px, yPos);
            ctx.lineTo(px + 30, yPos + 40);
            ctx.lineTo(px + 60, yPos);
            ctx.fill();
          }

          // Bottom Hashtags
          ctx.textAlign = 'center';
          ctx.fillStyle = '#0054A6';
          ctx.font = '900 48px "Space Mono", sans-serif';
          ctx.fillText('#XanhWrap #LuotKhoiChamXanh', 960, 1860);
        }

        return canvas;
      };

      // Generate Image 1 & Image 2
      const canvas1 = createSquareCanvas(1);
      const canvas2 = createSquareCanvas(2);

      const link1 = document.createElement('a');
      link1.download = `xanhwrap_${resultReceipt.id}_1.jpg`;
      link1.href = canvas1.toDataURL('image/jpeg', 0.95);
      link1.click();

      setTimeout(() => {
        const link2 = document.createElement('a');
        link2.download = `xanhwrap_${resultReceipt.id}_2.jpg`;
        link2.href = canvas2.toDataURL('image/jpeg', 0.95);
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
      <div className="bg-gradient-to-r from-[#0054A6] via-eco-primary to-[#8CC63F] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Printer className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/20 border border-white/40 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chiến dịch Lướt Khói Chạm Xanh · Minigame 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight">
            MÁY IN PHIẾU XANHWRAP
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
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
              <Sparkles className="w-4 h-4 text-eco-[#8CC63F]" />
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
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Điểm đi (Phường/Khu vực)</label>
                      <input
                        type="text"
                        list="suggested-locations"
                        placeholder="VD: P. Linh Trung, P. Bến Thành, Nhà..."
                        value={leg.from}
                        onChange={(e) => handleLegChange(idx, 'from', e.target.value)}
                        className="w-full bg-eco-soft/40 border border-eco-primary/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-eco-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-eco-muted mb-1">Điểm đến (Phường/Khu vực)</label>
                      <input
                        type="text"
                        list="suggested-locations"
                        placeholder="VD: P. Bến Thành, P. Thảo Điền, Trường ĐH FPT..."
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
              className="px-6 py-2.5 bg-[#0054A6] hover:bg-eco-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {downloadingImages ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>TẢI CẢ 2 ẢNH (JPG 1920x1920)</span>
            </button>
          </div>

          {/* RECEIPT PAPER PREVIEW CONTAINER (Matching Official Campaign Visual 100%) */}
          <div className="bg-[#84D0FF] p-3 sm:p-10 rounded-3xl shadow-2xl max-w-2xl mx-auto space-y-4 sm:space-y-6 relative overflow-hidden">
            
            {/* Header Brand Logos Row (Đã bỏ dòng 20 NĂM ĐẤT NƯỚC theo yêu cầu) */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black text-white/90 uppercase font-mono tracking-wider border-b border-white/30 pb-2">
              <span>FPT UNIVERSITY</span>
              <span>COMMUNICATION TECHNOLOGY</span>
              <span className="text-[#0054A6] bg-white/80 px-1.5 py-0.5 rounded font-black">LƯỚT KHÓI CHẠM XANH</span>
            </div>

            {/* Master Header Title & Slanted Slogan Logo */}
            <div className="relative text-center space-y-1 text-[#0054A6]">
              {/* Slanted Logo Badge */}
              <div className="absolute -left-1 -top-3 transform -rotate-12 scale-75 sm:scale-100 origin-top-left bg-white/90 border-2 border-[#0054A6] px-2 py-1 rounded-xl shadow-md text-left text-[10px] leading-tight">
                <span className="font-black text-[#0054A6] block">LƯỚT</span>
                <span className="font-black bg-[#8CC63F] text-white px-1 rounded inline-block">KHÓI</span>
                <span className="font-black text-[#0054A6] block">CHẠM XANH</span>
              </div>

              <h2 className="text-xl sm:text-4xl font-black font-mono uppercase tracking-tight text-[#0054A6] pt-1">
                MỘT NGÀY LÁI XE
              </h2>
              <p className="text-xs sm:text-xl font-extrabold font-mono text-[#0054A6]">
                BẠN LẤY LẠI ĐƯỢC
              </p>
              <h3 className="text-lg sm:text-3xl font-black font-mono uppercase text-[#0054A6]">
                BAO NHIÊU THỜI GIAN?
              </h3>
            </div>

            {/* Cream Receipt Paper with Solid Blue Frame Backing */}
            <div className="bg-[#0054A6] p-1.5 sm:p-2.5 rounded-3xl shadow-2xl relative">
              
              {/* Top-Right Realistic Leaf Stick Graphics */}
              <div className="absolute -top-7 -right-1 z-20 pointer-events-none transform rotate-12">
                {/* Cuống lá mảnh uốn cong */}
                <div className="w-1.5 h-8 bg-[#2E963D] rounded-full mx-auto shadow-sm" />
                {/* Phiến lá xanh tươi hình giọt nước bầu bám cuống */}
                <div className="w-7 h-10 bg-[#39B54A] border border-[#2E963D] rounded-tl-full rounded-br-full transform -rotate-45 shadow-md -mt-3" />
              </div>

              {/* Inner Cream Paper (#FFF7E3) */}
              <div className="bg-[#FFF7E3] rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-5 text-[#1C480C] font-mono relative overflow-hidden">
                
                {/* Header Title */}
                <div className="text-center border-b-2 border-dashed border-[#1C480C] pb-3 sm:pb-4 space-y-0.5">
                  <h3 className="text-lg sm:text-2xl font-black tracking-widest text-[#1C480C]">
                    X A N H W R A P
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-[#1C480C]/80 uppercase">
                    PHIẾU HOÀN THỜI GIAN
                  </p>
                </div>

                {/* Metadata Row: Hiển thị tên biệt danh người dùng điền lúc đầu */}
                <div className="flex justify-between items-center text-[10px] sm:text-xs font-extrabold">
                  <span className="truncate pr-2">NGƯỜI LƯỚT CHẶNG: <strong>{resultReceipt.nickname.toUpperCase()}</strong></span>
                  <span className="shrink-0">{resultReceipt.recordDate || '2026-07-23'}</span>
                </div>

                {/* Green Pill Identity Badge (#8CC63F) */}
                <div className="bg-[#8CC63F] text-[#1C480C] py-2.5 px-4 sm:py-3.5 sm:px-6 rounded-full text-center shadow-md">
                  <h4 className="text-base sm:text-2xl font-black tracking-wider uppercase">
                    {resultReceipt.assignedLabelName}
                  </h4>
                </div>

                {/* Legs Table Breakdown */}
                <div className="border-t-2 border-b-2 border-dashed border-[#1C480C] py-3 space-y-2">
                  {(resultReceipt.legsJson || []).map((leg: XanhWrapLeg, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[10px] sm:text-xs font-bold font-mono">
                      <span className="truncate pr-1">
                        {leg.depart_time} {leg.from.toUpperCase()} → {leg.to.toUpperCase()}
                      </span>
                      <span className="shrink-0 font-bold ml-1">
                        {leg.distance_km}KM &nbsp; {leg.duration_min}'
                      </span>
                    </div>
                  ))}
                </div>

                {/* Self-drive comparison summary */}
                <div className="space-y-2 text-xs font-extrabold">
                  <div className="flex justify-between items-center">
                    <span>TỰ LÁI HÔM NAY</span>
                    <span>{resultReceipt.totalKm}KM &nbsp;&nbsp;&nbsp; {Math.floor(resultReceipt.totalMin / 60)}H {resultReceipt.totalMin % 60}'</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-900">
                    <span>NẾU ĐI PHƯƠNG TIỆN CÔNG CỘNG</span>
                    <span>
                      {Math.floor((resultReceipt.handsFreeMin || resultReceipt.transitMin || resultReceipt.totalMin) / 60) > 0 
                        ? `${Math.floor((resultReceipt.handsFreeMin || resultReceipt.transitMin || resultReceipt.totalMin) / 60)}H ` 
                        : ''
                      }{(resultReceipt.handsFreeMin || resultReceipt.transitMin || resultReceipt.totalMin) % 60}'
                    </span>
                  </div>
                </div>

                {/* HIGHLIGHT GREEN CARD BOX (#8CC63F) */}
                <div className="bg-[#8CC63F] text-[#1C480C] p-5 sm:p-6 rounded-2xl space-y-2 shadow-md">
                  <span className="text-xs font-black uppercase tracking-wider block">HOÀN LẠI CHO BẠN</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-5xl font-black text-white drop-shadow-sm">
                      {(resultReceipt.handsFreeMin || resultReceipt.transitMin || resultReceipt.metricValue || resultReceipt.totalMin)}'
                    </span>
                    <span className="text-sm font-black uppercase tracking-wider">MỖI NGÀY</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#0054A6] pt-1">
                    = {resultReceipt.daysPerYear} NGÀY TRONG NĂM NAY
                  </div>
                </div>

                {/* Barcode & Lucky number */}
                <div className="pt-2 text-center space-y-3">
                  <div className="h-12 bg-[repeating-linear-gradient(90deg,#1A1A1A,#1A1A1A_4px,transparent_4px,transparent_8px)] rounded max-w-sm mx-auto opacity-90" />
                  <div className="text-xs font-black text-[#1C480C] tracking-wider uppercase">
                    MÃ HD {resultReceipt.id.slice(0, 4).toUpperCase()} &nbsp;•&nbsp; SỐ DỰ THẺ {resultReceipt.luckyNumber}
                  </div>
                </div>
              </div>

              {/* Bottom Solid Blue Perforated Teeth */}
              <div className="flex justify-between items-center pt-1.5 px-2">
                {[...Array(16)].map((_, idx) => (
                  <div key={idx} className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-[#0054A6]" />
                ))}
              </div>
            </div>

            {/* Bottom Hashtags Banner */}
            <div className="text-center text-[#0054A6] font-black text-sm tracking-wider font-mono">
              #XanhWrap #LuotKhoiChamXanh
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
