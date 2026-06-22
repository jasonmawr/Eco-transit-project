'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2 } from 'lucide-react';
import { AvatarSvg, AvatarConfig } from './ui/AvatarSvg';
import AvatarCustomizerModal from './AvatarCustomizerModal';
import { normalizeAvatarConfig } from '../lib/avatarNormalizer';

// Illustrated presets
export const CHARACTERS = [
  { id: 'student', name: 'Bạn học xanh', desc: 'Đại diện thế hệ trẻ năng động đi học bằng xe buýt điện, VinBus và Metro.' },
  { id: 'office', name: 'Dân văn phòng xanh', desc: 'Tránh kẹt xe giờ cao điểm, thảnh thơi lướt tin tức, đi làm xanh và thanh thản.' },
  { id: 'explorer', name: 'Người khám phá thành phố', desc: 'Săn tìm các địa điểm ẩm thực, quán cafe chill xung quanh các ga tàu điện.' },
  { id: 'commuter', name: 'Người đạp xe xanh', desc: 'Thành viên phong trào xe đạp, liên kết xe buýt điện bảo vệ môi trường.' },
  { id: 'hunter', name: 'Người săn ưu đãi xanh', desc: 'Tích lũy điểm xanh hành trình để đổi lấy quà tặng voucher Highlands/Phúc Long.' },
];

export const JOURNEY_STATIONS = [
  { id: 'route', name: 'Lập lộ trình xanh', num: 1, desc: 'Lập lộ trình tối ưu', icon: '🛤️' },
  { id: 'stations', name: 'Khám phá ga', num: 2, desc: 'Khám phá nhà ga & Địa điểm', icon: '🚉' },
  { id: 'tickets', name: 'Tích điểm vé xanh', num: 3, desc: 'Nhật ký tích điểm vé', icon: '🎫' },
  { id: 'rewards', name: 'Đổi thưởng', num: 4, desc: 'Danh mục đổi thưởng', icon: '🎁' },
  { id: 'xanhwrap', name: 'XanhWrap / Chia sẻ', num: 5, desc: 'Tạo thẻ chia sẻ XanhWrap', icon: '✨' },
  { id: 'guides', name: 'Cẩm nang lướt xanh', num: 6, desc: 'Mẹo & Cẩm nang xanh', icon: '📖' },
];

interface CampaignHubProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  user?: any;
}

