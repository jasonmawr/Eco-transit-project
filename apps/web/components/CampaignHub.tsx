'use client';

import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
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

const parseTransformMatrix = (transformStr: string): { x: number; y: number } => {
  if (!transformStr || transformStr === 'none') {
    return { x: 0, y: 0 };
  }
  const matrixMatch = transformStr.match(/^matrix\((.+)\)$/);
  if (matrixMatch) {
    const values = matrixMatch[1].split(',').map(Number);
    return { x: values[4], y: values[5] };
  }
  const matrix3DMatch = transformStr.match(/^matrix3d\((.+)\)$/);
  if (matrix3DMatch) {
    const values = matrix3DMatch[1].split(',').map(Number);
    return { x: values[12], y: values[13] };
  }
  return { x: 0, y: 0 };
};
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
  // ANIMATION ENGINE — requestAnimationFrame Path Travel System
  // ──────────────────────────────────────────────────────────────

  const [hasPlaced, setHasPlaced] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [desktopPathD, setDesktopPathD] = useState('');
  const [mobilePathD, setMobilePathD] = useState('');
  const [containerWidth, setContainerWidth] = useState(1000);
  const [containerHeight, setContainerHeight] = useState(72);
  const [pathLength, setPathLength] = useState(1000);

  // Animation boundaries for segment clipping energy flows
  const [startProgressVal, setStartProgressVal] = useState(0);
  const [targetProgressVal, setTargetProgressVal] = useState(0);
  const [isForwards, setIsForwards] = useState(true);

  // Progress references and loop handlers
  const railProgressRef = useRef(0);
  const isMovingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Mapped stop point coordinates
  const stationProgressRef = useRef<Record<string, number>>({});
  const stationDistanceRef = useRef<Record<string, number>>({});

  // Safe dynamic IDs per instance
  const clipId = useId();
  const desktopClipId = `desktop-active-clip-${clipId}`;
  const mobileClipId = `mobile-active-clip-${clipId}`;

  // Direct DOM refs
  const desktopTrainElRef = useRef<HTMLDivElement | null>(null);
  const mobileTrainElRef = useRef<HTMLDivElement | null>(null);
  const desktopRailPathRef = useRef<SVGPathElement | null>(null);
  const mobileRailPathRef = useRef<SVGPathElement | null>(null);

  // Bounding containers & station button refs
  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const desktopRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const mobileRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});

  const lastContainerSize = useRef({ w: 0, h: 0 });

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
  // Position update dispatcher using SVG path
  // ──────────────────────────────────────────────────────────────
  const updateToProgress = useCallback((p: number) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
    const trainEl = isDesktop ? desktopTrainElRef.current : mobileTrainElRef.current;
    const pathEl = isDesktop ? desktopRailPathRef.current : mobileRailPathRef.current;
    if (!trainEl || !pathEl) return;

    try {
      const totalLen = pathEl.getTotalLength();
      const point = pathEl.getPointAtLength(p * totalLen);

      const trainRect = trainEl.getBoundingClientRect();
      const trainW = trainRect.width > 0 ? trainRect.width : (isDesktop ? 96 : 72);
      const trainH = trainRect.height > 0 ? trainRect.height : (isDesktop ? 40 : 48);

      const targetX = point.x - trainW / 2;
      const targetY = point.y - trainH / 2;

      trainEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    } catch (e) {
      // Swallowed: path length query may fail if rendering is incomplete
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Measure layout and dynamically build SVG rails
  // ──────────────────────────────────────────────────────────────
  const measureAndBuildPaths = useCallback(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.innerWidth >= 640;
    const container = isDesktop ? desktopTrackRef.current : mobileTrackRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.width <= 0 || containerRect.height <= 0) return;

    setContainerWidth(containerRect.width);
    setContainerHeight(containerRect.height);

    // Derived rail center coordinates (desktop horizontal line, mobile vertical line)
    const railCenterY = 13;
    const railCenterX = containerRect.width - 36;

    const berths: { x: number; y: number }[] = [];
    const activeRefs = isDesktop ? desktopRefs.current : mobileRefs.current;

    for (let i = 0; i < JOURNEY_STATIONS.length; i++) {
      const station = JOURNEY_STATIONS[i];
      const button = activeRefs[station.id];
      if (!button) return; // Wait until all buttons render

      const buttonRect = button.getBoundingClientRect();
      const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top - containerRect.top + buttonRect.height / 2;

      if (isDesktop) {
        berths.push({ x: buttonCenterX, y: railCenterY });
      } else {
        berths.push({ x: railCenterX, y: buttonCenterY });
      }
    }

    let totalLen = 0;
    const distances = [0];
    for (let i = 1; i < berths.length; i++) {
      const dist = Math.hypot(berths[i].x - berths[i - 1].x, berths[i].y - berths[i - 1].y);
      totalLen += dist;
      distances.push(totalLen);
    }

    if (totalLen <= 0) return;

    setPathLength(totalLen);

    const progressMap: Record<string, number> = {};
    const distanceMap: Record<string, number> = {};
    for (let i = 0; i < JOURNEY_STATIONS.length; i++) {
      progressMap[JOURNEY_STATIONS[i].id] = distances[i] / totalLen;
      distanceMap[JOURNEY_STATIONS[i].id] = distances[i];
    }
    stationProgressRef.current = progressMap;
    stationDistanceRef.current = distanceMap;

    let pathDStr = `M ${berths[0].x} ${berths[0].y}`;
    for (let i = 1; i < berths.length; i++) {
      pathDStr += ` L ${berths[i].x} ${berths[i].y}`;
    }

    if (isDesktop) {
      setDesktopPathD(pathDStr);
    } else {
      setMobilePathD(pathDStr);
    }

    if (!isMovingRef.current) {
      const currentStationProgress = progressMap[activeSection] ?? 0;
      railProgressRef.current = currentStationProgress;
      setHasPlaced(true);
      requestAnimationFrame(() => {
        updateToProgress(currentStationProgress);
      });
    }
  }, [activeSection, updateToProgress]);

  // ──────────────────────────────────────────────────────────────
  // Trigger single RAF animation loop on station changes
  // ──────────────────────────────────────────────────────────────
  const startRailAnimation = useCallback((targetProgress: number) => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
    const pathEl = isDesktop ? desktopRailPathRef.current : mobileRailPathRef.current;
    if (!pathEl) return;

    let totalLen = 1000;
    try {
      totalLen = pathEl.getTotalLength();
    } catch (e) {}

    const startProgress = railProgressRef.current;
    const distanceToTravel = Math.abs(targetProgress - startProgress) * totalLen;

    if (distanceToTravel < 0.5) {
      railProgressRef.current = targetProgress;
      updateToProgress(targetProgress);
      return;
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setStartProgressVal(startProgress);
    setTargetProgressVal(targetProgress);
    setIsForwards(targetProgress >= startProgress);

    // Timing formula: Adjacent station (1 station gap length) is 1350ms, longest (5 stations) is 2100ms.
    // Proportional scaling for intermediate/rapid-click remaining distances.
    const minGapDistance = totalLen / 5;
    const duration = 1350 + Math.max(0, (distanceToTravel - minGapDistance) / (totalLen - minGapDistance || 1)) * 750;

    const startTime = performance.now();
    isMovingRef.current = true;
    setIsMoving(true);

    if (typeof window !== 'undefined') {
      (window as any).__lastMetroAnimationStart = performance.now();
      (window as any).__lastMetroAnimationDuration = null;
      (window as any).__lastMetroAnimationExpectedDuration = duration;
    }

    const loop = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Ease-in-out cubic easing
      const f = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const p = startProgress + (targetProgress - startProgress) * f;
      railProgressRef.current = p;

      updateToProgress(p);

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(loop);
      } else {
        railProgressRef.current = targetProgress;
        updateToProgress(targetProgress);
        isMovingRef.current = false;
        setIsMoving(false);
        rafIdRef.current = null;

        if (typeof window !== 'undefined' && (window as any).__lastMetroAnimationStart) {
          (window as any).__lastMetroAnimationDuration = performance.now() - (window as any).__lastMetroAnimationStart;
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [updateToProgress]);

  // Click triggers
  useEffect(() => {
    if (mounted) {
      const targetProgress = stationProgressRef.current[activeSection] ?? 0;
      if (prefersReducedMotion) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        railProgressRef.current = targetProgress;
        updateToProgress(targetProgress);
        setHasPlaced(true);
      } else {
        startRailAnimation(targetProgress);
      }
    }
  }, [activeSection, mounted, prefersReducedMotion, startRailAnimation, updateToProgress]);

  // Resize + container layout observer — retargets mid-animation
  useEffect(() => {
    if (!mounted) return;

    // Initial placement fallback in case layout isn't immediate
    const initialTimer = setTimeout(() => {
      if (!hasPlaced) {
        measureAndBuildPaths();
      }
    }, 200);

    const handleResize = () => {
      measureAndBuildPaths();
    };

    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const deltaW = Math.abs(width - lastContainerSize.current.w);
        const deltaH = Math.abs(height - lastContainerSize.current.h);

        if (deltaW < 5 && deltaH < 5) continue;

        lastContainerSize.current = { w: width, h: height };
        handleResize();
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
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [mounted, hasPlaced, measureAndBuildPaths]);

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

      {/* Desktop View: Horizontal Journey Map with SVG Tracks — compacted height */}
      {!isCollapsed && (
        <div
          ref={desktopTrackRef}
          data-testid="desktop-track"
          className="hidden sm:block relative py-1.5 px-2 z-10"
          style={{ position: 'relative', height: '76px' }}
        >
          {/* Style injection for markers flow and bob-lean animations */}
          <style>{`
            @keyframes flow-dash {
              to {
                stroke-dashoffset: -32;
              }
            }
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

          {/* SVG Railway Track Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${containerWidth} ${containerHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={desktopRailPathRef}
                id="desktopRailPath"
                d={desktopPathD}
                stroke="none"
                fill="none"
              />

              <path
                d={desktopPathD}
                stroke="#4B5E70"
                strokeWidth="1.2"
                strokeOpacity="0.15"
                strokeDasharray="2 6"
              />

              <path
                d={desktopPathD}
                stroke="#4B5E70"
                strokeWidth="2.5"
                strokeOpacity="0.2"
              />

              {/* Active segment clip path */}
              <clipPath id={desktopClipId}>
                <path
                  d={desktopPathD}
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`0 ${Math.min(startProgressVal, targetProgressVal) * pathLength} ${Math.abs(targetProgressVal - startProgressVal) * pathLength} ${pathLength}`}
                  fill="none"
                />
              </clipPath>

              {/* Glow overlay */}
              <path
                d={desktopPathD}
                stroke="#0066FF"
                strokeWidth="3.5"
                opacity={isMoving ? 0.35 : 0}
                clipPath={`url(#${desktopClipId})`}
                className="transition-opacity duration-300"
              />

              {/* Flow dashes */}
              <path
                d={desktopPathD}
                stroke="#9FCE1A"
                strokeWidth="2"
                strokeDasharray="8 20"
                clipPath={`url(#${desktopClipId})`}
                style={{
                  opacity: isMoving ? 0.8 : 0,
                  animation: isMoving ? 'flow-dash 0.8s linear infinite' : 'none',
                  animationDirection: isForwards ? 'normal' : 'reverse'
                }}
                className="transition-opacity duration-300"
              />
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
              width: '96px',
              height: '40px',
              pointerEvents: 'none',
              willChange: 'transform',
              opacity: hasPlaced ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          >
            {/* Inner train body — direction flip, bobbing, leaning */}
            <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
              <DesktopTrain avatarConfig={getUserAvatarConfig(selectedChar)} direction={direction} />
            </div>
          </div>

          {/* Nodes Grid — station buttons below train lane */}
          <div className="relative z-10 grid grid-cols-6 gap-1" style={{ paddingTop: '6px' }}>
            {JOURNEY_STATIONS.map((station) => {
              const isActive = activeSection === station.id;

              return (
                <div key={station.id} className="flex flex-col items-center text-center relative" style={{ paddingTop: '36px' }}>
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

      {/* Mobile View: Vertical Metro Route Line */}
      {!isCollapsed && (
        <div
          ref={mobileTrackRef}
          data-testid="mobile-track"
          className="sm:hidden relative pl-6 pr-24 py-1.5 z-10"
          style={{ position: 'relative' }}
        >
          {/* Steel Rail Line Background on the right */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${containerWidth} ${containerHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={mobileRailPathRef}
                id="mobileRailPath"
                d={mobilePathD}
                stroke="none"
                fill="none"
              />

              <path
                d={mobilePathD}
                stroke="#4B5E70"
                strokeWidth="1.2"
                strokeOpacity="0.15"
                strokeDasharray="2 6"
              />

              <path
                d={mobilePathD}
                stroke="#4B5E70"
                strokeWidth="2.5"
                strokeOpacity="0.2"
              />

              {/* Active segment clip path */}
              <clipPath id={mobileClipId}>
                <path
                  d={mobilePathD}
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`0 ${Math.min(startProgressVal, targetProgressVal) * pathLength} ${Math.abs(targetProgressVal - startProgressVal) * pathLength} ${pathLength}`}
                  fill="none"
                />
              </clipPath>

              {/* Glow overlay */}
              <path
                d={mobilePathD}
                stroke="#0066FF"
                strokeWidth="3.5"
                opacity={isMoving ? 0.35 : 0}
                clipPath={`url(#${mobileClipId})`}
                className="transition-opacity duration-300"
              />

              {/* Flow dashes */}
              <path
                d={mobilePathD}
                stroke="#9FCE1A"
                strokeWidth="2"
                strokeDasharray="8 20"
                clipPath={`url(#${mobileClipId})`}
                style={{
                  opacity: isMoving ? 0.8 : 0,
                  animation: isMoving ? 'flow-dash 0.8s linear infinite' : 'none',
                  animationDirection: isForwards ? 'normal' : 'reverse'
                }}
                className="transition-opacity duration-300"
              />
            </svg>
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
              width: '72px',
              height: '48px',
              pointerEvents: 'none',
              willChange: 'transform',
              opacity: hasPlaced ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
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
