import React from 'react';

export default function RouteNetworkPreview() {
  // Mock grid nodes to display as a premium network schematic diagram
  const metroStations = [
    { x: 30, y: 150, name: 'Bến Thành' },
    { x: 55, y: 130, name: 'Nhà Hát TP' },
    { x: 80, y: 110, name: 'Ba Son' },
    { x: 100, y: 85, name: 'Văn Thánh' },
    { x: 130, y: 70, name: 'Tân Cảng' },
    { x: 155, y: 65, name: 'Thảo Điền' },
    { x: 180, y: 55, name: 'An Phú' },
    { x: 210, y: 50, name: 'Rạch Chiếc' },
    { x: 240, y: 48, name: 'Phước Long' },
    { x: 270, y: 45, name: 'Bình Thái' },
    { x: 300, y: 42, name: 'Thủ Đức' },
    { x: 330, y: 40, name: 'Công Nghệ Cao' },
    { x: 360, y: 38, name: 'Suối Tiên' }
  ];

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col justify-between p-6 bg-gradient-to-br from-eco-soft via-white to-eco-mint/20 border border-eco-primary/10 rounded-3xl relative overflow-hidden shadow-inner">
      
      {/* Mesh grid background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#0066FF_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex justify-between items-center border-b border-eco-primary/10 pb-3.5">
        <div>
          <span className="text-[9px] font-black uppercase text-eco-primary tracking-widest bg-eco-mint px-2 py-0.5 rounded-full border border-eco-primary/10">
            Bản đồ mạng lưới Metro
          </span>
          <h3 className="text-sm font-black text-eco-ink mt-1">Sơ đồ Lướt Khói Chạm Xanh</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-eco-accentGreen animate-pulse-glow" />
          <span className="text-[10px] font-bold text-eco-muted">Gợi ý lộ trình</span>
        </div>
      </div>

      {/* SVG Canvas Schematic */}
      <div className="relative z-10 flex-grow w-full flex items-center justify-center py-4 select-none">
        <svg className="w-full h-[240px] max-w-[450px]" viewBox="0 0 400 200">
          {/* Grid lines */}
          <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(0,102,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="200" y1="0" x2="200" y2="200" stroke="rgba(0,102,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />

          {/* Bus link routes (Vibrant Green #9FCE1A) */}
          <path d="M 40,80 Q 150,140 280,110" fill="none" stroke="#9FCE1A" strokeWidth="2" strokeDasharray="6,4" className="animate-dash-flow" />
          <path d="M 160,130 Q 250,160 350,80" fill="none" stroke="#9FCE1A" strokeWidth="2" strokeDasharray="6,4" className="animate-dash-flow opacity-60" />

          {/* Metro line trace path (Electric Blue #0066FF) */}
          <path
            d="M 30,150 Q 80,110 130,70 L 360,38"
            fill="none"
            stroke="#0066FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          />

          {/* Animated metro train */}
          <circle r="7" fill="#0066FF" className="animate-metro-move border border-white">
            <animateMotion path="M 30,150 Q 80,110 130,70 L 360,38" dur="8s" repeatCount="indefinite" />
          </circle>

          {/* Draw Stations as dots */}
          {metroStations.map((station, i) => (
            <g key={i} className="hover:scale-125 transition-transform duration-200 cursor-pointer">
              <circle
                cx={station.x}
                cy={station.y}
                r="4.5"
                fill={i === 0 || i === 5 || i === 12 ? '#9FCE1A' : '#ffffff'}
                stroke="#0066FF"
                strokeWidth="2.5"
              />
              {/* Highlight specific key nodes */}
              {(i === 0 || i === 5 || i === 12) && (
                <circle cx={station.x} cy={station.y} r="8" fill="none" stroke="#0066FF" strokeWidth="1" className="animate-pulse-glow" />
              )}
            </g>
          ))}

          {/* Leg Labels */}
          <text x="32" y="168" fill="#0A1118" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Bến Thành</text>
          <text x="145" y="80" fill="#0A1118" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Thảo Điền</text>
          <text x="330" y="52" fill="#0A1118" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Suối Tiên</text>
        </svg>
      </div>

      {/* Guide Microcopy */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xs p-3 rounded-2xl border border-eco-primary/10 text-center">
        <p className="text-xs text-eco-muted font-semibold">
          💡 Vui lòng nhập địa điểm xuất phát & đích đến rồi click <strong>Tìm kiếm lộ trình</strong> để hiển thị sơ đồ dẫn đường tối ưu.
        </p>
      </div>

    </div>
  );
}

