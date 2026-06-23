'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AvatarSvg, AvatarConfig } from '../../components/ui/AvatarSvg';
import { useMetroTravelSound } from '../../lib/useMetroTravelSound';

const JOURNEY_STATIONS = [
  { id: 'route', name: 'Lập lộ trình xanh', num: 1, desc: 'Lập lộ trình tối ưu', icon: '🛤️' },
  { id: 'stations', name: 'Khám phá ga', num: 2, desc: 'Khám phá nhà ga & Địa điểm', icon: '🚉' },
  { id: 'tickets', name: 'Tích điểm vé xanh', num: 3, desc: 'Nhật ký tích điểm vé', icon: '🎫' },
  { id: 'rewards', name: 'Đổi thưởng', num: 4, desc: 'Danh mục đổi thưởng', icon: '🎁' },
  { id: 'xanhwrap', name: 'XanhWrap / Chia sẻ', num: 5, desc: 'Tạo thẻ chia sẻ XanhWrap', icon: '✨' },
  { id: 'guides', name: 'Cẩm nang lướt xanh', num: 6, desc: 'Mẹo & Cẩm nang xanh', icon: '📖' },
];

const DEFAULT_AVATAR: AvatarConfig = {
  characterId: 'student',
  hairStyle: 'short',
  hairColor: 'default',
  outfitStyle: 'casual',
  outfitColor: 'electricBlue',
  accessory: 'backpack'
};

