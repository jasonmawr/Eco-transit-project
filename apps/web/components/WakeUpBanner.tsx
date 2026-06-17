import React from 'react';

interface WakeUpBannerProps {
  elapsed: number;
  onRetry: () => void;
}

export default function WakeUpBanner({ elapsed, onRetry }: WakeUpBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-white border border-eco-mint rounded-2xl shadow-lg animate-fade-in max-w-sm mx-auto">
      <svg className="animate-spin h-12 w-12 text-eco-primary mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <h3 className="text-lg font-bold text-eco-ink mb-2">Đang kết nối máy chủ...</h3>
      <p className="text-xs text-eco-muted leading-relaxed mb-4">
        Hệ thống đang đánh thức máy chủ (Render Free Tier). Quá trình này có thể mất 1-2 phút nếu máy chủ đang ở trạng thái ngủ.
      </p>
      <div className="w-full bg-eco-mint h-1.5 rounded-full overflow-hidden mb-3">
        <div 
          className="bg-eco-primary h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min((elapsed / 60) * 100, 100)}%` }}
        />
      </div>
      <div className="text-[10px] text-eco-muted font-mono mb-4">
        Đang chờ phản hồi: {elapsed} giây
      </div>
      {elapsed > 30 && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 bg-eco-primary text-white text-xs font-semibold rounded-lg hover:bg-eco-primaryDeep transition-colors"
        >
          Kích hoạt kết nối lại
        </button>
      )}
    </div>
  );
}
