import React from 'react';

interface Leg {
  mode: 'metro' | 'bus' | 'walk';
  fromStationName?: string;
  toStationName?: string;
  distanceMeters: number;
  durationMinutes: number;
  fareEstimate: number;
  lineCode?: string;
  lineName?: string;
}

interface RouteTimelineProps {
  legs: Leg[];
}

export default function RouteTimeline({ legs }: RouteTimelineProps) {
  const getModeLabel = (mode: string, lineName?: string) => {
    if (mode === 'metro') return lineName || 'Metro Tuyến số 1';
    if (mode === 'bus') return lineName || 'Tuyến Xe buýt';
    return 'Đi bộ chặng trung chuyển';
  };

  const getModeIcon = (mode: string) => {
    if (mode === 'metro') return '🚇';
    if (mode === 'bus') return '🚌';
    return '🚶';
  };

  const getModeColor = (mode: string) => {
    if (mode === 'metro') return 'border-eco-primary/40 bg-eco-mint text-eco-primary';
    if (mode === 'bus') return 'border-eco-accentGreen/40 bg-eco-soft text-eco-accentGreenDeep';
    return 'border-gray-300 bg-gray-50 text-gray-500';
  };

  const getLineColor = (mode: string) => {
    if (mode === 'metro') return 'bg-eco-primary/30';
    if (mode === 'bus') return 'bg-eco-accentGreen/35';
    return 'border-dashed border-l-2 border-gray-300';
  };

  return (
    <div className="flex flex-col space-y-5 py-2 pl-1 select-none">
      {legs.map((leg, index) => {
        const isLast = index === legs.length - 1;
        const modeColor = getModeColor(leg.mode);
        const lineColor = getLineColor(leg.mode);

        return (
          <div key={index} className="flex items-stretch relative">
            
            {/* Vertical path line indicator */}
            {!isLast && (
              <div 
                className={`absolute left-[15px] top-[28px] bottom-[-22px] w-[3px] z-0 ${
                  leg.mode === 'walk' ? 'border-dashed border-l-2 border-gray-300 w-0 bg-transparent' : lineColor
                }`}
              />
            )}

            {/* Glowing Icon Circle */}
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 shrink-0 shadow-sm transition-all duration-300 ${modeColor}`}>
              {getModeIcon(leg.mode)}
            </div>

            {/* Step info details */}
            <div className="ml-4 flex flex-col justify-center flex-grow text-xs space-y-0.5">
              
              <div className="font-extrabold text-eco-ink flex items-center justify-between">
                <span className="text-[12px]">{getModeLabel(leg.mode, leg.lineName)}</span>
                <span className="text-[10px] text-eco-muted font-mono font-bold">
                  {leg.durationMinutes} phút ({leg.distanceMeters >= 1000 ? `${(leg.distanceMeters / 1000).toFixed(1)} km` : `${leg.distanceMeters}m`})
                </span>
              </div>
              
              <div className="text-[11px] text-eco-muted leading-relaxed">
                Từ <strong className="text-eco-ink font-bold">{leg.fromStationName}</strong> đến <strong className="text-eco-ink font-bold">{leg.toStationName}</strong>
              </div>
              
              {leg.fareEstimate > 0 && (
                <div className="text-[10px] font-extrabold text-eco-primary flex items-center space-x-1 mt-0.5">
                  <span>💵</span>
                  <span>Vé ước tính: {leg.fareEstimate.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              
            </div>

          </div>
        );
      })}
    </div>
  );
}
