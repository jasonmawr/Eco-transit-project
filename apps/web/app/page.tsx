'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoutePlannerShell from '../components/RoutePlannerShell';
import WakeUpBanner from '../components/WakeUpBanner';
import EcoTransitHeader from '../components/EcoTransitHeader';
import HeroSection from '../components/HeroSection';
import StationExperience from '../components/StationExperience';
import TicketWalletSection from '../components/TicketWalletSection';
import RewardsSection from '../components/RewardsSection';
import AuthModal from '../components/AuthModal';
import AdminConsoleSection from '../components/AdminConsoleSection';
import CampaignHub from '../components/CampaignHub';
import XanhWrapSection from '../components/XanhWrapSection';
import GuidesSection from '../components/GuidesSection';
import { apiFetch } from '../lib/api';

const SCENE_ORDER = ['route', 'stations', 'tickets', 'rewards', 'xanhwrap', 'guides', 'admin'];

export default function Home() {
  const [apiState, setApiState] = useState<'connecting' | 'online' | 'error'>('connecting');
  const [elapsed, setElapsed] = useState(0);
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Scene Navigation state
  const [activeSection, setActiveSection] = useState<string>('route');
  const [direction, setDirection] = useState<number>(1);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (apiState === 'connecting') {
      timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [apiState]);

  const checkHealth = async () => {
    try {
      const data = await apiFetch('/healthz');
      setApiInfo(data);
      setApiState('online');
      
      // Fetch authenticated user info
      try {
        const meRes = await apiFetch('/api/auth/me');
        if (meRes && meRes.user) {
          setUser(meRes.user);
        }
      } catch (meErr) {
        // Ignored: default is unauthenticated
      }
    } catch (err) {
      console.warn('Backend API is sleeping or unreachable. Retrying...', err);
      setTimeout(checkHealth, 4000);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Detect responsive styling & accessibility requirements
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleReduceMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    mediaQuery.addEventListener('change', handleReduceMotionChange);
    return () => {
      window.removeEventListener('resize', checkViewport);
      mediaQuery.removeEventListener('change', handleReduceMotionChange);
    };
  }, []);

  // Hash/Query URL deep linking mechanism
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      const searchParams = new URLSearchParams(window.location.search);
      const queryScene = searchParams.get('scene');
      const targetScene = queryScene || hash;
      
      if (targetScene) {
        const oldMap: { [key: string]: string } = {
          planner: 'route',
          explore: 'stations',
          wallet: 'tickets'
        };
        const mapped = oldMap[targetScene] || targetScene;
        if (SCENE_ORDER.includes(mapped) && mapped !== activeSection) {
          const currentIdx = SCENE_ORDER.indexOf(activeSection);
          const newIdx = SCENE_ORDER.indexOf(mapped);
          setDirection(newIdx > currentIdx ? 1 : -1);
          setActiveSection(mapped);
        }
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, [activeSection]);

  const handleSectionSelect = (sectionId: string) => {
    const oldMap: { [key: string]: string } = {
      planner: 'route',
      explore: 'stations',
      wallet: 'tickets'
    };
    const mappedId = oldMap[sectionId] || sectionId;
    if (!SCENE_ORDER.includes(mappedId)) return;
    if (mappedId === activeSection) return;

    const currentIdx = SCENE_ORDER.indexOf(activeSection);
    const newIdx = SCENE_ORDER.indexOf(mappedId);
    setDirection(newIdx > currentIdx ? 1 : -1);
    setActiveSection(mappedId);

    // Update URL hash without forcing full page reload
    window.history.pushState(null, '', `#${mappedId}`);
  };

  const handleRetry = () => {
    setApiState('connecting');
    setElapsed(0);
    checkHealth();
  };

  // 3D paper page-flip transition settings
  const getVariants = (): any => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.35 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
      };
    }
    if (isMobile) {
      // Clean slide on mobile to prevent clipping/overflow issues
      return {
        initial: (dir: number) => ({
          x: dir > 0 ? '100%' : '-100%',
          opacity: 0
        }),
        animate: {
          x: 0,
          opacity: 1,
          transition: { duration: 0.45, ease: 'easeOut' }
        },
        exit: (dir: number) => ({
          x: dir > 0 ? '-100%' : '100%',
          opacity: 0,
          transition: { duration: 0.4, ease: 'easeIn' }
        })
      };
    }
    // High-performance premium 3D page flip (right-to-left on forward direction)
    return {
      initial: (dir: number) => ({
        rotateY: dir > 0 ? 80 : -80,
        opacity: 0,
        scale: 0.95,
        transformOrigin: dir > 0 ? 'right center' : 'left center',
      }),
      animate: {
        rotateY: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo
        }
      },
      exit: (dir: number) => ({
        rotateY: dir > 0 ? -80 : 80,
        opacity: 0,
        scale: 0.95,
        transformOrigin: dir > 0 ? 'left center' : 'right center',
        transition: {
          duration: 0.65,
          ease: [0.16, 1, 0.3, 1]
        }
      })
    };
  };

  if (apiState === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-eco-soft text-eco-ink">
        <WakeUpBanner elapsed={elapsed} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen flex flex-col eco-mesh-bg font-inter overflow-hidden relative">
      
      {/* Premium Navigation Header */}
      <EcoTransitHeader activeSection={activeSection} onSectionSelect={handleSectionSelect} />

      {/* Main Content Container */}
      <main className="flex-grow flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 overflow-hidden">
        
        {/* Campaign Journey Map Hub */}
        <CampaignHub activeSection={activeSection} onSectionSelect={handleSectionSelect} />

        {/* Scene viewport container (perspective boundary) */}
        <div
          id="scene-viewport"
          className="flex-1 min-h-0 my-2 relative bg-white/80 backdrop-blur-md border border-eco-mint rounded-3xl shadow-lg p-4 sm:p-6 overflow-hidden flex flex-col"
          style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
        >
          {/* Subtle page creases overlay */}
          {!isMobile && !prefersReducedMotion && (
            <>
              <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/[0.02] to-transparent pointer-events-none z-30 rounded-l-3xl" />
              <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/[0.02] to-transparent pointer-events-none z-30 rounded-r-3xl" />
            </>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              custom={direction}
              variants={getVariants()}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full relative overflow-y-auto pr-1 no-scrollbar flex flex-col"
              style={{
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
              }}
            >
              {activeSection === 'route' && (
                <div className="space-y-6 flex-grow flex flex-col">
                  {/* Hero Section embedded inside Route Scene */}
                  <HeroSection onSectionSelect={handleSectionSelect} />
                  <RoutePlannerShell onStationSelect={setSelectedStationId} />
                </div>
              )}
              {activeSection === 'stations' && (
                <StationExperience
                  selectedStationId={selectedStationId}
                  onStationSelect={setSelectedStationId}
                  user={user}
                  onLoginClick={() => setIsAuthOpen(true)}
                />
              )}
              {activeSection === 'tickets' && (
                <TicketWalletSection user={user} onLoginClick={() => setIsAuthOpen(true)} />
              )}
              {activeSection === 'rewards' && (
                <RewardsSection user={user} onLoginClick={() => setIsAuthOpen(true)} />
              )}
              {activeSection === 'xanhwrap' && (
                <XanhWrapSection />
              )}
              {activeSection === 'guides' && (
                <GuidesSection />
              )}
              {activeSection === 'admin' && (
                !(user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
                    <div className="text-4xl animate-bounce">🔒</div>
                    <h3 className="text-base font-black text-eco-ink uppercase tracking-wider font-display-campaign">
                      Khu vực hạn chế
                    </h3>
                    <p className="text-xs text-eco-muted font-semibold max-w-sm leading-relaxed">
                      Bạn cần quyền Kiểm duyệt viên hoặc Quản trị viên để mở khu vực này.
                    </p>
                    <button
                      onClick={() => handleSectionSelect('route')}
                      className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-eco-primary hover:bg-eco-primaryDeep rounded-xl shadow-sm transition-all duration-200"
                    >
                      Quay lại Lộ trình
                    </button>
                  </div>
                ) : (
                  <AdminConsoleSection user={user} onLoginClick={() => setIsAuthOpen(true)} />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mini status bar footer */}
      <footer className="bg-eco-ink text-white py-1.5 border-t border-eco-primary/10 relative z-10 shrink-0 text-center text-[10px] text-eco-muted">
        &copy; 2026 Lướt Khói Chạm Xanh. Vận hành bởi EcoTransit.
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          window.location.reload();
        }}
      />

    </div>
  );
}
