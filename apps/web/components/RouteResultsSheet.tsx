import React, { useState } from 'react';
import RouteTimeline from './RouteTimeline';
import TimeBillCard, { TimeBillDTO } from './TimeBillCard';
import { apiFetch } from '../lib/api';

interface RouteLeg {
  mode: 'metro' | 'bus' | 'walk';
  fromStationName?: string;
  toStationName?: string;
  distanceMeters: number;
  durationMinutes: number;
  fareEstimate: number;
  lineCode?: string;
  lineName?: string;
}

export interface RouteOption {
  id: string;
  score: number;
  totalTimeMinutes: number;
  totalFare: number;
  walkingMinutes: number;
  waitingMinutes: number;
  transferCount: number;
  legs: RouteLeg[];
  explanation: string;
  weatherSnapshot?: any;
}

interface RouteResultsProps {
  options: RouteOption[];
  onSelectOption: (option: RouteOption) => void;
  selectedOptionId: string | null;
  originLabel: string;
  destinationLabel: string;
  weatherSummary?: string;
  preferenceSummary?: string;
}

export default function RouteResultsSheet({
  options,
  onSelectOption,
  selectedOptionId,
  originLabel,
  destinationLabel,
  weatherSummary = 'Bình thường',
  preferenceSummary = 'Mặc định',
}: RouteResultsProps) {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [bills, setBills] = useState<Record<string, TimeBillDTO>>({});
  const [creatingBillId, setCreatingBillId] = useState<string | null>(null);
  const [billErrors, setBillErrors] = useState<Record<string, string>>({});

  const handleCreateTimeBill = async (opt: RouteOption) => {
    try {
      setCreatingBillId(opt.id);
      setBillErrors(prev => ({ ...prev, [opt.id]: '' }));

      const totalDistanceMeters = opt.legs.reduce((acc, leg) => acc + (leg.distanceMeters || 0), 0);
      const distanceKm = Number((totalDistanceMeters / 1000).toFixed(2));

      const titleLines = opt.legs
        .map(l => l.lineCode || (l.mode === 'walk' ? 'Bộ' : l.mode))
        .filter(Boolean);

      const routeTitle = `Tuyến ${titleLines.join(' ➔ ')}`;

      const response = await apiFetch('/api/time-bills', {
        method: 'POST',
        body: JSON.stringify({
          originLabel,
          destinationLabel,
          routeTitle,
          durationMinutes: opt.totalTimeMinutes,
          walkingMinutes: opt.walkingMinutes,
          transferCount: opt.transferCount,
          distanceKm,
          weatherSummary,
          preferenceSummary,
          routeSnapshot: opt,
        }),
      });

      setBills(prev => ({ ...prev, [opt.id]: response }));
    } catch (err: any) {
      console.error('Failed to create time bill:', err);
      setBillErrors(prev => ({ ...prev, [opt.id]: err.message || 'Lỗi khi tạo hóa đơn.' }));
    } finally {
      setCreatingBillId(null);
    }
  };

  if (options.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-eco-mint rounded-3xl bg-eco-soft">
        <span className="text-3xl mb-3 block">🔍</span>
        <h4 className="text-sm font-bold text-eco-ink mb-1.5">Không tìm thấy lộ trình phù hợp</h4>
        <p className="text-xs text-eco-muted leading-relaxed">
          Hãy điều chỉnh lại điểm khởi hành, điểm đến hoặc thay đổi tùy chọn bộ lọc thời tiết của bạn.
        </p>
      </div>
    );
  }

  const handleToggleExpand = (opt: RouteOption) => {
    if (expandedOptionId === opt.id) {
      setExpandedOptionId(null);
    } else {
      setExpandedOptionId(opt.id);
      onSelectOption(opt);
    }
  };

  // Determine dynamic badge label based on option parameters
  const getDynamicBadges = (opt: RouteOption, idx: number) => {
    const badges: { text: string; colorClass: string }[] = [];
    if (idx === 0) {
      badges.push({ text: 'Tốt nhất ⚡', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' });
    }
    if (opt.transferCount === 0) {
      badges.push({ text: 'Đi thẳng 🔄', colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' });
    }
    if (opt.walkingMinutes <= 5) {
      badges.push({ text: 'Ít đi bộ 🚶', colorClass: 'bg-sky-100 text-sky-800 border-sky-200' });
    }
    if (opt.totalFare <= 10000 && opt.totalFare > 0) {
      badges.push({ text: 'Tiết kiệm 💰', colorClass: 'bg-amber-100 text-amber-800 border-amber-200' });
    }
    return badges;
  };

  return (
    <div className="flex flex-col space-y-4 w-full animate-fade-in" data-testid="route-result-summary">
      
      {/* Title section */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black text-eco-ink tracking-widest uppercase flex items-center space-x-1.5">
          <span>🛣️ Lộ Trình Tìm Thấy ({options.length})</span>
        </h3>
        <div className="text-[9px] text-eco-muted font-extrabold uppercase">
          <span>Lộ trình đến: </span>
          <strong className="text-eco-primary font-black" data-testid="route-destination-label">{destinationLabel}</strong>
        </div>
      </div>

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
        {options.map((opt, i) => {
          const isSelected = selectedOptionId === opt.id;
          const isExpanded = expandedOptionId === opt.id;
          const badges = getDynamicBadges(opt, i);

          return (
            <div
              key={opt.id}
              onClick={() => {
                onSelectOption(opt);
                if (!isExpanded) {
                  setExpandedOptionId(opt.id);
                }
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 transform ${
                isSelected
                  ? 'border-eco-primary bg-gradient-to-br from-eco-mint/80 to-white shadow-md ring-1 ring-eco-primary/30'
                  : 'border-eco-mint bg-white hover:border-eco-primary hover:shadow-sm'
              }`}
            >
              
              {/* Option Index Header & Badges */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-black bg-eco-ink text-white px-2.5 py-0.5 rounded-lg">
                    Tuyến #{i + 1}
                  </span>
                  {badges.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${badge.colorClass}`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-eco-muted">
                    Điểm số: <strong className="text-eco-primary text-sm font-black font-mono">{opt.score}</strong>
                  </span>
                </div>
              </div>

              {/* Timing, Cost, and Transfers board */}
              <div className="flex justify-between items-center border-b border-eco-mint/60 pb-3 mb-3">
                <div className="flex items-baseline space-x-0.5">
                  <span className="text-3xl font-black text-eco-ink leading-none font-outfit">{opt.totalTimeMinutes}</span>
                  <span className="text-xs text-eco-muted font-bold">phút</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-right">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-eco-muted font-bold uppercase">Giá vé</span>
                    <span className="text-[11px] text-eco-ink font-extrabold font-mono">
                      {opt.totalFare > 0 ? `${opt.totalFare.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-eco-muted font-bold uppercase">Chuyển xe</span>
                    <span className="text-[11px] text-eco-ink font-extrabold font-mono">{opt.transferCount} lần</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-eco-muted font-bold uppercase">Đi bộ</span>
                    <span className="text-[11px] text-eco-ink font-extrabold font-mono">{opt.walkingMinutes} phút</span>
                  </div>
                </div>
              </div>

              {/* Vietnamese recommendation explanation */}
              <div className="bg-eco-soft p-3 rounded-2xl border border-eco-mint/40 mb-3">
                <p className="text-[11px] text-eco-muted leading-relaxed font-medium">
                  💬 {opt.explanation}
                </p>
              </div>

              {/* Transit line nodes trace */}
              <div className="flex items-center space-x-1.5 flex-wrap">
                {opt.legs.map((leg, legIdx) => {
                  const isLastLeg = legIdx === opt.legs.length - 1;
                  const getIcon = () => {
                    if (leg.mode === 'metro') return '🚇';
                    if (leg.mode === 'bus') return '🚌';
                    return '🚶';
                  };
                  const getBg = () => {
                    if (leg.mode === 'metro') return 'bg-eco-mint text-eco-primary border-eco-primary/20';
                    if (leg.mode === 'bus') return 'bg-eco-soft text-eco-accentGreenDeep border-eco-accentGreen/20';
                    return 'bg-gray-50/50 text-gray-500 border-gray-200';
                  };
                  return (
                    <React.Fragment key={legIdx}>
                      <span className={`text-[10px] font-bold inline-flex items-center px-2 py-0.5 rounded-lg border ${getBg()}`}>
                        {getIcon()} <span className="ml-1">{leg.lineCode ? leg.lineCode : (leg.mode === 'walk' ? 'Walk' : '')}</span>
                      </span>
                      {!isLastLeg && <span className="text-eco-muted/40 text-[9px]">➔</span>}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Detailed Leg Timeline Collapse Toggle */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-eco-mint/80 space-y-4 animate-slide-down">
                  <h4 className="text-[10px] font-black text-eco-muted uppercase tracking-widest">
                    📋 Hành Trình Đi Lại Chi Tiết
                  </h4>
                  <RouteTimeline legs={opt.legs} />

                  {/* Time Bill Section */}
                  <div className="border-t border-dashed border-eco-mint pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-eco-muted uppercase tracking-widest">
                        🎫 Hóa Đơn Lướt Khói
                      </h4>
                    </div>

                    {bills[opt.id] ? (
                      <div className="pt-2">
                        <TimeBillCard
                          bill={bills[opt.id]}
                          isOwner={true}
                          onPrivacyUpdated={(updated) => {
                            setBills(prev => ({ ...prev, [opt.id]: updated }));
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-eco-soft/50 rounded-2xl p-4 border border-eco-mint/60 flex flex-col space-y-3">
                        <p className="text-[11px] text-eco-muted leading-relaxed font-medium">
                          Tạo hóa đơn thời gian di chuyển để lưu giữ và chia sẻ thành tích giảm thiểu CO₂ cùng các điểm xanh chiến dịch EcoTransit!
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateTimeBill(opt);
                          }}
                          disabled={creatingBillId === opt.id}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[11px] py-2.5 px-4 rounded-2xl flex items-center justify-center space-x-1.5 shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {creatingBillId === opt.id ? (
                            <>
                              <span className="animate-spin text-sm">🔄</span>
                              <span>Đang tạo hóa đơn...</span>
                            </>
                          ) : (
                            <>
                              <span>🎫</span>
                              <span>Tạo hóa đơn lướt khỏi khói</span>
                            </>
                          )}
                        </button>
                        {billErrors[opt.id] && (
                          <p className="text-[10px] text-rose-500 font-bold">{billErrors[opt.id]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-4 pt-2 border-t border-dashed border-eco-mint/40 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(opt);
                  }}
                  className="text-[11px] font-extrabold text-eco-primary hover:text-eco-primaryDeep transition-colors flex items-center space-x-1"
                >
                  <span>{isExpanded ? '🔺 Thu gọn hành trình' : '▼ Chi tiết hành trình'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
