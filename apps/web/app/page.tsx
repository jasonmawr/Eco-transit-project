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

const SCENE_ORDER = ['route', 'stations', 'tickets', 'rewards', 'xanhwrap', 'guides'];

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
    <div className="min-h-screen flex flex-col justify-between eco-mesh-bg font-inter" style={{ overflowX: 'hidden' }}>
      
      {/* Premium Navigation Header */}
      <EcoTransitHeader onSectionSelect={handleSectionSelect} />

      {/* Main Content Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Storytelling Hero Section */}
        <HeroSection onSectionSelect={handleSectionSelect} />

        {/* Campaign Journey Map Hub */}
        <CampaignHub activeSection={activeSection} onSectionSelect={handleSectionSelect} />

        {/* Scene viewport container (perspective boundary) */}
        <div
          id="scene-viewport"
          className="scroll-mt-20 my-10 relative bg-white/80 backdrop-blur-md border border-eco-mint rounded-3xl shadow-lg p-6 sm:p-8 overflow-hidden min-h-[550px]"
          style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
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
              className="w-full relative overflow-y-auto max-h-[72vh] min-h-[500px] pr-2 scroll-smooth"
              style={{
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
              }}
            >
              {activeSection === 'route' && (
                <RoutePlannerShell onStationSelect={setSelectedStationId} />
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Moderator / Admin Console Panel */}
        {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
          <section id="admin-console" className="scroll-mt-20 bg-white/80 backdrop-blur-md border border-eco-mint p-6 sm:p-8 rounded-3xl shadow-lg mb-10 animate-fade-in">
            <AdminConsoleSection user={user} onLoginClick={() => setIsAuthOpen(true)} />
          </section>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="bg-eco-ink text-white py-8 border-t border-eco-primary/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:flex md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-1.5 justify-center md:justify-start">
              <span className="text-base font-black tracking-tight text-white uppercase font-display-campaign">
                Lướt Khói
              </span>
              <span className="text-base font-black tracking-tight text-eco-accentGreen uppercase font-display-campaign">
                Chạm Xanh
              </span>
            </div>
            <p className="text-[10px] text-eco-muted mt-1">Nền tảng di chuyển công cộng thông minh & bền vững. Vận hành bởi EcoTransit.</p>
          </div>
          <div className="text-[10px] text-eco-muted md:text-right mt-2 md:mt-0">
            &copy; 2026 Lướt Khói Chạm Xanh. Vận hành dưới dạng campaign wordmark tạm thời.
          </div>
        </div>
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
