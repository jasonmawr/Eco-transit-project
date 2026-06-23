'use client';

import React, { useState, useEffect, useRef } from 'react';
import { notFound } from 'next/navigation';
import { AvatarConfig } from '../../components/ui/AvatarSvg';
import MetroRailStage from '../../components/MetroRailStage';

const JOURNEY_STATIONS = [
  { id: 'route', name: 'Lập lộ trình xanh', num: 1, desc: 'Lập lộ trình tối ưu', icon: '🛤️' },
  { id: 'stations', name: 'Khám phá ga', num: 2, desc: 'Khám phá nhà ga & Địa điểm', icon: '🚉' },
  { id: 'tickets', name: 'Tích điểm vé xanh', num: 3, desc: 'Nhật ký tích điểm vé', icon: '🎫' },
  { id: 'rewards', name: 'Đổi thưởng', num: 4, desc: 'Danh mục đổi thưởng', icon: '🎁' },
  { id: 'xanhwrap', name: 'XanhWrap / Chia sẻ', num: 5, desc: 'Tạo thẻ chia sẻ XanhWrap', icon: '✨' },
  { id: 'guides', name: 'Cẩm nang lướt xanh', num: 6, desc: 'Mẹo & Cẩm nang xanh', icon: '📖' },
];

const DEFAULT_AVATAR: AvatarConfig = {
  characterId: 'student',
  hairStyle: 'short',
  hairColor: 'default',
  outfitStyle: 'casual',
  outfitColor: 'electricBlue',
  accessory: 'backpack'
};

