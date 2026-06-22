'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { AvatarSvg, AvatarConfig } from './ui/AvatarSvg';
import { apiFetch } from '../lib/api';
import { normalizeAvatarConfig } from '../lib/avatarNormalizer';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaveSuccess?: (updatedUser: any) => void;
}

const PRESETS = [
  {
    id: 'student',
    name: 'Bạn học xanh',
    desc: 'Học sinh/Sinh viên năng động đi học bằng xe buýt điện, VinBus và Metro.',
    config: {
      characterId: 'student',
      hairStyle: 'short',
      hairColor: 'default',
      outfitStyle: 'casual',
      outfitColor: 'electricBlue',
      accessory: 'backpack'
    } as AvatarConfig
  },
  {
    id: 'office',
    name: 'Dân văn phòng xanh',
    desc: 'Dân công sở thảnh thơi lướt di động trên tàu điện đi làm, tránh kẹt xe.',
    config: {
      characterId: 'office',
      hairStyle: 'curly',
      hairColor: 'default',
      outfitStyle: 'formal',
      outfitColor: 'electricBlue',
      accessory: 'glasses'
    } as AvatarConfig
  },
  {
    id: 'explorer',
    name: 'Người khám phá thành phố',
    desc: 'Bạn trẻ săn tìm quán cafe, địa điểm ăn uống chill quanh các ga Metro.',
    config: {
      characterId: 'explorer',
      hairStyle: 'long',
      hairColor: 'beige',
      outfitStyle: 'casual',
      outfitColor: 'urbanBeige',
      accessory: 'headphones'
    } as AvatarConfig
  },
  {
    id: 'commuter',
    name: 'Người đạp xe xanh',
    desc: 'Thành viên phong trào xe đạp, liên kết xe buýt điện bảo vệ môi trường.',
    config: {
      characterId: 'commuter',
      hairStyle: 'cap',
      hairColor: 'default',
      outfitStyle: 'sporty',
      outfitColor: 'vibrantGreen',
      accessory: 'none'
    } as AvatarConfig
  },
  {
    id: 'hunter',
    name: 'Người săn ưu đãi xanh',
    desc: 'Năng nổ tích lũy điểm xanh để quy đổi đặc quyền voucher Highlands/Phúc Long.',
    config: {
      characterId: 'hunter',
      hairStyle: 'curly',
      hairColor: 'green',
      outfitStyle: 'sporty',
      outfitColor: 'vibrantGreen',
      accessory: 'headphones'
    } as AvatarConfig
  }
];

