import React from 'react';
import { PremiumCta } from './ui/premium-cta';

interface POI {
  id: string;
  name: string;
  category: string;
  address?: string;
  details?: string;
  featured: boolean;
}

interface Station {
  id: string;
  name: string;
  lineName: string;
  orderNumber: number;
  lat: number;
  lng: number;
  facilities: string[];
  description: string;
  pois?: POI[];
}

interface StationDetailCardProps {
  station: Station | null;
  onRouteTo: (station: Station) => void;
  onClose: () => void;
}

export default function StationDetailCard({
  station,
  onRouteTo,
  onClose,
}: StationDetailCardProps) {
  if (!station) return null;

  const getPoiCategoryIcon = (category: string) => {
    if (category === 'cafe') return '☕';
    if (category === 'food') return '🍔';
    if (category === 'shopping') return '🛍️';
    return '📍';
  };

  const getPoiCategoryLabel = (category: string) => {
    if (category === 'cafe') return 'Quán Café';
    if (category === 'food') return 'Ẩm thực';
    if (category === 'shopping') return 'Mua sắm';
    return 'Dịch vụ';
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-eco-mint rounded-3xl shadow-xl p-5 animate-slide-up w-full relative z-20 hover-spring">
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4.5 right-4.5 text-eco-muted hover:text-eco-ink text-sm bg-eco-soft w-6 h-6 rounded-full flex items-center justify-center transition-colors"
      >
        ✕
      </button>

      {/* Header Info */}
      <div className="mb-4 pr-6">
        <span className="text-[9px] font-black uppercase tracking-widest text-eco-primary bg-eco-mint px-2.5 py-0.5 rounded-full">
          Ga số {station.orderNumber} • {station.lineName}
        </span>
        <h3 className="text-xl font-black text-eco-ink mt-1.5 tracking-tight flex items-center space-x-1.5">
          <span>🚉</span>
          <span>{station.name}</span>
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-eco-muted leading-relaxed mb-4">
        {station.description || 'Thông tin chi tiết và lịch trình hoạt động của nhà ga đang được cập nhật.'}
      </p>

      {/* Facilities List */}
      {station.facilities && station.facilities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[10px] font-black text-eco-muted uppercase tracking-widest mb-2">
            🛠️ Tiện ích tại nhà ga
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {station.facilities.map((fac, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold bg-eco-soft border border-eco-mint/60 text-eco-ink px-2.5 py-1 rounded-lg"
              >
                {fac.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nearby POIs Section */}
      <div className="mb-5">
        <h4 className="text-[10px] font-black text-eco-muted uppercase tracking-widest mb-2 flex justify-between">
          <span>🏪 Địa Điểm Xung Quanh Ga ({station.pois?.length || 0})</span>
        </h4>
        
        {station.pois && station.pois.length > 0 ? (
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {station.pois.map((poi) => (
              <div
                key={poi.id}
                className={`p-3 rounded-2xl border flex items-start space-x-2.5 text-xs transition-colors ${
                  poi.featured
                    ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                    : 'bg-eco-soft/40 border-eco-mint/40 hover:bg-eco-soft'
                }`}
              >
                <span className="text-base shrink-0 bg-white shadow-xs w-7 h-7 rounded-xl flex items-center justify-center border border-eco-mint/40">
                  {getPoiCategoryIcon(poi.category)}
                </span>
                
                <div className="flex-grow">
                  <div className="font-extrabold text-eco-ink flex items-center justify-between">
                    <span>{poi.name}</span>
                    <span className="text-[8px] font-extrabold text-eco-muted uppercase px-1.5 py-0.2 rounded bg-white border border-eco-mint/40 scale-95">
                      {getPoiCategoryLabel(poi.category)}
                    </span>
                  </div>
                  {poi.details && <div className="text-[10px] text-eco-muted mt-0.5 font-medium">{poi.details}</div>}
                  {poi.address && <div className="text-[9px] text-eco-muted mt-0.5 flex items-center space-x-0.5">
                    <span>📍</span>
                    <span>{poi.address}</span>
                  </div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-eco-muted italic bg-eco-soft p-3.5 rounded-2xl border border-dashed border-eco-mint/60">
            Chưa có địa điểm ăn uống hoặc dịch vụ mẫu được cập nhật quanh nhà ga này.
          </p>
        )}
      </div>

      {/* Primary CTA */}
      <div className="pt-3 border-t border-eco-mint">
        <PremiumCta
          onClick={() => onRouteTo(station)}
          className="w-full"
        >
          <span className="flex items-center space-x-2 justify-center">
            <span>📍</span>
            <span>Tìm lộ trình đến ga này</span>
          </span>
        </PremiumCta>
      </div>

    </div>
  );
}
