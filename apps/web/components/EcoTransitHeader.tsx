'use client';

import React, { useState, useEffect } from 'react';
import { NavHeader } from './ui/nav-header';
import AuthModal from './AuthModal';
import { apiFetch } from '../lib/api';

interface EcoTransitHeaderProps {
  activeSection: string;
  onSectionSelect?: (sectionId: string) => void;
}

export default function EcoTransitHeader({ activeSection, onSectionSelect }: EcoTransitHeaderProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
 
  const triggerUpcoming = (feature: string) => {
    setShowTooltip(feature);
    setTimeout(() => setShowTooltip(null), 3000);
  };
 
  // Check login state on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Ignored: unauthenticated user is default state
      }
    };
    checkUser();
  }, []);
 
  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Reload page or refresh states to update reviews and UI
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
 
  const handleAuthSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    // Reload page to refresh all authenticated fetch states across components
    window.location.reload();
  };
 
  const navItems = [
    { label: 'Lộ trình', targetId: 'route' },
    { label: 'Khám phá', targetId: 'stations' },
    { label: 'Tích điểm', targetId: 'tickets' },
    { label: 'Đổi thưởng', targetId: 'rewards' },
    { label: 'XanhWrap', targetId: 'xanhwrap' },
    { label: 'Cẩm nang', targetId: 'guides' },
  ];

  if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
    navItems.push({ label: 'Admin', targetId: 'admin' });
  }

  return (
    <>
      <header className="glass-header shrink-0 h-16 z-50 bg-white/80 backdrop-blur-md border-b border-eco-primary/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Name (Lướt Khói Chạm Xanh) */}
          <div className="flex items-center space-x-2 select-none shrink-0">
            <div className="flex flex-col items-start leading-none py-1">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="text-xs sm:text-base md:text-lg font-black tracking-tight text-eco-primary uppercase font-display-campaign whitespace-nowrap">
                  Lướt Khói
                </span>
                <span className="text-xs sm:text-base md:text-lg font-black tracking-tight text-eco-accentGreen uppercase font-display-campaign whitespace-nowrap">
                  Chạm Xanh
                </span>
                <span className="hidden lg:inline-block text-[8px] text-eco-muted font-bold tracking-wider bg-eco-mint px-1.5 py-0.5 rounded border border-eco-primary/10">
                  EcoTransit
                </span>
              </div>
              <span className="hidden lg:inline-block text-[7px] sm:text-[8px] text-eco-muted/50 tracking-wider font-semibold">
                Chiến dịch giao thông xanh TP.HCM
              </span>
            </div>
          </div>

          {/* Navigation items (Scrollable Navigation Rail) */}
          <div className="flex-1 min-w-0 mx-1.5 sm:mx-3 h-full flex items-center relative">
            <NavHeader items={navItems} activeSection={activeSection} onUpcomingClick={triggerUpcoming} onItemClick={onSectionSelect} />
          </div>

          {/* CTAs (Responsive sizing to avoid 390px overflow) */}
          <div className="flex items-center space-x-1 sm:space-x-2 relative shrink-0">
            <button
              onClick={() => {
                if (onSectionSelect) {
                  onSectionSelect('tickets');
                }
              }}
              className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-[9px] sm:text-xs font-bold text-eco-primary bg-eco-mint border border-eco-primary/20 rounded-full hover:bg-eco-primary hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              🎫 Vé xanh
            </button>
            
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="hidden xl:inline-block text-[10px] sm:text-xs font-semibold text-eco-muted bg-eco-bgBeige px-2 py-1 rounded-full border border-eco-primary/5 whitespace-nowrap">
                  👤 Đã đăng nhập
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1.5 sm:px-3.5 sm:py-1.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-eco-primary bg-eco-mint hover:bg-eco-primary hover:text-white rounded-full shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-2 py-1.5 sm:px-3.5 sm:py-1.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-white bg-eco-primary hover:bg-eco-primaryDeep rounded-full shadow-sm transition-all duration-200 whitespace-nowrap"
              >
                Đăng nhập
              </button>
            )}

            {/* Alert Tooltip for Upcoming features */}
            {showTooltip && (
              <div className="absolute right-0 top-12 p-3 bg-eco-ink text-white text-[11px] font-bold rounded-xl shadow-lg border border-white/10 animate-fade-in z-50 max-w-xs whitespace-nowrap">
                ✨ {showTooltip} (Sắp ra mắt ở các Batch sau!)
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth modal overlay */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