export default function AvatarCustomizerModal({ isOpen, onClose, user, onSaveSuccess }: AvatarCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'hair' | 'outfit' | 'accessory'>('preset');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Current config state
  const [config, setConfig] = useState<AvatarConfig>({
    characterId: 'student',
    hairStyle: 'short',
    hairColor: 'default',
    outfitStyle: 'casual',
    outfitColor: 'electricBlue',
    accessory: 'backpack'
  });

  // Hydrate user config on load
  useEffect(() => {
    if (user && user.avatarConfig) {
      setConfig(normalizeAvatarConfig(user.avatarConfig));
    } else {
      // Look up saved in localStorage
      const savedChar = localStorage.getItem('ecotransit_character');
      const matchedPreset = PRESETS.find(p => p.id === savedChar);
      if (matchedPreset) {
        setConfig({ ...matchedPreset.config });
      } else {
        setConfig(normalizeAvatarConfig(null));
      }
    }
  }, [user, isOpen]);

  // Handle preset card click
  const selectPreset = (preset: typeof PRESETS[0]) => {
    setConfig({ ...preset.config });
  };

  // Generic option updates
  const updateOption = (field: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save via PATCH /api/auth/avatar
  const handleSave = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch('/api/auth/avatar', {
        method: 'PATCH',
        body: JSON.stringify(config)
      });
      
      // Update localStorage fallback
      localStorage.setItem('ecotransit_character', config.characterId);
      
      if (onSaveSuccess) {
        // Trigger parent state update
        onSaveSuccess(res.avatarConfig);
      }
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi lưu thông tin nhân vật lên máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-eco-primary/10 overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[500px] max-h-[90vh]">
        
        {/* LEFT PANEL: Live Preview Card (Grid Span 5) */}
        <div className="md:col-span-5 bg-gradient-to-b from-eco-soft via-white to-eco-bgBeige/40 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
          <div className="text-center mb-4">
            <span className="text-[10px] font-black tracking-widest text-eco-primary uppercase bg-eco-mint px-2.5 py-1 rounded-full">
              XEM TRƯỚC NHÂN VẬT
            </span>
            <h4 className="text-xs font-black text-eco-ink uppercase mt-2">
              Nhân vật di chuyển xanh
            </h4>
          </div>

          {/* Large interactive SVG container */}
          <div className="w-48 h-48 md:w-56 md:h-56 p-4 bg-white border border-eco-primary/5 rounded-full shadow-lg relative flex items-center justify-center animate-pulse-glow">
            <AvatarSvg config={config} size="100%" />
            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-eco-ink text-white text-[9px] font-mono px-3 py-1 rounded-full border border-white/20 uppercase shadow">
              @{PRESETS.find(p => p.id === config.characterId)?.name || 'Hành khách'}
            </div>
          </div>

          <p className="text-[10px] text-eco-muted font-medium text-center mt-6 max-w-xs leading-relaxed">
            🌿 Thiết kế phong cách vector tối giản, phối màu đô thị Electric Blue / Vibrant Green / Urban Beige thân thiện.
          </p>
        </div>

        {/* RIGHT PANEL: Customizer Options & Tabs (Grid Span 7) */}
        <div className="md:col-span-7 p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Customizer Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4 shrink-0">
            <div>
              <h3 className="text-base font-black text-eco-ink uppercase tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-eco-primary" /> Thiết lập nhân vật của bạn
              </h3>
              <p className="text-[10px] text-eco-muted mt-0.5">Tùy biến ngoại hình đồng hành cùng bạn trên chặng hành trình</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-eco-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customizer Option Category Tabs */}
          <div className="flex space-x-1 p-1 bg-eco-soft border border-eco-primary/5 rounded-2xl shrink-0 mb-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'preset', label: 'Preset' },
              { id: 'hair', label: 'Kiểu Tóc' },
              { id: 'outfit', label: 'Trang Phục' },
              { id: 'accessory', label: 'Phụ Kiện' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-eco-primary text-white shadow-sm'
                    : 'text-eco-muted hover:text-eco-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Options Content Scroll View */}
          <div className="flex-grow overflow-y-auto pr-1 space-y-4 mb-4">
            
            {/* Presets Tab content */}
            {activeTab === 'preset' && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-eco-muted uppercase tracking-wider block">Chọn Preset Nền</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {PRESETS.map((preset) => {
                    const isSelected = config.characterId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => selectPreset(preset)}
                        className={`w-full flex items-start space-x-3 p-3 rounded-2xl text-left border transition-all duration-150 ${
                          isSelected
                            ? 'border-eco-primary bg-eco-mint/50 shadow-sm'
                            : 'border-gray-100 hover:bg-eco-soft/40'
                        }`}
                      >
                        <div className="w-12 h-12 bg-white rounded-full shrink-0 border border-gray-100 overflow-hidden flex items-center justify-center">
                          <AvatarSvg config={preset.config} size="100%" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-black text-eco-ink">{preset.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-eco-primary shrink-0" />}
                          </div>
                          <p className="text-[10px] text-eco-muted leading-relaxed font-semibold">{preset.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hair Style & Color Options */}
            {activeTab === 'hair' && (
              <div className="space-y-5">
                {/* Hair styles */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-eco-muted uppercase tracking-wider block">Dáng tóc</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'short', name: 'Ngắn gọn' },
                      { id: 'long', name: 'Tóc dài' },
                      { id: 'curly', name: 'Tóc xoăn' },
                      { id: 'cap', name: 'Đội mũ' }
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => updateOption('hairStyle', style.id)}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border text-center transition-all ${
                          config.hairStyle === style.id
                            ? 'border-eco-primary bg-eco-mint text-eco-primary'
                            : 'border-gray-200 text-eco-muted hover:border-eco-primary/30'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair colors */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-eco-muted uppercase tracking-wider block">Màu sắc tóc</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'default', name: 'Đen charcoal', color: '#0A1118' },
                      { id: 'blue', name: 'Xanh Blue', color: '#0066FF' },
                      { id: 'green', name: 'Xanh Mint', color: '#9FCE1A' },
                      { id: 'beige', name: 'Nâu Beige', color: '#D97706' }
                    ].map(color => (
                      <button
                        key={color.id}
                        onClick={() => updateOption('hairColor', color.id)}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                          config.hairColor === color.id
                            ? 'border-eco-primary bg-eco-mint text-eco-primary'
                            : 'border-gray-200 text-eco-muted hover:border-eco-primary/30'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color.color }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Outfit Style & Color Options */}
            {activeTab === 'outfit' && (
              <div className="space-y-5">
                {/* Outfit Style */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-eco-muted uppercase tracking-wider block">Dáng trang phục</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'casual', name: 'Áo T-shirt' },
                      { id: 'formal', name: 'Áo Sơ mi V' },
                      { id: 'sporty', name: 'Áo Khoác Zip' }
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => updateOption('outfitStyle', style.id)}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border text-center transition-all ${
                          config.outfitStyle === style.id
                            ? 'border-eco-primary bg-eco-mint text-eco-primary'
                            : 'border-gray-200 text-eco-muted hover:border-eco-primary/30'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outfit Colors */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-eco-muted uppercase tracking-wider block">Màu sắc áo</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'electricBlue', name: 'Electric Blue', color: '#0066FF' },
                      { id: 'vibrantGreen', name: 'Vibrant Green', color: '#9FCE1A' },
                      { id: 'urbanBeige', name: 'Urban Beige', color: '#FFF3DD' }
                    ].map(color => (
                      <button
                        key={color.id}
                        onClick={() => updateOption('outfitColor', color.id)}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                          config.outfitColor === color.id
                            ? 'border-eco-primary bg-eco-mint text-eco-primary'
                            : 'border-gray-200 text-eco-muted hover:border-eco-primary/30'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color.color }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Accessories Option */}
            {activeTab === 'accessory' && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-eco-muted uppercase tracking-wider block">Chọn phụ kiện đồng hành</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', name: 'Không phụ kiện', desc: 'Diện mạo tối giản' },
                    { id: 'backpack', name: 'Balo Xanh', desc: 'Có logo kẹp lá bảo vệ' },
                    { id: 'glasses', name: 'Kính Mát Trí Thức', desc: 'Sành điệu & tri thức' },
                    { id: 'headphones', name: 'Tai Nghe Lướt Nhạc', desc: 'Thảnh thơi đón giai điệu' }
                  ].map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => updateOption('accessory', acc.id)}
                      className={`p-3 text-left rounded-2xl border transition-all ${
                        config.accessory === acc.id
                          ? 'border-eco-primary bg-eco-mint/50 shadow-xs'
                          : 'border-gray-200 hover:bg-eco-soft/40'
                      }`}
                    >
                      <span className="text-xs font-black text-eco-ink block">{acc.name}</span>
                      <span className="text-[9px] text-eco-muted block mt-0.5 font-medium">{acc.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Customizer Footer (Save & Action buttons) */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4 shrink-0">
            {errorMsg && (
              <div className="flex-grow flex items-center space-x-1 text-[9px] text-red-600 font-bold bg-red-50 border border-red-200 p-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-eco-ink text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200"
              >
                Đóng
              </button>
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-eco-primary hover:bg-eco-primaryDeep text-white px-5 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 flex items-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu Nhân Vật ✓</span>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
