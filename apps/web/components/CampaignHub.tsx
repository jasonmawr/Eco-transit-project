'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Compass, HelpCircle, Check, Map } from 'lucide-react';

// Avatars configurations
export const CHARACTERS = [
  { id: 'student', name: 'Học sinh/Sinh viên xanh', emoji: '🎒', desc: 'Đại diện cho thế hệ trẻ đi học bằng xe buýt điện và metro, tối ưu chi phí.' },
  { id: 'office', name: 'Dân văn phòng lướt khói', emoji: '💼', desc: 'Tránh kẹt xe giờ cao điểm, rảnh tay lướt tin tức, đi làm thanh thản.' },
  { id: 'explorer', name: 'Người khám phá thành phố', emoji: '🗺️', desc: 'Săn tìm các địa điểm ăn uống, cafe chill quanh các ga tàu điện.' },
  { id: 'hunter', name: 'Bạn trẻ săn voucher', emoji: '🏷️', desc: 'Năng nổ tích lũy điểm xanh để đổi lấy quà tặng chất lượng từ đối tác.' },
  { id: 'commuter', name: 'Người đi metro mỗi ngày', emoji: '🚆', desc: 'Thành viên trung thành của lối sống xanh, đi lại bền vững quanh năm.' },
];

export const JOURNEY_STATIONS = [
  { id: 'route', name: 'Lập lộ trình xanh', num: 1, desc: 'Dijkstra route planner', icon: '🛤️' },
  { id: 'stations', name: 'Khám phá ga', num: 2, desc: 'Explore stations & POIs', icon: '🚉' },
  { id: 'tickets', name: 'Tích điểm vé xanh', num: 3, desc: 'Ticket ledger', icon: '🎫' },
  { id: 'rewards', name: 'Đổi thưởng', num: 4, desc: 'Redeem points catalog', icon: '🎁' },
  { id: 'xanhwrap', name: 'XanhWrap / Chia sẻ', num: 5, desc: 'Create share card', icon: '✨' },
  { id: 'guides', name: 'Cẩm nang lướt xanh', num: 6, desc: 'Campaign tips & guides', icon: '📖' },
];

interface CampaignHubProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
}

