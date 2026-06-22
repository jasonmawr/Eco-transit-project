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
}

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

export default function CampaignHub({ activeSection, onSectionSelect, user }: CampaignHubProps) {
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
  // ANIMATION ENGINE — Single source of truth via refs + direct DOM
  // ──────────────────────────────────────────────────────────────

  // RAF handle
  const animRef = useRef<number | null>(null);
  // True position being rendered right now (written every RAF tick)
  const currentPosRef = useRef({ x: 0, y: 0 });
  // Whether an animation is currently in-flight
  const isAnimatingRef = useRef(false);
  // Direct DOM ref — the ONLY element that receives position transforms
  const desktopTrainElRef = useRef<HTMLDivElement | null>(null);
  const mobileTrainElRef = useRef<HTMLDivElement | null>(null);
  // Track whether initial placement has happened (before user sees train)
  const hasInitialPlacement = useRef(false);
  // Last known container dimensions for delta threshold
  const lastContainerSize = useRef({ w: 0, h: 0 });

  // Bounding containers & station button refs
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
  // Direct DOM transform writer — bypasses React render cycle
  // ──────────────────────────────────────────────────────────────
  const applyTransformToDOM = useCallback((x: number, y: number) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
    const el = isDesktop ? desktopTrainElRef.current : mobileTrainElRef.current;
    if (el) {
      el.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Core animation: smooth glide with proper duration + easing
  // ──────────────────────────────────────────────────────────────
  const startAnimation = useCallback((targetX: number, targetY: number) => {
    // Cancel any running animation — we retarget from current real position
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    const startX = currentPosRef.current.x;
    const startY = currentPosRef.current.y;

    // First placement (before user sees train): snap immediately
    if (!hasInitialPlacement.current || (startX === 0 && startY === 0)) {
      currentPosRef.current = { x: targetX, y: targetY };
      applyTransformToDOM(targetX, targetY);
      hasInitialPlacement.current = true;
      isAnimatingRef.current = false;
      return;
    }

    // Snap if prefers-reduced-motion is active
    if (prefersReducedMotion) {
      currentPosRef.current = { x: targetX, y: targetY };
      applyTransformToDOM(targetX, targetY);
      isAnimatingRef.current = false;
      return;
    }

    // Calculate distance-based duration
    const distance = Math.hypot(targetX - startX, targetY - startY);

    // If distance is negligible (< 2px), snap — no visible motion needed
    if (distance < 2) {
      currentPosRef.current = { x: targetX, y: targetY };
      applyTransformToDOM(targetX, targetY);
      isAnimatingRef.current = false;
      return;
    }

    // Duration: minimum 650ms (adjacent), maximum 1150ms (farthest)
    // Scale by distance with a factor that produces good results
    const duration = Math.min(1150, Math.max(650, distance * 2.5));

    // Smooth ease-in-out cubic — no overshoot, no bounce
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const startTime = performance.now();
    isAnimatingRef.current = true;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);

      const curX = startX + (targetX - startX) * eased;
      const curY = startY + (targetY - startY) * eased;

      // Write position to ref (source of truth)
      currentPosRef.current = { x: curX, y: curY };
      // Write directly to DOM — no React setState
      applyTransformToDOM(curX, curY);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete — final sync
        currentPosRef.current = { x: targetX, y: targetY };
        applyTransformToDOM(targetX, targetY);
        animRef.current = null;
        isAnimatingRef.current = false;
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [prefersReducedMotion, applyTransformToDOM]);

  // ──────────────────────────────────────────────────────────────
  // Measure berth position relative to track container
  // ──────────────────────────────────────────────────────────────
  const measureBerthTarget = useCallback((sectionId: string): { x: number; y: number } | null => {
    if (typeof window === 'undefined') return null;
    const isDesktop = window.innerWidth >= 640;
    const activeRef = isDesktop ? desktopRefs.current[sectionId] : mobileRefs.current[sectionId];
    const container = isDesktop ? desktopTrackRef.current : mobileTrackRef.current;

    if (!activeRef || !container) return null;

    const activeRect = activeRef.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (isDesktop) {
      const x = activeRect.left - containerRect.left + activeRect.width / 2;
      const y = 12; // Lane offset from top of compacted track
      return { x, y };
    } else {
      const x = containerRect.width - 36;
      const y = activeRect.top - containerRect.top + activeRect.height / 2;
      return { x, y };
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Position update dispatcher (animate vs snap)
  // ──────────────────────────────────────────────────────────────
  const updateTrainPosition = useCallback((isImmediate = false) => {
    const target = measureBerthTarget(activeSection);
    if (!target) return;

    if (isImmediate) {
      // Immediate snap (initial mount, reduced-motion, resize without animation)
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      currentPosRef.current = { x: target.x, y: target.y };
      applyTransformToDOM(target.x, target.y);
      isAnimatingRef.current = false;
    } else {
      // Animated glide — startAnimation reads currentPosRef for retarget
      startAnimation(target.x, target.y);
    }
  }, [activeSection, measureBerthTarget, startAnimation, applyTransformToDOM]);

  // ──────────────────────────────────────────────────────────────
  // Trigger animation when section changes (user clicks station)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mounted) {
      updateTrainPosition(false);
    }
  }, [activeSection, mounted]);

  // ──────────────────────────────────────────────────────────────
  // Resize + container layout observer — GUARDED against animation kill
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    // Initial placement — snap immediately (before user sees train)
    const initialTimer = setTimeout(() => {
      if (!hasInitialPlacement.current) {
        updateTrainPosition(true);
        hasInitialPlacement.current = true;
      }
    }, 60);

    const handleResize = () => {
      if (isAnimatingRef.current) {
        // Mid-animation: retarget to new berth position, don't snap
        const target = measureBerthTarget(activeSection);
        if (target) {
          // Start a new animation from current real position to new target
          startAnimation(target.x, target.y);
        }
      } else {
        // No animation running: snap immediately
        updateTrainPosition(true);
      }
    };

    window.addEventListener('resize', handleResize);

    // ResizeObserver on track containers — guarded against animation snaps
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const deltaW = Math.abs(width - lastContainerSize.current.w);
        const deltaH = Math.abs(height - lastContainerSize.current.h);

        // Ignore sub-pixel layout thrashing (< 5px change)
        if (deltaW < 5 && deltaH < 5) continue;

        lastContainerSize.current = { w: width, h: height };

        if (isAnimatingRef.current) {
          // Animation in flight: retarget from current position, don't snap
          const target = measureBerthTarget(activeSection);
          if (target) {
            startAnimation(target.x, target.y);
          }
        } else {
          // No animation: safe to snap
          updateTrainPosition(true);
        }
      }
    });

    if (desktopTrackRef.current) {
      const rect = desktopTrackRef.current.getBoundingClientRect();
      lastContainerSize.current = { w: rect.width, h: rect.height };
      observer.observe(desktopTrackRef.current);
    }
    if (mobileTrackRef.current) {
      const rect = mobileTrackRef.current.getBoundingClientRect();
      lastContainerSize.current = { w: rect.width, h: rect.height };
      observer.observe(mobileTrackRef.current);
    }

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [mounted, isCollapsed, activeSection, measureBerthTarget, startAnimation, updateTrainPosition]);

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
                alert('Vui lòng đăng nhập để thiết lập và tùy biến nhân vật di chuyển xanh.');
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

      {/* Desktop View: Horizontal Journey Map with SVG Tracks — compacted height */}
      {!isCollapsed && (
        <div
          ref={desktopTrackRef}
          className="hidden sm:block relative py-1.5 px-2 z-10"
          style={{ position: 'relative', height: '72px' }}
        >
          {/* SVG Railway Track Background */}
          <div className="absolute top-[21px] left-0 right-0 h-3 -translate-y-1/2 pointer-events-none z-0 px-12">
            <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 10,6 L 10,-6 M 40,6 L 40,-6 M 70,6 L 70,-6 M 100,6 L 100,-6 M 130,6 L 130,-6 M 160,6 L 160,-6 M 190,6 L 190,-6 M 220,6 L 220,-6 M 250,6 L 250,-6 M 280,6 L 280,-6 M 310,6 L 310,-6 M 340,6 L 340,-6 M 370,6 L 370,-6 M 400,6 L 400,-6 M 430,6 L 430,-6 M 460,6 L 460,-6 M 490,6 L 490,-6 M 520,6 L 520,-6 M 550,6 L 550,-6 M 580,6 L 580,-6 M 610,6 L 610,-6 M 640,6 L 640,-6 M 670,6 L 670,-6 M 700,6 L 700,-6 M 730,6 L 730,-6 M 760,6 L 760,-6 M 790,6 L 790,-6 M 820,6 L 820,-6 M 850,6 L 850,-6 M 880,6 L 880,-6 M 910,6 L 910,-6 M 940,6 L 940,-6 M 970,6 L 970,-6 M 1000,6 L 1000,-6 M 1030,6 L 1030,-6 M 1060,6 L 1060,-6 M 1090,6 L 1090,-6 M 1120,6 L 1120,-6"
                stroke="#4B5E70"
                strokeWidth="1.5"
                strokeOpacity="0.2"
              />
              <line x1="0%" y1="-2" x2="100%" y2="-2" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.3" />
              <line x1="0%" y1="2" x2="100%" y2="2" stroke="#9FCE1A" strokeWidth="1.5" strokeOpacity="0.3" />
            </svg>
          </div>

          {/* Dynamic train — outer position layer (ONLY element with position transform) */}
          <div
            ref={desktopTrainElRef}
            id="desktop-train"
            className="absolute z-30 pointer-events-none"
            style={{
              position: 'absolute',
              zIndex: 30,
              left: 0,
              top: 0,
              transform: 'translate3d(0px, 0px, 0)',
              width: '96px',
              height: '40px',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          >
            {/* Inner train body — direction flip only, no position animation */}
            <DesktopTrain avatarConfig={getUserAvatarConfig(selectedChar)} direction={direction} />
          </div>

          {/* Nodes Grid — station buttons below train lane */}
          <div className="relative z-10 grid grid-cols-6 gap-1" style={{ paddingTop: '6px' }}>
            {JOURNEY_STATIONS.map((station) => {
              const isActive = activeSection === station.id;

              return (
                <div key={station.id} className="flex flex-col items-center text-center relative" style={{ paddingTop: '28px' }}>
                  {/* Connector line from rail down to station button */}
                  <div
                    className="absolute w-[1.5px] border-l-2 border-dashed border-eco-primary/20 pointer-events-none z-0"
                    style={{ top: '-8px', height: '36px', left: '50%', transform: 'translateX(-50%)' }}
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

      {/* Mobile View: Vertical Metro Route Line */}
      {!isCollapsed && (
        <div
          ref={mobileTrackRef}
          className="sm:hidden relative pl-6 pr-24 py-1.5 z-10"
          style={{ position: 'relative' }}
        >
          {/* Steel Rail Line Background on the right */}
          <div className="absolute top-0 bottom-0 right-[36px] w-[6px] pointer-events-none z-0">
            <div className="w-full h-full bg-slate-100 border-l border-r border-eco-primary/10 relative">
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-eco-primary/30" />
            </div>
          </div>

          {/* Dynamic train — outer position layer */}
          <div
            ref={mobileTrainElRef}
            id="mobile-train"
            className="absolute z-30 pointer-events-none"
            style={{
              position: 'absolute',
              zIndex: 30,
              left: 0,
              top: 0,
              transform: 'translate3d(0px, 0px, 0)',
              width: '72px',
              height: '48px',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          >
            <MobileTrain avatarConfig={getUserAvatarConfig(selectedChar)} direction={direction} />
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
