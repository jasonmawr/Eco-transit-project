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

  // Layout collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <div className="relative" style={{ paddingRight: '160px' }}> {/* Reserve space for Sound Toggle inside RailStage */}
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

      {/* Render the clean, decoupled MetroRailStage components */}
      {!isCollapsed && (
        <MetroRailStage
          activeSection={activeSection}
          onSectionSelect={onSectionSelect}
          avatarConfig={getUserAvatarConfig(selectedChar)}
        />
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
