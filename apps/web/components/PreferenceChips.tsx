import React from 'react';

export interface Preferences {
  fewerTransfers: boolean;
  lessWalking: boolean;
}

interface PreferenceChipsProps {
  preferences: Preferences;
  onChange: (prefs: Preferences) => void;
}

export default function PreferenceChips({
  preferences,
  onChange,
}: PreferenceChipsProps) {
  const toggleFewerTransfers = () => {
    onChange({
      ...preferences,
      fewerTransfers: !preferences.fewerTransfers,
    });
  };

  const toggleLessWalking = () => {
    onChange({
      ...preferences,
      lessWalking: !preferences.lessWalking,
    });
  };

  return (
    <div className="flex flex-col space-y-2 w-full select-none">
      <label className="text-[10px] font-black text-eco-muted uppercase tracking-widest">
        ⚙️ Ưu tiên lộ trình
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleFewerTransfers}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold border transition-all duration-300 hover-spring flex items-center space-x-1.5 ${
            preferences.fewerTransfers
              ? 'bg-eco-primary text-white border-eco-primary ring-2 ring-eco-primary/20 shadow-sm'
              : 'bg-white text-eco-muted border-eco-mint hover:bg-eco-soft'
          }`}
        >
          <span>🔄</span>
          <span>Ít chuyển tuyến</span>
        </button>
        
        <button
          type="button"
          onClick={toggleLessWalking}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold border transition-all duration-300 hover-spring flex items-center space-x-1.5 ${
            preferences.lessWalking
              ? 'bg-eco-primary text-white border-eco-primary ring-2 ring-eco-primary/20 shadow-sm'
              : 'bg-white text-eco-muted border-eco-mint hover:bg-eco-soft'
          }`}
        >
          <span>🚶</span>
          <span>Ít đi bộ ngoài trời</span>
        </button>
      </div>
    </div>
  );
}
