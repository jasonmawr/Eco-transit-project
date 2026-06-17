import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

export interface TimeBillDTO {
  shareSlug: string;
  originLabel: string;
  destinationLabel: string;
  routeTitle?: string | null;
  durationMinutes: number;
  walkingMinutes?: number | null;
  transferCount?: number | null;
  distanceKm?: number | null;
  weatherSummary?: string | null;
  preferenceSummary?: string | null;
  greenScore?: number | null;
  estimatedCo2SavedGrams?: number | null;
  estimatedMoneySavedVnd?: number | null;
  headline: string;
  storyText: string;
  routeSnapshot?: any | null;
  isPublic: boolean;
  createdAt: string;
  estimateDisclaimer: string;
}

interface TimeBillCardProps {
  bill: TimeBillDTO;
  isOwner?: boolean;
  onPrivacyUpdated?: (updatedBill: TimeBillDTO) => void;
}

export default function TimeBillCard({
  bill: initialBill,
  isOwner = false,
  onPrivacyUpdated,
}: TimeBillCardProps) {
  const [bill, setBill] = useState<TimeBillDTO>(initialBill);
  const [copied, setCopied] = useState(false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  // Build the shareable URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const shareUrl = siteUrl ? `${siteUrl}/share/${bill.shareSlug}` : `/share/${bill.shareSlug}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy using Clipboard API:', err);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      setUpdatingPrivacy(true);
      setPrivacyError(null);
      const newStatus = !bill.isPublic;
      
      const updated = await apiFetch(`/api/time-bills/${bill.shareSlug}/privacy`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublic: newStatus }),
      });

      setBill(updated);
      if (onPrivacyUpdated) {
        onPrivacyUpdated(updated);
      }
    } catch (err: any) {
      console.error('Failed to update privacy:', err);
      setPrivacyError(err.message || 'Lỗi cập nhật quyền riêng tư.');
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl relative overflow-hidden font-outfit p-6 text-white flex flex-col space-y-5 animate-fade-in">
      
      {/* Decorative top green glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none" />

      {/* Header section with brand and date */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-xl">🌿</span>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">EcoTransit</span>
            <span className="text-[8px] text-white/50 tracking-wider font-extrabold uppercase">Hóa Đơn Lướt Khói</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[9px] text-white/40 block font-bold">NGÀY TẠO</span>
          <span className="text-[10px] text-white/80 font-mono">
            {new Date(bill.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Route title & stations block */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col space-y-2 relative">
        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-extrabold tracking-wider uppercase">
          <span>Hành Trình Di Chuyển</span>
          {bill.routeTitle && <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-[9px] normal-case">{bill.routeTitle}</span>}
        </div>
        <div className="flex flex-col space-y-1 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs shrink-0">🟢</span>
            <span className="text-xs font-extrabold truncate text-white/95">{bill.originLabel}</span>
          </div>
          <div className="w-0.5 h-3 bg-white/20 ml-1.5" />
          <div className="flex items-center space-x-2">
            <span className="text-xs shrink-0">🔴</span>
            <span className="text-xs font-extrabold truncate text-white/95">{bill.destinationLabel}</span>
          </div>
        </div>
      </div>

      {/* Main Campaign Score & Stats display */}
      <div className="grid grid-cols-12 gap-3 items-center bg-white/5 border border-white/10 rounded-2xl p-4">
        {/* Left column: Green Score */}
        <div className="col-span-5 flex flex-col items-center justify-center border-r border-white/10 pr-2">
          <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider text-center mb-1">ĐIỂM XANH</span>
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md">
            <div className="absolute inset-0.5 bg-slate-900 rounded-full flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono leading-none text-emerald-400">{bill.greenScore || 10}</span>
              <span className="text-[8px] font-bold text-white/40 mt-0.5">/ 100</span>
            </div>
          </div>
        </div>

        {/* Right column: Trip metrics summary */}
        <div className="col-span-7 pl-2 grid grid-cols-2 gap-y-2.5 gap-x-1.5 text-left">
          <div className="flex flex-col">
            <span className="text-[8px] text-white/40 font-bold uppercase">Thời gian</span>
            <span className="text-xs font-mono font-black text-white/90">{bill.durationMinutes} phút</span>
          </div>
          {bill.walkingMinutes !== undefined && bill.walkingMinutes !== null && (
            <div className="flex flex-col">
              <span className="text-[8px] text-white/40 font-bold uppercase">Đi bộ</span>
              <span className="text-xs font-mono font-black text-white/90">{bill.walkingMinutes} phút</span>
            </div>
          )}
          {bill.transferCount !== undefined && bill.transferCount !== null && (
            <div className="flex flex-col">
              <span className="text-[8px] text-white/40 font-bold uppercase">Trung chuyển</span>
              <span className="text-xs font-mono font-black text-white/90">{bill.transferCount} lần</span>
            </div>
          )}
          {bill.distanceKm !== undefined && bill.distanceKm !== null && (
            <div className="flex flex-col">
              <span className="text-[8px] text-white/40 font-bold uppercase">Quãng đường</span>
              <span className="text-xs font-mono font-black text-white/90">{bill.distanceKm} km</span>
            </div>
          )}
        </div>
      </div>

      {/* CO2 & Money Saved Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center flex flex-col justify-center items-center">
          <span className="text-[14px] mb-1">🍃</span>
          <span className="text-[8px] text-emerald-400 font-extrabold uppercase">CO2 Giảm Thiểu</span>
          <span className="text-base font-mono font-black text-emerald-300 mt-0.5">
            {bill.estimatedCo2SavedGrams ? `-${bill.estimatedCo2SavedGrams}g` : '0g'}
          </span>
        </div>
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-3 text-center flex flex-col justify-center items-center">
          <span className="text-[14px] mb-1">💰</span>
          <span className="text-[8px] text-teal-400 font-extrabold uppercase">Chi phí tiết kiệm</span>
          <span className="text-base font-mono font-black text-teal-300 mt-0.5">
            {bill.estimatedMoneySavedVnd ? `-${bill.estimatedMoneySavedVnd.toLocaleString('vi-VN')}đ` : '0đ'}
          </span>
        </div>
      </div>

      {/* Campaign speech block */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-1.5 leading-relaxed">
        <div className="font-extrabold text-emerald-400">{bill.headline}</div>
        <p className="text-white/80 font-medium text-[11px]">{bill.storyText}</p>
      </div>

      {/* Share / Copy area */}
      <div className="flex flex-col space-y-2 pt-1">
        <span className="text-[9px] text-white/40 font-extrabold tracking-wider uppercase">Liên Kết Chia Sẻ</span>
        <div className="flex items-center space-x-2 bg-slate-900 border border-white/10 rounded-xl p-2.5 relative">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-[10px] text-white/70 w-full outline-none select-all font-mono"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopyLink}
            type="button"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg shrink-0 transition-all active:scale-95"
          >
            {copied ? 'Đã chép! ✓' : 'Sao chép'}
          </button>
        </div>
      </div>

      {/* Owner settings toggle */}
      {isOwner && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-white/70">Chế độ riêng tư:</span>
            <button
              onClick={handleTogglePrivacy}
              disabled={updatingPrivacy}
              className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all ${
                bill.isPublic
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-400/40 hover:bg-rose-500/30'
              }`}
            >
              {updatingPrivacy ? 'Đang cập nhật...' : (bill.isPublic ? 'Công khai 🌐' : 'Riêng tư 🔒')}
            </button>
          </div>
          {privacyError && <span className="text-[9px] text-rose-400">{privacyError}</span>}
        </div>
      )}

      {/* Mandatory Estimate Disclaimer */}
      <div className="border-t border-white/5 pt-3.5 text-center">
        <p className="text-[9px] text-white/35 italic leading-normal">
          ⚠️ {bill.estimateDisclaimer}
        </p>
      </div>
    </div>
  );
}
