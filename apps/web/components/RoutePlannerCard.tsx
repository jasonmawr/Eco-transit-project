import React from 'react';
import StationSearchInput from './StationSearchInput';
import { WeatherConditionChips } from './ui/weather-condition-chips';
import PreferenceChips from './PreferenceChips';
import { PremiumCta } from './ui/premium-cta';

interface Station {
  id: string;
  name: string;
  lineName: string;
}

interface Preferences {
  fewerTransfers: boolean;
  lessWalking: boolean;
}

interface RoutePlannerCardProps {
  stations: Station[];
  originId: string;
  setOriginId: (id: string) => void;
  destinationId: string;
  setDestinationId: (id: string) => void;
  weatherPresets: string[];
  setWeatherPresets: (presets: string[]) => void;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  searching: boolean;
  loadingStations: boolean;
  errorMsg: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RoutePlannerCard({
  stations,
  originId,
  setOriginId,
  destinationId,
  setDestinationId,
  weatherPresets,
  setWeatherPresets,
  preferences,
  setPreferences,
  searching,
  loadingStations,
  errorMsg,
  onSubmit,
}: RoutePlannerCardProps) {
  return (
    <form
      id="planner-form"
      onSubmit={onSubmit}
      className="relative z-20 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-eco-mint shadow-lg space-y-4 tilt-card-hover"
    >
      {/* Form Title */}
      <div className="border-b border-eco-mint pb-3.5 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-eco-ink tracking-tight uppercase flex items-center space-x-2">
            <span>🎛️ Bảng Điều Khiển Lộ Trình</span>
          </h3>
          <p className="text-[10px] text-eco-muted font-medium mt-0.5">
            Gợi ý lộ trình theo điều kiện thời tiết bạn đã chọn.
          </p>
        </div>
        <span className="text-[9px] font-bold text-eco-primary bg-eco-mint px-2 py-0.5 rounded-md">
          v1.0.0
        </span>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start space-x-2.5 animate-pulse-glow">
          <span className="shrink-0 text-sm">⚠️</span>
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Station inputs with a premium vertical connector line */}
      {loadingStations ? (
        <div className="space-y-4 py-2">
          <div className="h-12 bg-eco-soft border border-eco-mint rounded-2xl animate-pulse" />
          <div className="h-12 bg-eco-soft border border-eco-mint rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="relative space-y-5">
          {/* Connector visual line between inputs */}
          <div className="absolute left-[14px] top-[32px] bottom-[32px] w-[2px] border-l-2 border-dashed border-eco-primary/30 z-0 pointer-events-none" />

          <div className="relative z-30 pl-1">
            <StationSearchInput
              label="Điểm xuất phát"
              placeholder="Chọn ga/trạm khởi hành..."
              stations={stations}
              value={originId}
              onChange={setOriginId}
              icon="📍"
            />
          </div>

          <div className="relative z-20 pl-1">
            <StationSearchInput
              label="Điểm đến"
              placeholder="Chọn ga/trạm kết thúc..."
              stations={stations}
              value={destinationId}
              onChange={setDestinationId}
              icon="🏁"
            />
          </div>
        </div>
      )}

      {/* Weather preset chips */}
      <div className="pt-2 relative z-10">
        <WeatherConditionChips
          selectedPresets={weatherPresets}
          onChange={setWeatherPresets}
        />
      </div>

      {/* Preference settings toggle chips */}
      <div className="pt-2 border-t border-eco-mint/60">
        <PreferenceChips
          preferences={preferences}
          onChange={setPreferences}
        />
      </div>

      {/* Action Submit Button */}
      <PremiumCta
        type="submit"
        disabled={searching || loadingStations}
        className="w-full"
      >
        {searching ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Đang tính chặng tối ưu...</span>
          </span>
        ) : (
          <span>🚀 Tìm kiếm lộ trình xanh</span>
        )}
      </PremiumCta>

      {/* Local routing note */}
      <p className="text-[9px] text-eco-muted text-center leading-relaxed">
        Chọn điểm đi và điểm đến để xem gợi ý lộ trình xanh.<br />
        Gợi ý được xây dựng từ mạng lưới Metro và xe buýt trong ứng dụng.
      </p>

    </form>
  );
}
