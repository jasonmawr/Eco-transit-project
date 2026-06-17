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
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="relative overflow-hidden border border-eco-primary/10 rounded-3xl p-6 sm:p-12 shadow-sm mb-10 text-center lg:text-left min-h-[500px] flex flex-col justify-center">
      {/* Animated waves, leaves, and grain texture */}
      <MotionFlowBackground />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 w-full">
        
        {/* Left text panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-eco-primary/15 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-eco-primary animate-pulse-glow" />
            <span className="text-[10px] font-black uppercase tracking-wider text-eco-primary">
              The Gliding Privilege — Lướt Khói Chạm Xanh
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-eco-ink leading-tight tracking-tight uppercase font-display-campaign">
            Lướt khỏi khói xe <br />
            <span className="text-eco-primary">Chạm lựa chọn xanh</span>
          </h1>

          <p className="text-eco-muted text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
            Thảnh thơi di chuyển đô thị bằng hệ thống Metro & Xe Buýt Điện kết nối thông minh tại TP.HCM. 
            Rảnh tay lướt điện thoại, giảm bớt căng thẳng khói bụi và tối ưu chi phí đi lại hàng ngày. 
            Lựa chọn xanh chưa bao giờ tiện lợi đến thế.
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start pt-2">
            <PremiumCta onClick={() => handleScroll('route')} className="w-full sm:w-auto">
              🛤️ Lướt lộ trình ngay
            </PremiumCta>
            
            <PremiumCta variant="secondary" onClick={() => handleScroll('stations')} className="w-full sm:w-auto">
              🚉 Bản đồ & Ga tàu
            </PremiumCta>
          </div>
        </div>

        {/* Right 3D-inspired CSS animated graphic */}
        <div className="lg:col-span-5 relative w-full aspect-square max-w-[350px] mx-auto select-none">
          {/* Circular radial glow background using official palette */}
          <div className="absolute inset-0 bg-gradient-to-tr from-eco-primary/10 via-eco-accentGreen/10 to-transparent rounded-full blur-3xl" />

          {/* Perspective Container */}
          <div className="relative w-full h-full flex items-center justify-center pt-8">
            
            {/* The base grid placeholder representing mapping */}
            <div className="w-[85%] h-[85%] border-2 border-dashed border-eco-primary/20 rounded-3xl rotate-[-12deg] skew-x-[12deg] relative glass-panel p-6 flex flex-col justify-between overflow-hidden">
              
              {/* Transit line illustration in Electric Blue and Vibrant Green */}
              <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 200 200">
                {/* Metro Line 1 (Electric Blue) */}
                <path d="M 20,180 Q 100,100 180,30" fill="none" stroke="#0066FF" strokeWidth="4" strokeLinecap="round" />
                
                {/* Bus Link (Vibrant Green) */}
                <path d="M 30,120 Q 90,160 170,110" fill="none" stroke="#9FCE1A" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,3" />

                {/* Animated Metro Train */}
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

              {/* Station Dot 1 (Vibrant Green) */}
              <div className="absolute top-[25%] right-[20%] w-3.5 h-3.5 rounded-full bg-eco-accentGreen border-2 border-white shadow" />
              {/* Station Dot 2 (Electric Blue) */}
              <div className="absolute bottom-[20%] left-[20%] w-3.5 h-3.5 rounded-full bg-eco-primary border-2 border-white shadow animate-pulse-glow" />
            </div>

            {/* Floating 3D card showing ticket status */}
            <div className="absolute w-[210px] top-[10%] left-[2%] glass-panel rounded-2xl p-4 shadow-xl border border-white/40 rotate-[6deg] -translate-y-2 animate-float-card flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-eco-muted uppercase tracking-wider">LỘ TRÌNH XANH</span>
                <span className="text-[10px] font-black text-eco-primary bg-eco-mint border border-eco-primary/20 px-2 py-0.5 rounded-full">
                  Ưu tiên
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-eco-mint flex items-center justify-center text-lg shadow-sm border border-eco-primary/10">
                  🚇
                </div>
                <div>
                  <h4 className="text-xs font-black text-eco-ink">Metro Số 1</h4>
                  <p className="text-[9px] text-eco-muted">Bến Thành → Thảo Điền</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-eco-primary/10">
                <span className="text-[10px] text-eco-muted font-bold">Thời gian đi</span>
                <span className="text-xs font-black text-eco-primary font-mono">20 phút</span>
              </div>
            </div>

            {/* Tiny Floating Stats bubble */}
            <div className="absolute w-[110px] bottom-[15%] right-[0%] bg-white/95 backdrop-blur-xs rounded-xl p-2.5 shadow-md border border-eco-primary/10 text-center rotate-[-4deg] translate-y-3">
              <div className="text-[10px] text-eco-muted font-bold">Điểm tích lũy</div>
              <div className="text-xs font-black text-eco-accentGreenDeep font-mono">+120đ</div>
            </div>

          </div>
        </div>

      </div>

      {/* Stats ribbon at bottom (Using real project configuration metadata, updated styling) */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-eco-primary/15 to-transparent" />
    </section>
  );
}
