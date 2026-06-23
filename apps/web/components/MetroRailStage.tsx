'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AvatarSvg, AvatarConfig } from './ui/AvatarSvg';
import { useMetroTravelSound } from '../lib/useMetroTravelSound';

const JOURNEY_STATIONS = [
  { id: 'route', name: 'Lập lộ trình xanh', num: 1, desc: 'Lập lộ trình tối ưu', icon: '🛤️' },
  { id: 'stations', name: 'Khám phá ga', num: 2, desc: 'Khám phá nhà ga & Địa điểm', icon: '🚉' },
  { id: 'tickets', name: 'Tích điểm vé xanh', num: 3, desc: 'Nhật ký tích điểm vé', icon: '🎫' },
  { id: 'rewards', name: 'Đổi thưởng', num: 4, desc: 'Danh mục đổi thưởng', icon: '🎁' },
  { id: 'xanhwrap', name: 'XanhWrap / Chia sẻ', num: 5, desc: 'Tạo thẻ chia sẻ XanhWrap', icon: '✨' },
  { id: 'guides', name: 'Cẩm nang lướt xanh', num: 6, desc: 'Mẹo & Cẩm nang xanh', icon: '📖' },
];

interface MetroRailStageProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  avatarConfig: AvatarConfig;
}

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
        <rect data-testid="desktop-carriage" x="2" y="2" width="40" height="24" rx="6" fill="url(#train-grad-live)" stroke="#0A1118" strokeWidth="2.5" />
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
        <rect data-testid="desktop-carriage" x="46" y="2" width="40" height="24" rx="6" fill="url(#train-grad-live)" stroke="#0A1118" strokeWidth="2.5" />
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
        <rect data-testid="desktop-carriage" x="90" y="2" width="40" height="24" rx="6" fill="url(#train-grad-live)" stroke="#0A1118" strokeWidth="2.5" />
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
          <linearGradient id="train-grad-live" x1="0" y1="0" x2="0" y2="1">
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
        <rect data-testid="mobile-carriage" x="2" y="2" width="26" height="18" rx="4" fill="url(#train-grad-mobile-live)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="2" y="11" width="26" height="2" fill="#9FCE1A" />
        <rect x="6" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="10" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="20" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Connector 2 */}
        <rect x="28" y="9" width="4" height="4" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />

        {/* Carriage 2 (Middle) */}
        <rect data-testid="mobile-carriage" x="32" y="2" width="26" height="18" rx="4" fill="url(#train-grad-mobile-live)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="32" y="11" width="26" height="2" fill="#9FCE1A" />
        <rect x="36" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="40" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="50" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        {/* Connector 1 */}
        <rect x="58" y="9" width="4" height="4" fill="#4B5E70" stroke="#0A1118" strokeWidth="1" />

        {/* Carriage 1 (Front Cab) */}
        <rect data-testid="mobile-carriage" x="62" y="2" width="26" height="18" rx="4" fill="url(#train-grad-mobile-live)" stroke="#0A1118" strokeWidth="1.5" />
        <rect x="62" y="11" width="20" height="2" fill="#9FCE1A" />
        {/* Windshield */}
        <path d="M 78,5 L 86,5 Q 87,5 87,7 L 83,12 L 75,12 Z" fill="#0A1118" stroke="#0A1118" strokeWidth="0.8" />
        <path d="M 79,6 L 85,6 L 83,11 L 77,11 Z" fill="#38BDF8" opacity="0.8" />
        {/* Passenger window for Avatar */}
        <rect x="66" y="5" width="8" height="7" rx="1" fill="#0F172A" stroke="#0A1118" strokeWidth="0.8" />
        <circle cx="70" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />
        <circle cx="80" cy="22" r="2.5" fill="#1E293B" stroke="#0A1118" strokeWidth="1" />

        <defs>
          <linearGradient id="train-grad-mobile-live" x1="0" y1="0" x2="0" y2="1">
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