export default function CampaignHub({ activeSection, onSectionSelect, user }: CampaignHubProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string>('student');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // SSR hydration guard
  useEffect(() => {
    setMounted(true);

    // Set selected character from user config if present, else fallback to localStorage
    if (user && user.avatarConfig) {
      const normalized = normalizeAvatarConfig(user.avatarConfig);
      setSelectedChar(normalized.characterId);
    } else {
      const saved = localStorage.getItem('ecotransit_character');
      if (saved) {
        const normalized = normalizeAvatarConfig({ characterId: saved });
        setSelectedChar(normalized.characterId);
      }
    }

    // Auto-prompt onboarding if user is verified but has no avatar, or hash is #onboarding
    if (typeof window !== 'undefined') {
      const isHashOnboarding = window.location.hash === '#onboarding';
      const needsOnboarding = user && user.emailVerified === true && (!user.avatarConfig || !user.avatarConfig.characterId);

      if (isHashOnboarding || needsOnboarding) {
        setShowAvatarSelector(true);
      }

      // Check prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [user]);

  const handleSaveAvatarSuccess = (updatedAvatarConfig: any) => {
    // Update local state
    if (updatedAvatarConfig && updatedAvatarConfig.characterId) {
      setSelectedChar(updatedAvatarConfig.characterId);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          avatarConfig: updatedAvatarConfig
        });
      }
    }
    setShowAvatarSelector(false);
    // Reload state across components to synchronize
    window.location.reload();
  };

  const getCharName = (id: string) => {
    return CHARACTERS.find((c) => c.id === id)?.name || 'Hành khách xanh';
  };

  const getUserAvatarConfig = (charId: string): AvatarConfig => {
    if (currentUser && currentUser.avatarConfig) {
      const normalized = normalizeAvatarConfig(currentUser.avatarConfig);
      if (normalized.characterId === charId) {
        return normalized;
      }
    }

    // Default preset configs fallback
    const presetsMap: Record<string, AvatarConfig> = {
      student: { characterId: 'student', hairStyle: 'short', hairColor: 'default', outfitStyle: 'casual', outfitColor: 'electricBlue', accessory: 'backpack' },
      office: { characterId: 'office', hairStyle: 'curly', hairColor: 'default', outfitStyle: 'formal', outfitColor: 'electricBlue', accessory: 'glasses' },
      explorer: { characterId: 'explorer', hairStyle: 'long', hairColor: 'beige', outfitStyle: 'casual', outfitColor: 'urbanBeige', accessory: 'headphones' },
      commuter: { characterId: 'commuter', hairStyle: 'cap', hairColor: 'default', outfitStyle: 'sporty', outfitColor: 'vibrantGreen', accessory: 'none' },
      hunter: { characterId: 'hunter', hairStyle: 'curly', hairColor: 'green', outfitStyle: 'sporty', outfitColor: 'vibrantGreen', accessory: 'headphones' }
    };
    return presetsMap[charId] || { characterId: 'student' as any };
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
      <div className="flex flex-row items-center justify-between border-b border-eco-primary/10 pb-3 sm:pb-4 mb-3 sm:mb-6 gap-4 relative z-10">
        <div className="hidden sm:block">
          <span className="text-[10px] font-black text-eco-primary uppercase tracking-widest bg-eco-mint px-2.5 py-1 rounded-full border border-eco-primary/10">
            🗺️ BẢN ĐỒ HÀNH TRÌNH XANH
          </span>
          <h2 className="text-sm sm:text-lg font-black text-eco-ink mt-1.5 tracking-tight font-display-campaign uppercase font-bold">
            HÀNH TRÌNH LƯỚT KHÓI CHẠM XANH
          </h2>
        </div>

        {/* Mobile-only compact title */}
        <div className="sm:hidden flex flex-col">
          <span className="text-[9px] font-black text-eco-primary uppercase tracking-wider">🗺️ Bản đồ hành trình</span>
          <span className="text-[10px] font-extrabold text-eco-ink uppercase">6 chặng lướt xanh</span>
        </div>

        {/* Selected character badge & selector trigger */}
        <div className="relative">
          <button
            onClick={() => {
              if (!currentUser) {
                alert('Vui lòng đăng nhập để thiết lập và tùy biến nhân vật di chuyển xanh.');
                return;
              }
              setShowAvatarSelector(true);
            }}
            className="flex items-center space-x-1.5 sm:space-x-2.5 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl shadow-sm transition-all duration-200 group text-left"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 group-hover:scale-110 transition-transform duration-200 shrink-0">
              <AvatarSvg config={getUserAvatarConfig(selectedChar)} />
            </div>
            <div className="leading-none">
              <span className="hidden sm:flex items-center gap-1 text-[9px] text-eco-muted group-hover:text-white/80 font-bold uppercase tracking-wider mb-0.5">
                Nhân vật đồng hành <Edit2 className="w-2.5 h-2.5" />
              </span>
              <span className="text-[10px] sm:text-xs font-black text-eco-ink group-hover:text-white block">
                {getCharName(selectedChar)}
              </span>
            </div>
          </button>
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
                      className="absolute -top-11 z-20 w-8 h-8 drop-shadow-md filter select-none pointer-events-none animate-bounce"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      <AvatarSvg config={getUserAvatarConfig(selectedChar)} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Visual train running on desktop rails */}
                {isActive && !prefersReducedMotion && (
                  <motion.div
                    layoutId="desktop-train"
                    className="absolute z-25 text-xl pointer-events-none select-none"
                    style={{
                      top: '10px', // aligned with railway track center
                    }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  >
                    🚇
                  </motion.div>
                )}

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

      {/* Mobile View (Width < 640px): Vertical Metro Route Line */}
      <div className="sm:hidden relative pl-10 pr-2 py-4">
        {/* Steel Rail Line Background */}
        <div className="absolute top-0 bottom-0 left-[22px] w-1 pointer-events-none z-0">
          <div className="w-full h-full bg-gradient-to-b from-eco-primary/30 to-eco-accentGreen/30 rounded-full" />
        </div>

        {/* Vertical List of Stations */}
        <div className="space-y-6 relative z-10">
          {JOURNEY_STATIONS.map((station) => {
            const isActive = activeSection === station.id;

            return (
              <div key={station.id} className="flex items-center space-x-4 relative">
                {/* Active character floating to the left of active node */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="journey-avatar-mobile"
                      className="absolute -left-10 w-7 h-7 flex items-center justify-center space-x-1"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      <AvatarSvg config={getUserAvatarConfig(selectedChar)} />
                      <span className="text-eco-ink text-[10px] shrink-0">👉</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Visual train running on mobile vertical rails */}
                {isActive && !prefersReducedMotion && (
                  <motion.div
                    layoutId="mobile-train"
                    className="absolute left-[22px] -translate-x-1/2 z-25 text-base pointer-events-none select-none"
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  >
                    🚇
                  </motion.div>
                )}

                {/* The station dot */}
                <button
                  onClick={() => onSectionSelect(station.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 relative shadow-sm focus:outline-none ${
                    isActive
                      ? 'bg-eco-primary text-white border-eco-primary ring-4 ring-eco-mint scale-105'
                      : 'bg-white text-eco-ink border-gray-200'
                  }`}
                >
                  <span className="text-sm">{station.icon}</span>
                  <span className="absolute -bottom-1 -right-1 bg-eco-ink text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {station.num}
                  </span>
                </button>

                {/* Text details */}
                <div className="flex-grow pl-1">
                  <button
                    onClick={() => onSectionSelect(station.id)}
                    className={`text-xs font-black uppercase tracking-wider block text-left hover:text-eco-primary transition-colors ${
                      isActive ? 'text-eco-primary font-bold' : 'text-eco-ink'
                    }`}
                  >
                    {station.name}
                  </button>
                  <span className="text-[9px] text-eco-muted block font-medium">Ga số {station.num}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Full customizer modal integration */}
      <AvatarCustomizerModal
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        user={currentUser}
        onSaveSuccess={handleSaveAvatarSuccess}
      />

    </div>
  );
}

