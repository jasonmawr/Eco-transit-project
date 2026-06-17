'use client';

import React from 'react';
import { Sun, CloudRain, Thermometer, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  activeColorClass: string;
}

interface WeatherConditionChipsProps {
  selectedPresets: string[];
  onChange: (presets: string[]) => void;
}

export function WeatherConditionChips({
  selectedPresets,
  onChange,
}: WeatherConditionChipsProps) {
  const presets: WeatherPreset[] = [
    {
      id: 'normal',
      name: 'Bình thường',
      description: 'Thời tiết mát mẻ, lý tưởng cho mọi lộ trình.',
      icon: Sun,
      colorClass: 'border-eco-mint hover:bg-eco-mint/30 text-eco-muted',
      activeColorClass: 'bg-eco-primary text-white border-eco-primary shadow-md shadow-eco-primary/20',
    },
    {
      id: 'rain',
      name: 'Trời mưa lớn',
      description: 'Đường trơn, ưu tiên Metro mái che và hạn chế đi bộ.',
      icon: CloudRain,
      colorClass: 'border-eco-mint hover:bg-blue-50/50 text-eco-muted',
      activeColorClass: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20',
    },
    {
      id: 'hot',
      name: 'Nắng nóng',
      description: 'Nhiệt độ ngoài trời cao, ưu tiên Metro máy lạnh.',
      icon: Thermometer,
      colorClass: 'border-eco-mint hover:bg-amber-50/50 text-eco-muted',
      activeColorClass: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20',
    },
    {
      id: 'night',
      name: 'Trời tối',
      description: 'Hạn chế đi bộ chặng xa ngoài trời vào ban đêm.',
      icon: Moon,
      colorClass: 'border-eco-mint hover:bg-indigo-50/50 text-eco-muted',
      activeColorClass: 'bg-indigo-950 text-white border-indigo-950 shadow-md shadow-indigo-950/20',
    },
  ];

  const handleChipClick = (presetId: string) => {
    let nextPresets: string[] = [];

    if (presetId === 'normal') {
      nextPresets = ['normal'];
    } else {
      const currentWithoutNormal = selectedPresets.filter(p => p !== 'normal');
      if (currentWithoutNormal.includes(presetId)) {
        nextPresets = currentWithoutNormal.filter(p => p !== presetId);
      } else {
        nextPresets = [...currentWithoutNormal, presetId];
      }
      if (nextPresets.length === 0) {
        nextPresets = ['normal'];
      }
    }

    onChange(nextPresets);
  };

  const getCombinedDescription = () => {
    const activeWithoutNormal = selectedPresets.filter(p => p !== 'normal');
    if (activeWithoutNormal.length === 0) {
      return 'Thời tiết mát mẻ, lý tưởng cho mọi lộ trình di chuyển xanh.';
    }
    const descs: string[] = [];
    if (activeWithoutNormal.includes('rain')) {
      descs.push('Ưu tiên Metro có mái che, hạn chế đi bộ trơn trượt.');
    }
    if (activeWithoutNormal.includes('hot')) {
      descs.push('Ưu tiên tàu Metro có điều hòa, tránh nắng nóng.');
    }
    if (activeWithoutNormal.includes('night')) {
      descs.push('Lộ trình buổi tối đơn giản, an toàn, ít chuyển tuyến.');
    }
    return descs.join(' ');
  };

  return (
    <div className="flex flex-col space-y-3.5 w-full select-none">
      {/* Label and Selected Indicators */}
      <div className="flex justify-between items-center pl-1">
        <span className="text-xs font-black text-eco-ink uppercase tracking-wider flex items-center gap-1.5">
          <span>⛅</span> Điều kiện thời tiết
        </span>
        <span className="text-[10px] font-bold text-eco-primary bg-eco-mint px-2 py-0.5 rounded-full">
          {selectedPresets.includes('normal')
            ? 'Bình thường'
            : `${selectedPresets.length} điều kiện`}
        </span>
      </div>

      {/* Grid of Chips - responsive 2x2 layout on both mobile and desktop to prevent truncation */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {presets.map(preset => {
          const isActive = selectedPresets.includes(preset.id);
          const Icon = preset.icon;

          return (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => handleChipClick(preset.id)}
              aria-pressed={isActive}
              whileTap={{ scale: 0.97 }}
              className={`
                flex items-center space-x-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all duration-200 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-eco-primary focus:ring-offset-2 w-full
                ${isActive ? preset.activeColorClass : `bg-white ${preset.colorClass}`}
              `}
            >
              <div
                className={`
                  p-1 rounded-md shrink-0 flex items-center justify-center
                  ${isActive ? 'bg-white/20 text-white' : 'bg-eco-soft text-eco-primary'}
                `}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="leading-normal select-none py-0.5">{preset.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Instruction/Description */}
      <div className="bg-eco-soft/60 border border-eco-mint/30 rounded-2xl p-3 flex items-start gap-2.5">
        <span className="text-xs shrink-0 select-none">💡</span>
        <p className="text-[10px] text-eco-muted italic font-medium leading-relaxed">
          {getCombinedDescription()}
        </p>
      </div>
    </div>
  );
}
