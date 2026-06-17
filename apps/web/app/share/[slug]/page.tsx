'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import TimeBillCard, { TimeBillDTO } from '../../../components/TimeBillCard';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [bill, setBill] = useState<TimeBillDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBill = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(`/api/time-bills/${slug}`);
        setBill(data);
      } catch (err: any) {
        console.error('Fetch shared bill error:', err);
        setError(err.message || 'Không tìm thấy hóa đơn xanh.');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [slug]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 font-outfit relative">
      
      {/* Dynamic background ambient lights */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top logo header */}
      <header className="w-full max-w-sm mx-auto flex items-center justify-between py-4 relative z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-xl">🌿</span>
          <span className="text-sm font-bold tracking-tight">EcoTransit</span>
        </button>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/25">
          Chiến Dịch Lướt Khói
        </span>
      </header>

      {/* Main card viewport */}
      <section className="flex-grow flex items-center justify-center py-6 relative z-10 w-full">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-white/50 font-bold">Đang tải hóa đơn di chuyển xanh...</p>
          </div>
        ) : error || !bill ? (
          <div className="max-w-sm w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <span className="text-4xl block">🔍</span>
            <h3 className="text-base font-black text-white/90">Không Tìm Thấy Hóa Đơn</h3>
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              Liên kết chia sẻ có thể đã hết hạn, sai địa chỉ hoặc hóa đơn được đặt ở chế độ riêng tư bởi người tạo.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95"
            >
              Lập lộ trình xanh của riêng bạn
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <TimeBillCard bill={bill} isOwner={false} />
          </div>
        )}
      </section>

      {/* Footer / CTA section */}
      <footer className="w-full max-w-sm mx-auto py-6 relative z-10 text-center flex flex-col space-y-3">
        {!loading && bill && (
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            Lập lộ trình xanh của riêng bạn 🚀
          </button>
        )}
        <p className="text-[10px] text-white/30 font-medium">
          © {new Date().getFullYear()} EcoTransit. Đồng hành bảo vệ môi trường Thành phố Hồ Chí Minh.
        </p>
      </footer>
    </main>
  );
}
