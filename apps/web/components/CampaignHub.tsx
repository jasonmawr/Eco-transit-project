'use client';

import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { AvatarSvg, AvatarConfig } from './ui/AvatarSvg';
import AvatarCustomizerModal from './AvatarCustomizerModal';
import { normalizeAvatarConfig } from '../lib/avatarNormalizer';
import MetroRailStage from './MetroRailStage';

// Illustrated presets
export const CHARACTERS = [
  { id: 'student', name: 'Bạn học xanh', desc: 'Đại diện thế hệ trẻ năng động đi học bằng xe buýt điện, VinBus và Metro.' },
  { id: 'office', name: 'Dân văn phòng xanh', desc: 'Tránh kẹt xe giờ cao điểm, thảnh thơi lướt tin tức, đi làm xanh và thanh thản.' },
  { id: 'explorer', name: 'Người khám phá thành phố', desc: 'Săn tìm các địa điểm ẩm thực, quán cafe chill xung quanh các ga tàu điện.' },
  { id: 'commuter', name: 'Người đạp xe xanh', desc: 'Thành viên phong trào xe đạp, liên kết xe buýt điện bảo vệ môi trường.' },
  { id: 'hunter', name: 'Người săn ưu đãi xanh', desc: 'Tích lũy điểm xanh hành trình để đổi lấy quà tặng voucher Highlands/Phúc Long.' },
];

interface CampaignHubProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  user?: any;
  onLoginClick?: () => void;
}

export default function CampaignHub({ activeSection, onSectionSelect, user, onLoginClick }: CampaignHubProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string>('student');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(user);

  // Layout collapsed state & defer collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingCollapse, setPendingCollapse] = useState(false);
  const [trainIsMoving, setTrainIsMoving] = useState(false);

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
    }
  }, [user]);

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

  const handleCollapseToggle = () => {
    if (isCollapsed) {
      // Expanding is always immediate
      setIsCollapsed(false);
      setPendingCollapse(false);
    } else {
      // Collapsing
      if (trainIsMoving) {
        // Defer collapse until the current transition completes
        setPendingCollapse(true);
      } else {
        // Collapse immediately if train is idle
        setIsCollapsed(true);
      }
    }
  };

  const handleMovingStateChange = (moving: boolean) => {
    setTrainIsMoving(moving);
    if (!moving && pendingCollapse) {
      // If motion stopped and we have a pending collapse, execute it now!
      setIsCollapsed(true);
      setPendingCollapse(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white/80 border border-eco-mint p-3 rounded-3xl shadow-md mb-1 min-h-[80px] flex items-center justify-center">
        <p className="text-xs text-eco-muted font-bold">Đang tải bản đồ hành trình...</p>
      </div>
    );
  }

  const collapseBtnText = isCollapsed ? 'Mở rộng' : (pendingCollapse ? 'Đang thu gọn...' : 'Thu gọn');

  return (
    <div className="relative z-40 bg-white/95 border border-eco-mint p-1.5 sm:p-2 rounded-2xl shadow-md mb-1 flex-shrink-0">
      {/* Decorative ambient lights wrapper */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-eco-accentGreen/5 blur-2xl rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-eco-primary/5 blur-2xl rounded-full" />
      </div>

      {/* Render the clean, permanently mounted MetroRailStage */}
      <MetroRailStage
        activeSection={activeSection}
        onSectionSelect={onSectionSelect}
        avatarConfig={getUserAvatarConfig(selectedChar)}
        isCollapsed={isCollapsed}
        onMovingStateChange={handleMovingStateChange}
        title={
          <>
            <div className="hidden sm:block">
              <h2 className="text-[10px] sm:text-xs font-black text-eco-ink tracking-tight font-display-campaign uppercase font-bold flex items-center gap-1.5">
                <span>🗺️ HÀNH TRÌNH LƯỚT KHÓI CHẠM XANH</span>
              </h2>
            </div>
            <div className="sm:hidden flex flex-col">
              <span className="text-[10px] font-extrabold text-eco-ink uppercase font-black">6 chặng lướt xanh</span>
            </div>
            <button
              onClick={handleCollapseToggle}
              className="text-[9px] sm:text-[10px] font-black text-eco-primary hover:text-eco-primaryDeep bg-eco-mint border border-eco-primary/10 px-1.5 py-0.5 rounded-lg shadow-xs transition-colors flex items-center focus:outline-none focus:ring-1 focus:ring-eco-primary cursor-pointer"
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Mở rộng bản đồ hành trình" : "Thu gọn bản đồ hành trình"}
            >
              {collapseBtnText}
            </button>
          </>
        }
        headerRight={
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
            className="flex items-center space-x-1 bg-eco-mint hover:bg-eco-primary hover:text-white border border-eco-primary/20 px-1.5 py-0.5 rounded-xl transition-all duration-200 group text-left shadow-xs cursor-pointer"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <AvatarSvg config={getUserAvatarConfig(selectedChar)} />
            </div>
            <div className="leading-none">
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[7px] text-eco-muted group-hover:text-white/80 font-bold uppercase tracking-wider">
                Đồng hành <Edit2 className="w-2 h-2" />
              </span>
              <span className="text-[8px] sm:text-[10px] font-black text-eco-ink group-hover:text-white block font-bold">
                {getCharName(selectedChar)}
              </span>
            </div>
          </button>
        }
      />

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