export default function MetroRailStage({ activeSection, onSectionSelect, avatarConfig }: MetroRailStageProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  const [prevIndex, setPrevIndex] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  const [containerWidth, setContainerWidth] = useState(0);
  const [mobileContainerHeight, setMobileContainerHeight] = useState(0);

  const desktopTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const trainRef = useRef<HTMLDivElement | null>(null);
  
  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Travel sound hook
  const { soundEnabled, toggleSound, playJourneySound, stopJourneySound } = useMetroTravelSound();

  const activeIndex = Math.max(0, JOURNEY_STATIONS.findIndex((s) => s.id === activeSection));

  useEffect(() => {
    setMounted(true);

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
      
      const t = setTimeout(handleResize, 150);
      return () => {
        window.removeEventListener('resize', handleResize);
        mediaQuery.removeEventListener('change', handler);
        clearTimeout(t);
      };
    }
  }, []);

  const handleStationClick = (sectionId: string, targetIdx: number) => {
    if (targetIdx === activeIndex) return;

    if (movingTimerRef.current) {
      clearTimeout(movingTimerRef.current);
      movingTimerRef.current = null;
    }

    setPrevIndex(activeIndex);
    setDirection(targetIdx > activeIndex ? 'right' : 'left');

    const duration = getTransitionDuration(activeIndex, targetIdx);

    // Call state update in parent
    onSectionSelect(sectionId);

    if (prefersReducedMotion) {
      setIsMoving(false);
      
      // Play departure beep only
      const departure = new Audio('/audio/metro-departure.mp3');
      departure.volume = 0.25;
      if (soundEnabled) {
        departure.play().catch(() => {});
      }
    } else {
      setIsMoving(true);
      playJourneySound();

      movingTimerRef.current = setTimeout(() => {
        setIsMoving(false);
        stopJourneySound(true);
      }, duration);
    }
  };

  useEffect(() => {
    // Keep prevIndex aligned with activeIndex if updated externally
    setPrevIndex(activeIndex);
  }, [activeIndex]);

  const getTransitionDuration = (fromIdx: number, toIdx: number): number => {
    const gap = Math.abs(toIdx - fromIdx);
    if (gap === 0) return 1400;
    if (gap === 1) return 1600; // Adjacent: 1.6s
    if (gap <= 3) return 1950;  // 2-3 stations: 1.95s
    return 2300;                // 4-5 stations: 2.3s
  };

  const duration = getTransitionDuration(prevIndex, activeIndex);

  // Geometric constants
  const DESKTOP_TRAIN_W = 132;
  const DESKTOP_TRAIN_H = 40;
  const DESKTOP_RAIL_LANE_CENTER_Y = 16; // Placed at top
  const DESKTOP_PADDING_X = 16; 

  const MOBILE_TRAIN_W = 90;
  const MOBILE_TRAIN_H = 32;
  const MOBILE_PADDING_Y = 12;

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
    const tx = -10; // small offset from right edge
    const ty = cy - MOBILE_TRAIN_H / 2;
    return `translate3d(${tx}px, ${ty}px, 0)`;
  };

  if (!mounted) {
    return (
      <div className="bg-white/80 border border-eco-mint p-3 rounded-3xl shadow-md mb-1 min-h-[80px] flex items-center justify-center">
        <p className="text-xs text-eco-muted font-bold">Đang tải bản đồ hành trình...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full z-10 select-none">
      {/* 🔊 Vietnamese Sound Toggle Control - absolutely positioned in the corner */}
      <div className="absolute -top-10 right-0 z-50">
        <button
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label="Bật/Tắt âm thanh hành trình"
          className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-eco-primary ${
            soundEnabled
              ? 'bg-eco-mint text-eco-primary border-eco-primary/20 hover:bg-eco-primary hover:text-white'
              : 'bg-slate-100 text-gray-400 border-gray-200 hover:border-gray-300'
          }`}
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
          <span>Âm thanh hành trình: {soundEnabled ? 'Bật' : 'Tắt'}</span>
        </button>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <div
        ref={desktopTrackRef}
        data-testid="desktop-track"
        className="hidden sm:block relative py-1.5 px-2 z-10"
        style={{ position: 'relative', minHeight: '76px' }}
      >
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

        {/* Rail track line */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            top: `${DESKTOP_RAIL_LANE_CENTER_Y}px`,
            left: `${DESKTOP_PADDING_X}px`,
            right: `${DESKTOP_PADDING_X}px`,
            height: '3px',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #4B5E70 0%, #64748B 50%, #4B5E70 100%)',
              opacity: 0.25,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(75,94,112,0.15) 18px, rgba(75,94,112,0.15) 20px)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, #0066FF, #9FCE1A, #0066FF)',
              opacity: isMoving ? 0.4 : 0,
              filter: 'blur(2px)',
            }}
          />
        </div>

        {/* Train Visual (transform-only transition) */}
        <div
          ref={trainRef}
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
            transition: prefersReducedMotion ? 'none' : `transform ${duration}ms cubic-bezier(0.33, 1, 0.68, 1)`,
            transform: getTrainTransform(activeIndex),
          }}
        >
          <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
            <DesktopThreeCarTrain avatarConfig={avatarConfig} direction={direction} />
          </div>
        </div>

        {/* Station Nodes Grid */}
        <div className="relative z-10 grid grid-cols-6 gap-1" style={{ paddingTop: '36px' }}>
          {JOURNEY_STATIONS.map((station, idx) => {
            const isActive = activeSection === station.id;

            return (
              <div key={station.id} className="flex flex-col items-center text-center relative" style={{ paddingTop: '6px' }}>
                <div
                  className="absolute w-[1.5px] border-l-2 border-dashed border-eco-primary/20 pointer-events-none z-0"
                  style={{ top: '-23px', height: '23px', left: '50%', transform: 'translateX(-50%)' }}
                />
                <button
                  onClick={() => handleStationClick(station.id, idx)}
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
                <div className="mt-0.5 space-y-0">
                  <button
                    onClick={() => handleStationClick(station.id, idx)}
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

      {/* ─── MOBILE VIEW ─── */}
      <div
        ref={mobileTrackRef}
        data-testid="mobile-track"
        className="sm:hidden relative pl-6 pr-24 py-1.5 z-10"
        style={{ position: 'relative' }}
      >
        {/* Rail Line */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            right: '52px',
            top: `${MOBILE_PADDING_Y}px`,
            bottom: `${MOBILE_PADDING_Y}px`,
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

        {/* Mobile Train Wrapper */}
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
            transition: prefersReducedMotion ? 'none' : `transform ${duration}ms cubic-bezier(0.33, 1, 0.68, 1)`,
            transform: getMobileTrainTransform(activeIndex),
          }}
        >
          <div className={`train-visual-container ${isMoving ? 'is-moving' : 'is-idle'}`}>
            <MobileThreeCarTrain avatarConfig={avatarConfig} direction={direction} />
          </div>
        </div>

        {/* Vertical list of Stations */}
        <div className="space-y-3 relative z-10">
          {JOURNEY_STATIONS.map((station, idx) => {
            const isActive = activeSection === station.id;

            return (
              <div key={station.id} className="flex items-center justify-between relative h-10">
                <div
                  className="absolute h-[1.5px] border-t-2 border-dashed border-eco-primary/20 pointer-events-none z-0"
                  style={{ left: '28px', right: '36px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <div className="flex items-center space-x-2 relative z-10 bg-white/95 pr-2 rounded-r-xl">
                  <button
                    onClick={() => handleStationClick(station.id, idx)}
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
                  <div className="flex-grow pl-0.5">
                    <button
                      onClick={() => handleStationClick(station.id, idx)}
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
    </div>
  );
}