export default function MetroRailMotionLab() {
  if (process.env.NODE_ENV === 'production') {
    return notFound();
  }

  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('route');
  const [isMoving, setIsMoving] = useState(false);
  const [delayParentUpdate, setDelayParentUpdate] = useState(false);
  const labIdRef = useRef('');

  // CSS transition event telemetry
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [telemetry, setTelemetry] = useState({
    domInstanceId: '',
    runCount: 0,
    startCount: 0,
    endCount: 0,
    cancelCount: 0,
    lastTriggerTimestamp: 0,
    lastDuration: 0,
    lastStartTransform: '',
    lastEndTransform: '',
  });

  useEffect(() => {
    setMounted(true);
    labIdRef.current = 'train-instance-' + Math.random().toString(36).substring(2, 9);
    setTelemetry(prev => ({ ...prev, domInstanceId: labIdRef.current }));
  }, []);

  const handleSectionSelect = (sectionId: string) => {
    const prevIdx = Math.max(0, JOURNEY_STATIONS.findIndex(s => s.id === activeSection));
    const targetIdx = Math.max(0, JOURNEY_STATIONS.findIndex(s => s.id === sectionId));

    if (prevIdx === targetIdx) return;

    setTelemetry(prev => {
      const trainEl = document.getElementById('desktop-train');
      const currentTransform = trainEl ? window.getComputedStyle(trainEl).transform : 'none';
      return {
        ...prev,
        runCount: prev.runCount + 1,
        lastTriggerTimestamp: Date.now(),
        lastStartTransform: currentTransform,
      };
    });

    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] Navigating to station ${targetIdx + 1}. Starting journey...`, ...prev]);

    if (delayParentUpdate) {
      setTimeout(() => {
        setActiveSection(sectionId);
      }, 1000);
    } else {
      setActiveSection(sectionId);
    }
  };

  // Callbacks passed to shared MetroRailStage to feed the telemetry panel
  const onTransitionRun = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setTelemetry(prev => ({ ...prev, runCount: prev.runCount + 1 }));
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitionrun fired for ${e.propertyName}`, ...prev]);
  };

  const onTransitionStart = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setIsMoving(true);
    setTelemetry(prev => ({ ...prev, startCount: prev.startCount + 1 }));
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitionstart fired for ${e.propertyName}`, ...prev]);
  };

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setIsMoving(false);
    setTelemetry(prev => {
      const trainEl = document.getElementById('desktop-train');
      const finalTransform = trainEl ? window.getComputedStyle(trainEl).transform : 'none';
      return {
        ...prev,
        endCount: prev.endCount + 1,
        lastEndTransform: finalTransform,
        lastDuration: Date.now() - prev.lastTriggerTimestamp,
      };
    });
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitionend fired for ${e.propertyName}. Journey completed!`, ...prev]);
  };

  const onTransitionCancel = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    setTelemetry(prev => ({ ...prev, cancelCount: prev.cancelCount + 1 }));
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] transitioncancel fired for ${e.propertyName}!`, ...prev]);
  };

  if (!mounted) return <div className="p-8">Đang tải Motion Lab...</div>;

  const activeIdx = Math.max(0, JOURNEY_STATIONS.findIndex(s => s.id === activeSection));

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Render the shared MetroRailStage component */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-8 relative">
          <MetroRailStage
            activeSection={activeSection}
            onSectionSelect={handleSectionSelect}
            avatarConfig={DEFAULT_AVATAR}
            onTransitionRun={onTransitionRun}
            onTransitionStart={onTransitionStart}
            onTransitionEnd={onTransitionEnd}
            onTransitionCancel={onTransitionCancel}
            title={
              <div>
                <h1 className="text-2xl font-bold text-[#9FCE1A] uppercase tracking-wider">
                  🚇 ECOTRANSIT A1 THREE-CAR MOTION LAB
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Phase A.1: Nâng cấp thành tàu Metro 3 toa tích hợp âm thanh hành trình & giảm chuyển động (prefers-reduced-motion).
                </p>
              </div>
            }
          />
        </div>

        {/* Quick interactive test panel & Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Control Panel */}
          <div className="bg-slate-850/80 border border-slate-700 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              🕹️ ĐIỀU KHIỂN & KIỂM THỬ NHANH
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSectionSelect(JOURNEY_STATIONS[activeIdx === 0 ? 1 : activeIdx - 1].id)}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                ⬅️ Ga trước
              </button>
              <button
                onClick={() => handleSectionSelect(JOURNEY_STATIONS[activeIdx === 5 ? 4 : activeIdx + 1].id)}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Ga tiếp theo ➡️
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleSectionSelect('stations')}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 cursor-pointer"
              >
                Test: Ga 1 ➔ Ga 2 (Lân cận)
              </button>
              <button
                onClick={() => handleSectionSelect('guides')}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 cursor-pointer"
              >
                Test: Ga 1 ➔ Ga 6 (Đường dài)
              </button>
              <button
                onClick={() => {
                  handleSectionSelect('stations');
                  setTimeout(() => handleSectionSelect('rewards'), 300);
                  setTimeout(() => handleSectionSelect('guides'), 700);
                }}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 col-span-2 cursor-pointer"
              >
                Test: Rapid clicks (Ga 2 ➔ 4 ➔ 6)
              </button>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
              <input
                type="checkbox"
                id="delay-parent-toggle"
                data-testid="delay-parent-toggle"
                checked={delayParentUpdate}
                onChange={(e) => setDelayParentUpdate(e.target.checked)}
                className="w-4 h-4 rounded text-[#9FCE1A] focus:ring-[#9FCE1A] bg-slate-900 border-slate-700"
              />
              <label htmlFor="delay-parent-toggle" className="text-[10px] text-slate-300 font-bold select-none cursor-pointer">
                Trì hoãn cập nhật Section (1s)
              </label>
            </div>
          </div>

          {/* Telemetry Panel */}
          <div className="bg-slate-850/80 border border-slate-700 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">
              📊 THÔNG SỐ ĐO ĐẠC (TELEMETRY)
            </h3>
            <table className="w-full text-xs text-slate-300 space-y-2">
              <tbody>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">DOM Instance ID (Stable):</td>
                  <td className="text-right text-green-400 font-mono">{telemetry.domInstanceId}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition Run Count:</td>
                  <td className="text-right font-mono">{telemetry.runCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition Start Count:</td>
                  <td className="text-right font-mono text-blue-400">{telemetry.startCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition End Count:</td>
                  <td className="text-right font-mono text-emerald-400">{telemetry.endCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Transition Cancel Count:</td>
                  <td className="text-right font-mono text-red-400">{telemetry.cancelCount}</td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Actual duration measured:</td>
                  <td className="text-right font-mono text-yellow-400">
                    {telemetry.lastDuration > 0 ? `${telemetry.lastDuration}ms` : '-'}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50 py-2">
                  <td className="font-bold py-1.5">Starting transform:</td>
                  <td className="text-right text-[10px] font-mono max-w-[200px] truncate" title={telemetry.lastStartTransform}>
                    {telemetry.lastStartTransform}
                  </td>
                </tr>
                <tr className="py-2">
                  <td className="font-bold py-1.5">Ending transform:</td>
                  <td className="text-right text-[10px] font-mono max-w-[200px] truncate" title={telemetry.lastEndTransform}>
                    {telemetry.lastEndTransform}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Event Logs */}
          <div className="bg-slate-850/80 border border-slate-700 p-4 rounded-xl flex flex-col h-[280px]">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">
              📜 NHẬT KÝ SỰ KIỆN (EVENT LOGS)
            </h3>
            <div className="flex-1 overflow-y-auto mt-2 space-y-1 font-mono text-[10px] text-slate-400 scrollbar-thin">
              {eventLogs.length === 0 ? (
                <div className="text-slate-500 italic p-2">Chưa có sự kiện nào được ghi nhận. Hãy click các ga ở trên để kiểm tra.</div>
              ) : (
                eventLogs.map((log, i) => (
                  <div key={i} className="border-b border-slate-800 pb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
