'use client';

import React from 'react';
import { MotionFlowBackground } from './ui/motion-flow-background';
import { PremiumCta } from './ui/premium-cta';

interface HeroSectionProps {
  onSectionSelect?: (sectionId: string) => void;
}

export default function HeroSection({ onSectionSelect }: HeroSectionProps) {
  const handleScroll = (id: string) => {
    const targetId = id === 'planner' ? 'route' : id;
    if (onSectionSelect) {
      onSectionSelect(targetId);
    }
  };

  return (
    <section className="relative overflow-hidden border border-eco-primary/10 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm mb-2 text-center lg:text-left flex flex-col justify-center">
      {/* Animated waves, leaves, and grain texture */}
      <MotionFlowBackground />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10 w-full">
        
        {/* Left text panel */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-eco-primary/15 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-eco-primary animate-pulse-glow" />
            <span className="text-[9px] font-black uppercase tracking-wider text-eco-primary">
              Đặc quyền di chuyển xanh — Lướt Khói Chạm Xanh
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-eco-ink leading-tight tracking-tight uppercase font-display-campaign">
            Lướt khỏi khói xe <br />
            <span className="text-eco-primary">Chạm lựa chọn xanh</span>
          </h1>

          <p className="text-eco-muted text-xs sm:text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
            Thảnh thơi di chuyển đô thị bằng hệ thống Metro & Xe Buýt Điện kết nối thông minh tại TP.HCM. 
            Rảnh tay lướt điện thoại, giảm bớt căng thẳng khói bụi và tối ưu chi phí đi lại hàng ngày.
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center lg:justify-start pt-1">
            <PremiumCta onClick={() => handleScroll('route')} className="w-full sm:w-auto">
              🛤️ Lướt lộ trình ngay
            </PremiumCta>
            
            <PremiumCta variant="secondary" onClick={() => handleScroll('stations')} className="w-full sm:w-auto">
              🚉 Bản đồ & Ga tàu
            </PremiumCta>
          </div>
        </div>

        {/* Right 3D-inspired CSS animated graphic — compact for desktop fold */}
        <div className="lg:col-span-5 relative w-full max-w-[200px] mx-auto select-none hidden lg:block">
          {/* Circular radial glow background using official palette */}
          <div className="absolute inset-0 bg-gradient-to-tr from-eco-primary/10 via-eco-accentGreen/10 to-transparent rounded-full blur-3xl" />

          {/* Perspective Container */}
          <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
            
            {/* The base grid placeholder representing mapping */}
            <div className="w-[85%] h-[85%] border-2 border-dashed border-eco-primary/20 rounded-2xl rotate-[-12deg] skew-x-[12deg] relative glass-panel p-3 flex flex-col justify-between overflow-hidden">
              
              {/* Transit line illustration */}
              <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 200 200">
                <path d="M 20,180 Q 100,100 180,30" fill="none" stroke="#0066FF" strokeWidth="4" strokeLinecap="round" />
                <path d="M 30,120 Q 90,160 170,110" fill="none" stroke="#9FCE1A" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,3" />
                <circle r="5.5" fill="#0066FF" className="animate-metro-move">
                  <animateMotion path="M 20,180 Q 100,100 180,30" dur="6s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.03] pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-eco-ink" />
                ))}
              </div>

              <div className="absolute top-[25%] right-[20%] w-2.5 h-2.5 rounded-full bg-eco-accentGreen border-2 border-white shadow" />
              <div className="absolute bottom-[20%] left-[20%] w-2.5 h-2.5 rounded-full bg-eco-primary border-2 border-white shadow animate-pulse-glow" />
            </div>

            {/* Floating 3D card — compact */}
            <div className="absolute w-[160px] top-[5%] left-[0%] glass-panel rounded-xl p-2.5 shadow-lg border border-white/40 rotate-[6deg] -translate-y-1 animate-float-card flex flex-col justify-between space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-eco-muted uppercase tracking-wider">LỘ TRÌNH XANH</span>
                <span className="text-[8px] font-black text-eco-primary bg-eco-mint border border-eco-primary/20 px-1.5 py-0.5 rounded-full">
                  Ưu tiên
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <div className="w-7 h-7 rounded-lg bg-eco-mint flex items-center justify-center text-sm shadow-sm border border-eco-primary/10">
                  🚇
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-eco-ink">Metro Số 1</h4>
                  <p className="text-[8px] text-eco-muted">Bến Thành → Thảo Điền</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-eco-primary/10">
                <span className="text-[8px] text-eco-muted font-bold">Thời gian</span>
                <span className="text-[10px] font-black text-eco-primary font-mono">20 phút</span>
              </div>
            </div>

            {/* Tiny Floating Stats bubble */}
            <div className="absolute w-[90px] bottom-[10%] right-[0%] bg-white/95 backdrop-blur-xs rounded-lg p-1.5 shadow-md border border-eco-primary/10 text-center rotate-[-4deg]">
              <div className="text-[8px] text-eco-muted font-bold">Điểm tích lũy</div>
              <div className="text-[10px] font-black text-eco-accentGreenDeep font-mono">+120đ</div>
            </div>

          </div>
        </div>

      </div>

      {/* Stats ribbon at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-eco-primary/15 to-transparent" />
    </section>
  );
}