// ─── THREE-CAR DESKTOP METRO (width 132, height 40) ───
const DesktopThreeCarTrain = ({ avatarConfig, direction }: { avatarConfig: AvatarConfig; direction: 'right' | 'left' }) => {
  return (
    <div className="relative w-[132px] h-10 pointer-events-none" style={{ pointerEvents: 'none' }}>
      <svg
        width="132"
        height="40"
        viewBox="0 0 132 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
        style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
      >
        {/* Carriage 3 (Rear - Leftmost in standard view) */}
        <rect data-testid="desktop-carriage" x="2" y="2" width="40" height="24" rx="6" fill="url(#train-grad-lab)" stroke="#0A1118" strokeWidth="2.5" />
        <rect x="2" y="14" width="40" height="3" fill="#9FCE1A" />
        <rect x="8" y="6" width="10" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="24" y="6" width="10" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="8" y="26" width="28" height="3" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />
        <circle cx="12" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <circle cx="32" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />

        {/* Connector 2 */}
        <rect x="42" y="10" width="4" height="6" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <line x1="44" y1="10" x2="44" y2="16" stroke="#4B5E70" strokeWidth="1" />

        {/* Carriage 2 (Middle) */}
        <rect data-testid="desktop-carriage" x="46" y="2" width="40" height="24" rx="6" fill="url(#train-grad-lab)" stroke="#0A1118" strokeWidth="2.5" />
        <rect x="46" y="14" width="40" height="3" fill="#9FCE1A" />
        <rect x="52" y="6" width="10" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="68" y="6" width="10" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="52" y="26" width="28" height="3" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />
        <circle cx="56" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <circle cx="76" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />

        {/* Connector 1 */}
        <rect x="86" y="10" width="4" height="6" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <line x1="88" y1="10" x2="88" y2="16" stroke="#4B5E70" strokeWidth="1" />

        {/* Carriage 1 (Front Cab - Rightmost in standard view) */}
        <rect data-testid="desktop-carriage" x="90" y="2" width="40" height="24" rx="6" fill="url(#train-grad-lab)" stroke="#0A1118" strokeWidth="2.5" />
        <rect x="90" y="14" width="30" height="3" fill="#9FCE1A" />
        {/* Cab windshield */}
        <path d="M 116,6 L 126,6 Q 128,6 128,9 L 124,16 L 114,16 Z" fill="#0A1118" stroke="#0A1118" strokeWidth="1.5" />
        <path d="M 117,8 L 124,8 L 122,14 L 116,14 Z" fill="#38BDF8" opacity="0.8" />
        {/* Passenger window for Avatar */}
        <rect x="96" y="6" width="12" height="10" rx="2" fill="#0F172A" stroke="#0A1118" strokeWidth="1.5" />
        {/* Wheels for Front Cab */}
        <rect x="96" y="26" width="28" height="3" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />
        <circle cx="100" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />
        <circle cx="120" cy="29" r="3.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1.5" />

        {/* Headlight yellow glow */}
        <circle cx="127" cy="20" r="2" fill="#FBBF24" />
        <circle cx="127" cy="20" r="4" fill="#FBBF24" opacity="0.4" />

        {/* Route sign indicator */}
        <rect x="104" y="18" width="10" height="4" rx="1" fill="#0A1118" />
        <text x="105.5" y="21.2" fill="#9FCE1A" fontSize="3" fontWeight="bold" fontFamily="sans-serif">M1</text>

        <defs>
          <linearGradient id="train-grad-lab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar looking out of Carriage 1 passenger window */}
      <div
        className="absolute w-5 h-5 overflow-hidden rounded-full z-20 border border-[#0A1118] bg-slate-900"
        style={{
          top: '11px',
          left: direction === 'left' ? '30px' : '102px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AvatarSvg config={avatarConfig} className="w-full h-full" />
      </div>
    </div>
  );
};

// ─── THREE-CAR MOBILE METRO (width 90, height 32) ───
const MobileThreeCarTrain = ({ avatarConfig, direction }: { avatarConfig: AvatarConfig; direction: 'right' | 'left' }) => {
  return (
    <div className="relative w-[90px] h-8 flex flex-col items-center justify-end pointer-events-none" style={{ pointerEvents: 'none' }}>
      <svg
        width="90"
        height="32"
        viewBox="0 0 90 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
        style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
      >
        {/* Carriage 3 (Rear) */}
        <rect data-testid="mobile-carriage" x="2" y="2" width="26" height="18" rx="4" fill="url(#train-grad-mobile-lab)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="2" y="11" width="26" height="2" fill="#9FCE1A" />
        <rect x="6" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="10" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="20" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Connector 2 */}
        <rect x="28" y="9" width="4" height="4" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />

        {/* Carriage 2 (Middle) */}
        <rect data-testid="mobile-carriage" x="32" y="2" width="26" height="18" rx="4" fill="url(#train-grad-mobile-lab)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="32" y="11" width="26" height="2" fill="#9FCE1A" />
        <rect x="36" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="40" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="50" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Connector 1 */}
        <rect x="58" y="9" width="4" height="4" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />

        {/* Carriage 1 (Front Cab) */}
        <rect data-testid="mobile-carriage" x="62" y="2" width="26" height="18" rx="4" fill="url(#train-grad-mobile-lab)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="62" y="11" width="20" height="2" fill="#9FCE1A" />
        {/* Windshield */}
        <path d="M 78,5 L 86,5 Q 87,5 87,7 L 83,12 L 75,12 Z" fill="#0A1118" stroke="#0A1118" strokeWidth="0.8" />
        <path d="M 79,6 L 85,6 L 83,11 L 77,11 Z" fill="#38BDF8" opacity="0.8" />
        {/* Passenger window for Avatar */}
        <rect x="66" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="70" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="80" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Headlight */}
        <circle cx="86" cy="15" r="1.5" fill="#FBBF24" />

        <defs>
          <linearGradient id="train-grad-mobile-lab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar looking out of Carriage 1 passenger window */}
      <div
        className="absolute w-4 h-4 overflow-hidden rounded-full z-20 border border-[#0A1118] bg-slate-900"
        style={{
          top: '14px',
          left: direction === 'left' ? '20px' : '70px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AvatarSvg config={avatarConfig} className="w-full h-full" />
      </div>
    </div>
  );
};

export default function MetroRailMotionLab() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [containerWidth, setContainerWidth] = useState(0);
  const [mobileContainerHeight, setMobileContainerHeight] = useState(0);
  
  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const trainRef = useRef<HTMLDivElement | null>(null);
  const mobileTrainRef = useRef<HTMLDivElement | null>(null);
  
  const labIdRef = useRef('');
  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize travel sound hook
  const { soundEnabled, toggleSound, playJourneySound, stopJourneySound } = useMetroTravelSound();

  // CSS transition event telemetry
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [telemetry, setTelemetry] = useState({
    domInstanceId: '',
    runCount: 0,
    startCount: 0,
    endCount: 0,
    cancelCount: 0,
    lastTriggerTimestamp: 0,
    lastDuration: 0,
    lastStartTransform: '',
    lastEndTransform: '',
  });

  useEffect(() => {
    setMounted(true);
    labIdRef.current = 'train-instance-' + Math.random().toString(36).substring(2, 9);
    setTelemetry(prev => ({ ...prev, domInstanceId: labIdRef.current }));

    const handleResize = () => {
      if (desktopTrackRef.current) {
        setContainerWidth(desktopTrackRef.current.clientWidth);
      }
      if (mobileTrackRef.current) {
        setMobileContainerHeight(mobileTrackRef.current.clientHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      
      // Delay measurement slightly to settle
      const t = setTimeout(handleResize, 150);
      return () => {
        window.removeEventListener('resize', handleResize);
        mediaQuery.removeEventListener('change', handler);
        clearTimeout(t);
      };
    }
  }, []);

  const handleStationChange = (newIdx: number) => {
    if (newIdx === activeIndex) return;

    // Clear any pending timer
    if (movingTimerRef.current) {
      clearTimeout(movingTimerRef.current);
      movingTimerRef.current = null;
    }

    setTelemetry(prev => {
      const currentTransform = trainRef.current ? window.getComputedStyle(trainRef.current).transform : 'none';
      return {
        ...prev,
        runCount: prev.runCount + 1,
        lastTriggerTimestamp: Date.now(),
        lastStartTransform: currentTransform,
      };
    });

    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] Clicked station ${newIdx + 1}. Starting journey...`, ...prev]);

    setPrevIndex(activeIndex);
    setActiveIndex(newIdx);
    setDirection(newIdx > activeIndex ? 'right' : 'left');

    const duration = getTransitionDuration(activeIndex, newIdx);

    if (prefersReducedMotion) {
      // Reduced motion snap behavior
      setIsMoving(false);
      
      // Play departure beep only (if soundEnabled is true)
      // Since playJourneySound normally starts rolling, we bypass it for reduced motion and play departure directly if possible
      const departure = new Audio('/audio/metro-departure.mp3');
      departure.volume = 0.25;
      if (soundEnabled) {
        departure.play().catch(() => {});
      }
      
      setTelemetry(prev => ({
        ...prev,
        endCount: prev.endCount + 1,
        lastDuration: 0,
      }));
      setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] Snapped instantly due to prefers-reduced-motion`, ...prev]);
    } else {
      // Normal motion journey
      setIsMoving(true);
      
      // Play sound layers
      playJourneySound();

      // Set timers to stop/fade rolling sound on arrival
      movingTimerRef.current = setTimeout(() => {
        setIsMoving(false);
        stopJourneySound(true); // Smooth fade rolling sound on arrival
      }, duration);
    }
  };

  const getTransitionDuration = (fromIdx: number, toIdx: number): number => {
    const gap = Math.abs(toIdx - fromIdx);
    if (gap === 0) return 1400;
    if (gap === 1) return 1600; // Adjacent: 1.6s minimum
    if (gap <= 3) return 1950;  // 2-3 stations: ~1.8-2.1s
    return 2300;                // 4-5 stations: maximum 2.3s
  };

  const duration = getTransitionDuration(prevIndex, activeIndex);

  // Geometric Constants
  const DESKTOP_TRAIN_W = 132; // Updated for 3 cars
  const DESKTOP_TRAIN_H = 40;
  const DESKTOP_RAIL_LANE_CENTER_Y = 36;
  const DESKTOP_PADDING_X = 16; 

  const MOBILE_TRAIN_W = 90; // Updated for 3 cars
  const MOBILE_TRAIN_H = 32;
  const MOBILE_PADDING_Y = 12;

  // Transform generators (transform only, no left/top runtime writes)
  const getTrainTransform = (idx: number): string => {
    if (containerWidth === 0) return 'translate3d(0px, 0px, 0)';
    const gridW = containerWidth - DESKTOP_PADDING_X * 2;
    const cx = DESKTOP_PADDING_X + (gridW * (idx * 2 + 1)) / 12;
    const tx = cx - DESKTOP_TRAIN_W / 2;
    const ty = DESKTOP_RAIL_LANE_CENTER_Y - DESKTOP_TRAIN_H / 2;
    return `translate3d(${tx}px, ${ty}px, 0)`;
  };

  const getMobileTrainTransform = (idx: number): string => {
    if (mobileContainerHeight === 0) return 'translate3d(0px, 0px, 0)';
    const gridH = mobileContainerHeight - MOBILE_PADDING_Y * 2;
    const cy = MOBILE_PADDING_Y + (gridH * (idx * 2 + 1)) / 12;
    const tx = 0; // Sits in dedicated lane
    const ty = cy - MOBILE_TRAIN_H / 2;
    return `translate3d(${tx}px, ${ty}px, 0)`;
  };

  // CSS event listeners
  const onTransitionRun = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setTelemetry(prev => ({ ...prev, runCount: prev.runCount + 1 }));
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitionrun fired for ${e.propertyName}`, ...prev]);
  };

  const onTransitionStart = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setTelemetry(prev => ({ ...prev, startCount: prev.startCount + 1 }));
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitionstart fired for ${e.propertyName}`, ...prev]);
  };

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setIsMoving(false);
    setTelemetry(prev => {
      const finalTransform = trainRef.current ? window.getComputedStyle(trainRef.current).transform : 'none';
      return {
        ...prev,
        endCount: prev.endCount + 1,
        lastEndTransform: finalTransform,
        lastDuration: Date.now() - prev.lastTriggerTimestamp,
      };
    });
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitionend fired for ${e.propertyName}. Journey completed!`, ...prev]);
  };

  const onTransitionCancel = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setIsMoving(false);
    setTelemetry(prev => ({ ...prev, cancelCount: prev.cancelCount + 1 }));
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitioncancel fired for ${e.propertyName}!`, ...prev]);
  };

  if (!mounted) return <div className="p-8">Đang tải Motion Lab...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-700 pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#9FCE1A] uppercase tracking-wider">
              🚇 ECOTRANSIT A1 THREE-CAR MOTION LAB
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Phase A.1: Nâng cấp thành tàu Metro 3 toa tích hợp âm thanh hành trình & giảm chuyển động (prefers-reduced-motion).
            </p>
          </div>

          {/* Sound Toggle Control */}
          <button
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label="Bật/Tắt âm thanh hành trình"
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#9FCE1A] ${
              soundEnabled
                ? 'bg-[#9FCE1A] text-slate-950 border-[#9FCE1A] hover:bg-[#8eb817]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
            }`}
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span>Âm thanh hành trình: {soundEnabled ? 'Bật' : 'Tắt'}</span>
          </button>
        </div>

        {/* The Isolated Rail Stage - DESKTOP */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-8 relative">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
            SÂN KHẤU CHUYỂN ĐỘNG DESKTOP (3 TOA)
          </h2>

          <div
            ref={desktopTrackRef}
            className="relative py-6 px-4 bg-slate-950/60 rounded-xl border border-slate-800"
            style={{ minHeight: '120px' }}
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
                100% { transform: translateY(1.5px) rotate(-0.4deg); }
              }
            `}</style>

            {/* ─── Decorative Rail Track Line ─── */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                top: `${DESKTOP_RAIL_LANE_CENTER_Y}px`,
                left: `${DESKTOP_PADDING_X}px`,
                right: `${DESKTOP_PADDING_X}px`,
                height: '4px',
              }}
            >
              {/* Base rail line */}
              <div className="absolute inset-0 rounded-full bg-slate-700 opacity-60" />
              {/* Rail ties / sleepers */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.1) 18px, rgba(255,255,255,0.1) 20px)',
                }}
              />
              {/* Active energy glow line when moving */}
              <div
                className="absolute inset-0 rounded-full transition-opacity duration-300 bg-gradient-to-r from-blue-500 via-green-400 to-blue-500"
                style={{
                  opacity: isMoving ? 0.6 : 0,
                  filter: 'blur(1.5px)',
                }}
              />
            </div>

            {/* ─── THE TRAIN — positioned via CSS transition on transform ─── */}
            <div
              ref={trainRef}
              id="lab-desktop-train"
              className="absolute z-30 pointer-events-none"
              style={{
                position: 'absolute',
                zIndex: 30,
                top: 0,
                left: 0,
                width: `${DESKTOP_TRAIN_W}px`,
                height: `${DESKTOP_TRAIN_H}px`,
                pointerEvents: 'none',
                willChange: 'transform',
                transition: prefersReducedMotion ? 'none' : `transform ${duration}ms cubic-bezier(0.33, 1, 0.68, 1)`,
                transform: getTrainTransform(activeIndex),
              }}
              onTransitionRun={onTransitionRun}
              onTransitionStart={onTransitionStart}
              onTransitionEnd={onTransitionEnd}
              onTransitionCancel={onTransitionCancel}
            >
              <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
                <DesktopThreeCarTrain avatarConfig={DEFAULT_AVATAR} direction={direction} />
              </div>
            </div>

            {/* ─── Station Nodes Grid ─── */}
            <div className="relative z-10 grid grid-cols-6 gap-2" style={{ paddingTop: '50px' }}>
              {JOURNEY_STATIONS.map((station, idx) => {
                const isActive = activeIndex === idx;

                return (
                  <div key={station.id} className="flex flex-col items-center text-center relative">
                    <div
                      className="absolute w-[1.5px] border-l border-dashed border-slate-700 pointer-events-none z-0"
                      style={{ top: '-34px', height: '34px', left: '50%', transform: 'translateX(-50%)' }}
                    />
                    <button
                      onClick={() => handleStationChange(idx)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 relative z-10 shadow-md ${
                        isActive
                          ? 'bg-blue-600 border-blue-500 text-white scale-110 ring-4 ring-blue-900/50'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{station.icon}</span>
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {station.num}
                      </span>
                    </button>
                    <div className="mt-2">
                      <button
                        onClick={() => handleStationChange(idx)}
                        className={`text-[9px] font-bold uppercase tracking-wider block hover:text-blue-400 transition-colors ${
                          isActive ? 'text-blue-400' : 'text-slate-400'
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
        </div>

        {/* SÂN KHẤU CHUYỂN ĐỘNG MOBILE (Vertical Layout) */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
            SÂN KHẤU CHUYỂN ĐỘNG MOBILE (3 TOA DỌC)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* The vertical Mobile Rail Track */}
            <div
              ref={mobileTrackRef}
              className="md:col-span-1 relative py-4 pl-4 pr-24 bg-slate-950/60 rounded-xl border border-slate-800"
              style={{ minHeight: '320px' }}
            >
              {/* Vertical Rail Line */}
              <div
                className="absolute pointer-events-none z-0"
                style={{
                  right: '44px',
                  top: `${MOBILE_PADDING_Y}px`,
                  bottom: `${MOBILE_PADDING_Y}px`,
                  width: '4px',
                }}
              >
                <div className="absolute inset-0 rounded-full bg-slate-700 opacity-60" />
                <div
                  className="absolute inset-0 rounded-full transition-opacity duration-300 bg-gradient-to-b from-blue-500 via-green-400 to-blue-500"
                  style={{
                    opacity: isMoving ? 0.6 : 0,
                    filter: 'blur(1.5px)',
                  }}
                />
              </div>

              {/* Mobile Train */}
              <div
                ref={mobileTrainRef}
                id="lab-mobile-train"
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
                  transition: prefersReducedMotion ? 'none' : `transform ${duration}ms cubic-bezier(0.33, 1, 0.68, 1)`,
                  transform: getMobileTrainTransform(activeIndex),
                }}
              >
                <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
                  <MobileThreeCarTrain avatarConfig={DEFAULT_AVATAR} direction={direction} />
                </div>
              </div>

              {/* Station Dots Column */}
              <div className="space-y-4 relative z-10 flex flex-col justify-between h-[288px]">
                {JOURNEY_STATIONS.map((station, idx) => {
                  const isActive = activeIndex === idx;

                  return (
                    <div key={station.id} className="flex items-center justify-between h-8 relative">
                      <div
                        className="absolute h-[1.5px] border-t border-dashed border-slate-700 pointer-events-none z-0"
                        style={{ left: '28px', right: '28px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <div className="flex items-center space-x-2 bg-slate-950/80 pr-2 py-0.5 rounded-lg border border-slate-800/80">
                        <button
                          onClick={() => handleStationChange(idx)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 shadow-md ${
                            isActive
                              ? 'bg-blue-600 border-blue-500 text-white scale-105 ring-2 ring-blue-900/50'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="text-xs">{station.icon}</span>
                        </button>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{station.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick interactive test panel */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  🕹️ ĐIỀU KHIỂN & KIỂM THỬ NHANH
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStationChange(activeIndex === 0 ? 1 : activeIndex - 1)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold"
                  >
                    ⬅️ Ga trước
                  </button>
                  <button
                    onClick={() => handleStationChange(activeIndex === 5 ? 4 : activeIndex + 1)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold"
                  >
                    Ga tiếp theo ➡️
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      // Simulating adjacent clicks
                      handleStationChange(1);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300"
                  >
                    Test: Ga 1 ➔ Ga 2 (Lân cận)
                  </button>
                  <button
                    onClick={() => {
                      // Simulating long distance
                      handleStationChange(5);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300"
                  >
                    Test: Ga 1 ➔ Ga 6 (Đường dài)
                  </button>
                  <button
                    onClick={() => {
                      // Simulating rapid retarget
                      handleStationChange(1);
                      setTimeout(() => handleStationChange(3), 300);
                      setTimeout(() => handleStationChange(5), 700);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 col-span-2"
                  >
                    Test: Rapid clicks (Ga 2 ➔ 4 ➔ 6)
                  </button>
                </div>
                {prefersReducedMotion && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-2 rounded text-[10px] font-semibold text-center">
                    ⚠️ prefers-reduced-motion ĐANG BẬT: Tàu sẽ snap ngay lập tức, chỉ phát tín hiệu depart beep!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Event Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telemetry Panel */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">
              📊 THÔNG SỐ ĐO ĐẠC (TELEMETRY)
            </h3>
            <table className="w-full text-xs text-slate-300 space-y-2">
              <tbody>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">DOM Instance ID (Stable):</td>
                  <td className="text-right text-green-400 font-mono">{telemetry.domInstanceId}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition Run Count:</td>
                  <td className="text-right font-mono">{telemetry.runCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition Start Count:</td>
                  <td className="text-right font-mono text-blue-400">{telemetry.startCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition End Count:</td>
                  <td className="text-right font-mono text-emerald-400">{telemetry.endCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition Cancel Count:</td>
                  <td className="text-right font-mono text-red-400">{telemetry.cancelCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Target duration:</td>
                  <td className="text-right font-mono">{duration}ms</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Actual duration measured:</td>
                  <td className="text-right font-mono text-yellow-400">
                    {telemetry.lastDuration > 0 ? `${telemetry.lastDuration}ms` : '-'}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Starting transform:</td>
                  <td className="text-right text-[10px] font-mono max-w-[200px] truncate" title={telemetry.lastStartTransform}>
                    {telemetry.lastStartTransform}
                  </td>
                </tr>
                <tr className="py-2">
                  <td className="font-bold py-1.5">Ending transform:</td>
                  <td className="text-right text-[10px] font-mono max-w-[200px] truncate" title={telemetry.lastEndTransform}>
                    {telemetry.lastEndTransform}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Event Logs */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex flex-col h-[280px]">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">
              📜 NHẬT KÝ SỰ KIỆN (EVENT LOGS)
            </h3>
            <div className="flex-1 overflow-y-auto mt-2 space-y-1 font-mono text-[10px] text-slate-400 scrollbar-thin">
              {eventLogs.length === 0 ? (
                <div className="text-slate-500 italic p-2">Chưa có sự kiện nào được ghi nhận. Hãy click các ga ở trên để kiểm tra.</div>
              ) : (
                eventLogs.map((log, i) => (
                  <div key={i} className="border-b border-slate-800 pb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
