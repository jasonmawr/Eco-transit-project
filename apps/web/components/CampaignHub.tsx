'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  onLoginClick?: () => void;
}

// ──────────────────────────────────────────────────────────────
// TRAIN SVG COMPONENTS — Pure visual, no positioning logic
// ──────────────────────────────────────────────────────────────

// Sleek Desktop Metro carriage SVG (width 96, height 40)
const DesktopTrain = ({ avatarConfig, direction }: { avatarConfig: AvatarConfig; direction: 'right' | 'left' }) => {
  return (
    <div className="relative w-24 h-10 pointer-events-none" style={{ pointerEvents: 'none' }}>
      <svg
        width="96"
        height="40"
        viewBox="0 0 96 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
        style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
      >
        {/* Rear Carriage (Carriage 2) */}
        <rect x="2" y="2" width="40" height="24" rx="6" fill="url(#train-grad)" stroke="#0A1118" strokeWidth="2.5" />
        <rect x="2" y="14" width="40" height="3" fill="#9FCE1A" />
        <rect x="8" y="6" width="10" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="24" y="6" width="10" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        {/* Wheels for Carriage 2 (Bogie style) */}
        <rect x="8" y="26" width="20" height="3" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />
        <circle cx="12" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <circle cx="24" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />

        {/* Coupler connecting the carriages */}
        <rect x="42" y="11" width="12" height="5" fill="#4B5E70" stroke="#0A1118" strokeWidth="1.5" />

        {/* Front Carriage (Carriage 1) */}
        <rect x="54" y="2" width="40" height="24" rx="6" fill="url(#train-grad)" stroke="#0A1118" strokeWidth="2.5" />
        <rect x="54" y="14" width="40" height="3" fill="#9FCE1A" />
        {/* Cabin wind shield */}
        <path d="M 80,6 L 90,6 Q 92,6 92,9 L 88,16 L 78,16 Z" fill="#0A1118" stroke="#0A1118" strokeWidth="1.5" />
        <path d="M 81,8 L 88,8 L 86,14 L 80,14 Z" fill="#38BDF8" opacity="0.8" />
        {/* Passenger window for Avatar */}
        <rect x="60" y="6" width="12" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        {/* Wheels for Carriage 1 (Bogie style) */}
        <rect x="60" y="26" width="20" height="3" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />
        <circle cx="64" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <circle cx="84" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />

        {/* Headlight yellow glow */}
        <circle cx="91" cy="20" r="2" fill="#FBBF24" />
        <circle cx="91" cy="20" r="4" fill="#FBBF24" opacity="0.4" />

        {/* Route sign indicator */}
        <rect x="68" y="18" width="10" height="4" rx="1" fill="#0A1118" />
        <text x="69.5" y="21.2" fill="#9FCE1A" fontSize="3" fontWeight="bold" fontFamily="sans-serif">M1</text>

        <defs>
          <linearGradient id="train-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar looking out of Carriage 1 passenger window */}
      <div
        className="absolute w-5 h-5 overflow-hidden rounded-full z-20 border border-eco-ink bg-slate-900"
        style={{
          top: '11px',
          left: direction === 'left' ? '30px' : '66px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AvatarSvg config={avatarConfig} className="w-full h-full" />
      </div>
    </div>
  );
};

// Sleek Mobile Metro carriage SVG (width 72, height 32)
const MobileTrain = ({ avatarConfig, direction }: { avatarConfig: AvatarConfig; direction: 'right' | 'left' }) => {
  return (
    <div className="relative w-18 h-12 flex flex-col items-center justify-end pointer-events-none" style={{ pointerEvents: 'none' }}>
      <svg
        width="72"
        height="32"
        viewBox="0 0 72 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
        style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
      >
        {/* Rear Carriage (Carriage 2) */}
        <rect x="2" y="2" width="30" height="18" rx="4" fill="url(#train-grad-mobile)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="2" y="11" width="30" height="2" fill="#9FCE1A" />
        <rect x="6" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <rect x="18" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="10" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="24" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Coupler */}
        <rect x="32" y="9" width="8" height="4" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />

        {/* Front Carriage (Carriage 1) */}
        <rect x="40" y="2" width="30" height="18" rx="4" fill="url(#train-grad-mobile)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="40" y="11" width="30" height="2" fill="#9FCE1A" />
        {/* Windshield */}
        <path d="M 60,5 L 68,5 Q 69,5 69,7 L 65,12 L 57,12 Z" fill="#0A1118" stroke="#0A1118" strokeWidth="0.8" />
        <path d="M 61,6 L 67,6 L 64,11 L 58,11 Z" fill="#38BDF8" opacity="0.8" />
        {/* Passenger window for Avatar */}
        <rect x="44" y="5" width="10" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="48" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="62" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Headlight */}
        <circle cx="68" cy="15" r="1.5" fill="#FBBF24" />

        <defs>
          <linearGradient id="train-grad-mobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar looking out of Carriage 1 passenger window */}
      <div
        className="absolute w-4 h-4 overflow-hidden rounded-full z-20 border border-eco-ink bg-slate-900"
        style={{
          top: '24px',
          left: direction === 'left' ? '23px' : '49px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AvatarSvg config={avatarConfig} className="w-full h-full" />
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export default function CampaignHub({ activeSection, onSectionSelect, user, onLoginClick }: CampaignHubProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string>('student');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(user);

  // Layout collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  // ──────────────────────────────────────────────────────────────
  // DETERMINISTIC RAIL STAGE — CSS Grid + CSS Transition
  // ──────────────────────────────────────────────────────────────
  //
  // The train position is 100% deterministic:
  //   Desktop: trainX = stationSlotCenter(activeIndex) - trainWidth/2
  //   Mobile:  trainY = stationSlotCenter(activeIndex) - trainHeight/2
  //
  // Movement is achieved by CSS `transition: transform` on the
  // train wrapper. When `activeIndex` changes, React updates the
  // `style.transform` — the browser compositor handles the smooth
  // interpolation. No JS animation loop, no RAF, no path queries.
  // ──────────────────────────────────────────────────────────────

  const [isMoving, setIsMoving] = useState(false);
  const [hasPlaced, setHasPlaced] = useState(false);
  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Desktop: measure station button center X positions relative to the track container
  const [desktopSlotCenters, setDesktopSlotCenters] = useState<number[]>([]);
  // Mobile: measure station button center Y positions relative to the track container
  const [mobileSlotCenters, setMobileSlotCenters] = useState<number[]>([]);

  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const desktopRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const mobileRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // SSR hydration guard
  useEffect(() => {
    setMounted(true);

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

    if (typeof window !== 'undefined') {
      const isHashOnboarding = window.location.hash === '#onboarding';
      const needsOnboarding = user && user.emailVerified === true && (!user.avatarConfig || !user.avatarConfig.characterId);

      if (isHashOnboarding || needsOnboarding) {
        setShowAvatarSelector(true);
      }

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [user]);

  // Set direction based on active indices comparison
  const activeIndex = Math.max(0, JOURNEY_STATIONS.findIndex((s) => s.id === activeSection));
  useEffect(() => {
    if (activeIndex > prevIndex) {
      setDirection('right');
    } else if (activeIndex < prevIndex) {
      setDirection('left');
    }
    setPrevIndex(activeIndex);
  }, [activeIndex, prevIndex]);

  // ──────────────────────────────────────────────────────────────
  // Measure station slot centers from DOM after mount/resize
  // ──────────────────────────────────────────────────────────────
  const measureSlotCenters = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isDesktop = window.innerWidth >= 640;

    if (isDesktop && desktopTrackRef.current) {
      const containerRect = desktopTrackRef.current.getBoundingClientRect();
      const centers: number[] = [];
      for (const station of JOURNEY_STATIONS) {
        const btn = desktopRefs.current[station.id];
        if (!btn) return; // Wait until all buttons are rendered
        const btnRect = btn.getBoundingClientRect();
        // Center of the button relative to the track container
        centers.push(btnRect.left - containerRect.left + btnRect.width / 2);
      }
      setDesktopSlotCenters(centers);
      if (!hasPlaced) setHasPlaced(true);
    }

    if (!isDesktop && mobileTrackRef.current) {
      const containerRect = mobileTrackRef.current.getBoundingClientRect();
      const centers: number[] = [];
      for (const station of JOURNEY_STATIONS) {
        const btn = mobileRefs.current[station.id];
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        centers.push(btnRect.top - containerRect.top + btnRect.height / 2);
      }
      setMobileSlotCenters(centers);
      if (!hasPlaced) setHasPlaced(true);
    }
  }, [hasPlaced]);

  // Initial measurement and resize observer
  useEffect(() => {
    if (!mounted) return;

    // Initial placement with a small delay to allow CSS grid to settle
    const initialTimer = setTimeout(() => {
      measureSlotCenters();
    }, 100);

    const handleResize = () => {
      measureSlotCenters();
    };

    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    if (desktopTrackRef.current) observer.observe(desktopTrackRef.current);
    if (mobileTrackRef.current) observer.observe(mobileTrackRef.current);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [mounted, measureSlotCenters]);

  // ──────────────────────────────────────────────────────────────
  // Compute the train transform (the core deterministic positioning)
  // ──────────────────────────────────────────────────────────────
  const DESKTOP_TRAIN_W = 96;
  const DESKTOP_TRAIN_H = 40;
  const MOBILE_TRAIN_W = 72;
  const MOBILE_TRAIN_H = 48;

  // Desktop: train sits in a dedicated lane at the top of the track container
  // The rail lane is at y = 16px (center of a 32px-high rail lane)
  const DESKTOP_RAIL_LANE_CENTER_Y = 16;

  const getDesktopTrainTransform = (idx: number): string => {
    if (desktopSlotCenters.length === 0) return 'translate3d(0px, 0px, 0)';
    const cx = desktopSlotCenters[idx] ?? desktopSlotCenters[0] ?? 0;
    const tx = cx - DESKTOP_TRAIN_W / 2;
    const ty = DESKTOP_RAIL_LANE_CENTER_Y - DESKTOP_TRAIN_H / 2;
    return `translate3d(${tx}px, ${ty}px, 0)`;
  };

  const getMobileTrainTransform = (idx: number): string => {
    if (mobileSlotCenters.length === 0) return 'translate3d(0px, 0px, 0)';
    const cy = mobileSlotCenters[idx] ?? mobileSlotCenters[0] ?? 0;
    // Mobile: train sits in a dedicated lane on the right side
    const tx = -10; // Small offset from right edge
    const ty = cy - MOBILE_TRAIN_H / 2;
    return `translate3d(${tx}px, ${ty}px, 0)`;
  };

  // ──────────────────────────────────────────────────────────────
  // Compute CSS transition duration based on distance
  // ──────────────────────────────────────────────────────────────
  const getTransitionDuration = (fromIdx: number, toIdx: number): number => {
    const gap = Math.abs(toIdx - fromIdx);
    if (gap === 0) return 0;
    if (gap === 1) return 1400;   // Adjacent: 1.4s
    if (gap <= 3) return 1800;    // 2-3 stations: 1.8s
    return 2200;                  // 4-5 stations: 2.2s
  };

  // Track transition duration for CSS and for timing the isMoving state
  const [transitionDuration, setTransitionDuration] = useState(1400);

  // Trigger isMoving state and animation timing hooks on station change
  useEffect(() => {
    if (!mounted || !hasPlaced) return;

    const gap = Math.abs(activeIndex - prevIndex);
    if (gap === 0) return;

    const duration = getTransitionDuration(prevIndex, activeIndex);
    setTransitionDuration(duration);
    setIsMoving(true);

    // Record animation timing for test hooks
    if (typeof window !== 'undefined') {
      (window as any).__lastMetroAnimationStart = performance.now();
      (window as any).__lastMetroAnimationDuration = null;
      (window as any).__lastMetroAnimationExpectedDuration = duration;
    }

    // Clear any existing timer
    if (movingTimerRef.current) {
      clearTimeout(movingTimerRef.current);
    }

    movingTimerRef.current = setTimeout(() => {
      setIsMoving(false);
      if (typeof window !== 'undefined' && (window as any).__lastMetroAnimationStart) {
        (window as any).__lastMetroAnimationDuration = performance.now() - (window as any).__lastMetroAnimationStart;
      }
    }, duration);

    return () => {
      if (movingTimerRef.current) {
        clearTimeout(movingTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, mounted, hasPlaced]);

  const handleSaveAvatarSuccess = (updatedAvatarConfig: any) => {
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
      <div className="bg-white/80 border border-eco-mint p-3 rounded-3xl shadow-md mb-1 min-h-[80px] flex items-center justify-center">
        <p className="text-xs text-eco-muted font-bold">Đang tải bản đồ hành trình...</p>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // CSS transition config — this is the ONLY thing that controls motion
  // ──────────────────────────────────────────────────────────────
  const trainTransitionCss = prefersReducedMotion
    ? 'opacity 0.2s ease-in-out'
    : `transform ${transitionDuration}ms cubic-bezier(0.33, 1, 0.68, 1), opacity 0.2s ease-in-out`;

  return (
    <div className="relative z-40 bg-white/95 border border-eco-mint p-1.5 sm:p-2 rounded-2xl shadow-md mb-1 flex-shrink-0">
      {/* Decorative ambient lights wrapper with overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-eco-accentGreen/5 blur-2xl rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-eco-primary/5 blur-2xl rounded-full" />
      </div>

      {/* Header with Avatar Selection Button & Collapsible Toggle */}
      <div className="flex flex-row items-center justify-between border-b border-eco-primary/10 pb-1 sm:pb-1.5 mb-1 sm:mb-1.5 gap-3 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block">
            <h2 className="text-[10px] sm:text-xs font-black text-eco-ink tracking-tight font-display-campaign uppercase font-bold flex items-center gap-1.5">
              <span>🗺️ HÀNH TRÌNH LƯỚT KHÓI CHẠM XANH</span>
            </h2>
          </div>

          {/* Mobile-only compact title */}
          <div className="sm:hidden flex flex-col">
            <span className="text-[10px] font-extrabold text-eco-ink uppercase">6 chặng lướt xanh</span>
          </div>

          {/* Collapsible toggle enhancement option */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[9px] sm:text-[10px] font-black text-eco-primary hover:text-eco-primaryDeep bg-eco-mint border border-eco-primary/10 px-1.5 py-0.5 rounded-lg shadow-xs transition-colors flex items-center focus:outline-none focus:ring-1 focus:ring-eco-primary"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Mở rộng bản đồ hành trình" : "Thu gọn bản đồ hành trình"}
          >
            {isCollapsed ? "Mở rộng" : "Thu gọn"}
          </button>
        </div>

        {/* Selected character badge & selector trigger */}
        <div className="relative">
          <button
            onClick={() => {
              if (!currentUser) {
                if (onLoginClick) {
                  onLoginClick();
                }
                return;
              }
              setShowAvatarSelector(true);
            }}
            className="flex items-center space-x-1 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 px-1.5 py-0.5 rounded-xl transition-all duration-200 group text-left shadow-xs"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <AvatarSvg config={getUserAvatarConfig(selectedChar)} />
            </div>
            <div className="leading-none">
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[7px] text-eco-muted group-hover:text-white/80 font-bold uppercase tracking-wider">
                Đồng hành <Edit2 className="w-2 h-2" />
              </span>
              <span className="text-[8px] sm:text-[10px] font-black text-eco-ink group-hover:text-white block">
                {getCharName(selectedChar)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP VIEW — Deterministic Rail Stage
          ═══════════════════════════════════════════════════════════ */}
      {!isCollapsed && (
        <div
          ref={desktopTrackRef}
          data-testid="desktop-track"
          className="hidden sm:block relative py-1.5 px-2 z-10"
          style={{ position: 'relative', minHeight: '76px' }}
        >
          {/* Style injection for bob-lean micro-animation during travel */}
          <style>{`
            .train-visual-container.is-moving {
              animation: train-bob-lean 0.5s ease-in-out infinite alternate;
            }
            .train-visual-container.is-idle {
              transition: transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
              transform: translateY(0px) rotate(0deg);
            }
            @keyframes train-bob-lean {
              0% { transform: translateY(0px) rotate(0.4deg); }
              100% { transform: translateY(1.2px) rotate(-0.4deg); }
            }
          `}</style>

          {/* ─── Decorative Rail Track Line ─── */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              top: `${DESKTOP_RAIL_LANE_CENTER_Y}px`,
              left: '16px',
              right: '16px',
              height: '3px',
            }}
          >
            {/* Base rail line */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #4B5E70 0%, #64748B 50%, #4B5E70 100%)',
                opacity: 0.25,
              }}
            />
            {/* Rail ties / sleepers (dashed) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(75,94,112,0.15) 18px, rgba(75,94,112,0.15) 20px)',
              }}
            />
            {/* Active energy glow line when moving */}
            <div
              className="absolute inset-0 rounded-full transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, #0066FF, #9FCE1A, #0066FF)',
                opacity: isMoving ? 0.4 : 0,
                filter: 'blur(2px)',
              }}
            />
          </div>

          {/* ─── THE TRAIN — positioned via CSS transition ─── */}
          <div
            id="desktop-train"
            className="absolute z-30 pointer-events-none"
            style={{
              position: 'absolute',
              zIndex: 30,
              left: 0,
              top: 0,
              width: `${DESKTOP_TRAIN_W}px`,
              height: `${DESKTOP_TRAIN_H}px`,
              pointerEvents: 'none',
              willChange: 'transform',
              opacity: hasPlaced ? 1 : 0,
              transition: trainTransitionCss,
              transform: getDesktopTrainTransform(activeIndex),
            }}
          >
            {/* Inner train body — direction flip + bobbing */}
            <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
              <DesktopTrain avatarConfig={getUserAvatarConfig(selectedChar)} direction={direction} />
            </div>
          </div>

          {/* ─── Station Nodes Grid ─── */}
          <div className="relative z-10 grid grid-cols-6 gap-1" style={{ paddingTop: '36px' }}>
            {JOURNEY_STATIONS.map((station) => {
              const isActive = activeSection === station.id;

              return (
                <div key={station.id} className="flex flex-col items-center text-center relative" style={{ paddingTop: '6px' }}>
                  {/* Connector line from rail down to station button */}
                  <div
                    className="absolute w-[1.5px] border-l-2 border-dashed border-eco-primary/20 pointer-events-none z-0"
                    style={{ top: '-23px', height: '23px', left: '50%', transform: 'translateX(-50%)' }}
                  />

                  {/* The station dot/node button */}
                  <button
                    ref={(el) => { desktopRefs.current[station.id] = el; }}
                    onClick={() => onSectionSelect(station.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-primary ${
                      isActive
                        ? 'bg-eco-primary text-white border-eco-primary scale-105 shadow-sm ring-2 ring-eco-mint'
                        : 'bg-white text-eco-ink border-gray-200 hover:border-eco-primary hover:text-eco-primary hover:scale-105'
                    }`}
                  >
                    <span className="text-xs">{station.icon}</span>
                    <span className="absolute -bottom-1 -right-1 bg-eco-ink text-white text-[6px] w-2.5 h-2.5 rounded-full flex items-center justify-center font-bold">
                      {station.num}
                    </span>
                  </button>

                  {/* Station labels */}
                  <div className="mt-0.5 space-y-0">
                    <button
                      onClick={() => onSectionSelect(station.id)}
                      className={`text-[8px] font-black uppercase tracking-wider block hover:text-eco-primary transition-all duration-200 ${
                        isActive ? 'text-eco-primary font-black scale-105' : 'text-eco-ink'
                      }`}
                    >
                      {station.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MOBILE VIEW — Vertical Deterministic Rail Stage
          ═══════════════════════════════════════════════════════════ */}
      {!isCollapsed && (
        <div
          ref={mobileTrackRef}
          data-testid="mobile-track"
          className="sm:hidden relative pl-6 pr-24 py-1.5 z-10"
          style={{ position: 'relative' }}
        >
          {/* ─── Decorative Vertical Rail Line ─── */}
          <div
            className="absolute pointer-events-none z-0"
            style={{
              right: '52px',
              top: '12px',
              bottom: '12px',
              width: '3px',
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #4B5E70 0%, #64748B 50%, #4B5E70 100%)',
                opacity: 0.25,
              }}
            />
            <div
              className="absolute inset-0 rounded-full transition-opacity duration-300"
              style={{
                background: 'linear-gradient(180deg, #0066FF, #9FCE1A, #0066FF)',
                opacity: isMoving ? 0.4 : 0,
                filter: 'blur(2px)',
              }}
            />
          </div>

          {/* ─── THE TRAIN (mobile) — positioned via CSS transition ─── */}
          <div
            id="mobile-train"
            className="absolute z-30 pointer-events-none"
            style={{
              position: 'absolute',
              zIndex: 30,
              right: '16px',
              top: 0,
              width: `${MOBILE_TRAIN_W}px`,
              height: `${MOBILE_TRAIN_H}px`,
              pointerEvents: 'none',
              willChange: 'transform',
              opacity: hasPlaced ? 1 : 0,
              transition: trainTransitionCss,
              transform: getMobileTrainTransform(activeIndex),
            }}
          >
            <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
              <MobileTrain avatarConfig={getUserAvatarConfig(selectedChar)} direction={direction} />
            </div>
          </div>

          {/* Vertical List of Stations */}
          <div className="space-y-3 relative z-10">
            {JOURNEY_STATIONS.map((station) => {
              const isActive = activeSection === station.id;

              return (
                <div key={station.id} className="flex items-center justify-between relative h-10">
                  {/* Dashed connector line horizontally to the right rail track */}
                  <div
                    className="absolute h-[1.5px] border-t-2 border-dashed border-eco-primary/20 pointer-events-none z-0"
                    style={{ left: '28px', right: '36px', top: '50%', transform: 'translateY(-50%)' }}
                  />

                  {/* Left part: Button and Labels */}
                  <div className="flex items-center space-x-2 relative z-10 bg-white/95 pr-2 rounded-r-xl">
                    <button
                      ref={(el) => { mobileRefs.current[station.id] = el; }}
                      onClick={() => onSectionSelect(station.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 relative shadow-xs focus:outline-none ${
                        isActive
                          ? 'bg-eco-primary text-white border-eco-primary ring-2 ring-eco-mint scale-105'
                          : 'bg-white text-eco-ink border-gray-200'
                      }`}
                    >
                      <span className="text-xs">{station.icon}</span>
                      <span className="absolute -bottom-1 -right-1 bg-eco-ink text-white text-[6px] w-2.5 h-2.5 rounded-full flex items-center justify-center font-bold">
                        {station.num}
                      </span>
                    </button>

                    {/* Text details */}
                    <div className="flex-grow pl-0.5">
                      <button
                        onClick={() => onSectionSelect(station.id)}
                        className={`text-[10px] font-black uppercase tracking-wider block text-left hover:text-eco-primary transition-colors ${
                          isActive ? 'text-eco-primary font-bold' : 'text-eco-ink'
                        }`}
                      >
                        {station.name}
                      </button>
                      <span className="text-[7px] text-eco-muted block font-medium">Ga số {station.num}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