export default function CampaignHub({ activeSection, onSectionSelect }: CampaignHubProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string>('student');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // SSR hydration guard
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ecotransit_character');
    if (saved) {
      setSelectedChar(saved);
    }
  }, []);

  const selectCharacter = (id: string) => {
    setSelectedChar(id);
    localStorage.setItem('ecotransit_character', id);
    setShowAvatarSelector(false);
  };

  const getCharEmoji = (id: string) => {
    return CHARACTERS.find((c) => c.id === id)?.emoji || '👤';
  };

  const getCharName = (id: string) => {
    return CHARACTERS.find((c) => c.id === id)?.name || 'Hành khách xanh';
  };

  if (!mounted) {
    return (
      <div className="bg-white/80 border border-eco-mint p-6 sm:p-8 rounded-3xl shadow-lg mb-10 min-h-[200px] flex items-center justify-center">
        <p className="text-xs text-eco-muted font-bold">Đang tải bản đồ hành trình...</p>
      </div>
    );
  }

  return (
    <div className="relative z-40 bg-white/95 border border-eco-mint p-3 sm:p-4 rounded-3xl shadow-md mb-2 flex-shrink-0">
      
      {/* Decorative ambient lights wrapper with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-eco-accentGreen/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-eco-primary/10 blur-3xl rounded-full" />
      </div>

      {/* Header with Avatar Selection Button */}
      <div className="flex flex-row items-center justify-between border-b border-eco-primary/10 pb-3 sm:pb-4 mb-3 sm:mb-6 gap-4">
        <div className="hidden sm:block">
          <span className="text-[10px] font-black text-eco-primary uppercase tracking-widest bg-eco-mint px-2.5 py-1 rounded-full border border-eco-primary/10">
            🗺️ CAMPAIGN MAP HUB
          </span>
          <h2 className="text-sm sm:text-lg font-black text-eco-ink mt-1.5 tracking-tight font-display-campaign uppercase">
            HÀNH TRÌNH LƯỚT KHÓI CHẠM XANH
          </h2>
        </div>

        {/* Mobile-only compact title */}
        <div className="sm:hidden flex flex-col">
          <span className="text-[9px] font-black text-eco-primary uppercase tracking-wider">🗺️ Campaign Hub</span>
          <span className="text-[10px] font-extrabold text-eco-ink uppercase">6 chặng lướt xanh</span>
        </div>

        {/* Selected character badge & selector trigger */}
        <div className="relative">
          <button
            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
            className="flex items-center space-x-1.5 sm:space-x-2.5 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl shadow-sm transition-all duration-200 group text-left"
          >
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">
              {getCharEmoji(selectedChar)}
            </span>
            <div className="leading-none">
              <span className="hidden sm:block text-[9px] text-eco-muted group-hover:text-white/80 font-bold uppercase tracking-wider mb-0.5">
                Nhân vật đồng hành
              </span>
              <span className="text-[10px] sm:text-xs font-black text-eco-ink group-hover:text-white block">
                {getCharName(selectedChar)}
              </span>
            </div>
          </button>

          {/* Character selection overlay menu */}
          <AnimatePresence>
            {showAvatarSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border border-eco-primary/15 rounded-3xl shadow-2xl p-4 z-40 space-y-3"
              >
                <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                  <span className="text-xs font-black text-eco-ink uppercase">Chọn nhân vật của bạn</span>
                  <span className="text-[9px] text-eco-muted font-bold">Lưu tự động</span>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {CHARACTERS.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => selectCharacter(char.id)}
                      className={`w-full flex items-start space-x-3 p-2.5 rounded-2xl text-left border transition-all ${
                        selectedChar === char.id
                          ? 'border-eco-primary bg-eco-mint/50'
                          : 'border-transparent hover:bg-eco-soft'
                      }`}
                    >
                      <span className="text-3xl shrink-0">{char.emoji}</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-black text-eco-ink">{char.name}</span>
                          {selectedChar === char.id && <Check className="w-3.5 h-3.5 text-eco-primary shrink-0" />}
                        </div>
                        <p className="text-[10px] text-eco-muted leading-snug">{char.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop View: Horizontal Journey Map with SVG Tracks */}
      <div className="hidden sm:block relative py-4 px-2">
        
        {/* SVG Railway Track Background */}
        <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 pointer-events-none z-0 px-12">
          <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wooden railway sleepers */}
            <path
              d="M 10,8 L 10,-8 M 60,8 L 60,-8 M 110,8 L 110,-8 M 160,8 L 160,-8 M 210,8 L 210,-8 M 260,8 L 260,-8 M 310,8 L 310,-8 M 360,8 L 360,-8 M 410,8 L 410,-8 M 460,8 L 460,-8 M 510,8 L 510,-8 M 560,8 L 560,-8 M 610,8 L 610,-8 M 660,8 L 660,-8 M 710,8 L 710,-8"
              stroke="#0A1118"
              strokeWidth="2.5"
              strokeOpacity="0.1"
              strokeLinecap="round"
              className="w-full"
            />
            {/* The double steel rails */}
            <line x1="0%" y1="-3" x2="100%" y2="-3" stroke="#0066FF" strokeWidth="2" strokeOpacity="0.4" />
            <line x1="0%" y1="3" x2="100%" y2="3" stroke="#9FCE1A" strokeWidth="2" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Nodes Grid */}
        <div className="relative z-10 grid grid-cols-6 gap-2">
          {JOURNEY_STATIONS.map((station) => {
            const isActive = activeSection === station.id;

            return (
              <div key={station.id} className="flex flex-col items-center text-center relative">
                
                {/* Floating Avatar representation on the active node */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="journey-avatar"
                      className="absolute -top-11 z-20 text-2xl drop-shadow-md filter select-none pointer-events-none animate-bounce"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      {getCharEmoji(selectedChar)}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* The station dot/node button */}
                <button
                  onClick={() => onSectionSelect(station.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-primary ${
                    isActive
                      ? 'bg-eco-primary text-white border-eco-primary scale-110 shadow-md shadow-eco-primary/30 ring-4 ring-eco-mint'
                      : 'bg-white text-eco-ink border-gray-200 hover:border-eco-primary hover:text-eco-primary hover:scale-105 hover:shadow'
                  }`}
                >
                  <span className="text-base">{station.icon}</span>
                  <span className="absolute -bottom-1 -right-1 bg-eco-ink text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {station.num}
                  </span>
                </button>

                {/* Station labels */}
                <div className="mt-2 space-y-0.5">
                  <button
                    onClick={() => onSectionSelect(station.id)}
                    className={`text-[11px] font-black uppercase tracking-wider block hover:text-eco-primary transition-all duration-200 ${
                      isActive ? 'text-eco-primary scale-105 font-black' : 'text-eco-ink'
                    }`}
                  >
                    {station.name}
                  </button>
                  <span className="text-[8px] text-eco-muted block font-medium">Ga số {station.num}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View (Width < 640px): Horizontal Scrollable Chip Rail */}
      <div className="sm:hidden relative py-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center space-x-2 px-1 border-t border-eco-primary/5 mt-2">
        {JOURNEY_STATIONS.map((station) => {
          const isActive = activeSection === station.id;
          return (
            <button
              key={station.id}
              onClick={() => onSectionSelect(station.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border shrink-0 transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'bg-eco-primary text-white border-eco-primary scale-105 shadow-sm shadow-eco-primary/10'
                  : 'bg-white text-eco-ink border-gray-200'
              }`}
            >
              <span className="text-xs">{station.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-wider">{station.name}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
