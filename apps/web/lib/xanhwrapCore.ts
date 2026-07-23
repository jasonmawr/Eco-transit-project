export interface XanhWrapLeg {
  from: string;
  to: string;
  depart_time: string; // "HH:mm"
  mode: 'motorbike' | 'car' | 'ride_hailing' | 'bus' | 'metro' | 'bicycle' | 'walk';
  distance_km: number;
  duration_min: number;
  transit_line?: string;
}

export interface XanhWrapPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  distance_km: number;
  duration_min: number;
  transit_line: string;
}

export interface XanhWrapLabelDef {
  code: string;
  name: string;
  group: 'green' | 'standard';
  description: string;
}

// Bộ địa điểm gợi ý Phường / Quận / Khu vực phổ biến TP.HCM
export const SUGGESTED_LOCATIONS: string[] = [
  'Q1 (Quận 1)',
  'Q. Thủ Đức',
  'P. Thảo Điền',
  'Q. Bình Thạnh',
  'Q7 (Phú Mỹ Hưng)',
  'Q. Gò Vấp',
  'Q3 (Quận 3)',
  'Q. Tân Bình',
  'Q. Phú Nhuận',
  'Q12 (Quận 12)',
  'Q5 (Quận 5)',
  'Q10 (Quận 10)',
  'Q8 (Quận 8)',
  'Q. Bình Tân',
  'H. Hóc Môn',
  'H. Củ Chi',
  'H. Nhà Bè',
  'Trường ĐH FPT (Q9)',
  'Nhà riêng',
  'Công ty / Văn phòng'
];

export const XANHWRAP_PRESETS: XanhWrapPreset[] = [
  { id: 'thuduc_q1', label: 'Thủ Đức → Q1', from: 'Thủ Đức', to: 'Q1', distance_km: 14, duration_min: 32, transit_line: 'Metro số 1' },
  { id: 'q1_thaodien', label: 'Q1 → Thảo Điền', from: 'Q1', to: 'Thảo Điền', distance_km: 8, duration_min: 25, transit_line: 'Metro số 1' },
  { id: 'thaodien_q1', label: 'Thảo Điền → Q1', from: 'Thảo Điền', to: 'Q1', distance_km: 8, duration_min: 28, transit_line: 'Metro số 1' },
  { id: 'q1_binhthanh', label: 'Q1 → B.Thạnh', from: 'Q1', to: 'B.Thạnh', distance_km: 6, duration_min: 30, transit_line: 'Buýt 150' },
  { id: 'binhthanh_nha', label: 'B.Thạnh → Nhà', from: 'B.Thạnh', to: 'Nhà', distance_km: 11, duration_min: 45, transit_line: 'Buýt số 03' },
  { id: 'nha_fpt', label: 'Nhà → ĐH FPT', from: 'Nhà', to: 'Trường ĐH FPT', distance_km: 15, duration_min: 35, transit_line: 'Metro số 1' },
  { id: 'q7_q1', label: 'Q7 → Q1', from: 'Q7 (Phú Mỹ Hưng)', to: 'Q1', distance_km: 7, duration_min: 25, transit_line: 'Buýt số 34' },
  { id: 'q1_q7', label: 'Q1 → Q7', from: 'Q1', to: 'Q7 (Phú Mỹ Hưng)', distance_km: 7, duration_min: 25, transit_line: 'Buýt số 34' },
  { id: 'govap_q3', label: 'Gò Vấp → Q3', from: 'Gò Vấp', to: 'Q3', distance_km: 8, duration_min: 30, transit_line: 'Buýt số 18' },
  { id: 'tanbinh_q1', label: 'Tân Bình → Q1', from: 'Tân Bình', to: 'Q1', distance_km: 6.5, duration_min: 22, transit_line: 'Buýt số 04' },
  { id: 'q12_q1', label: 'Q12 → Q1', from: 'Q12', to: 'Q1', distance_km: 15, duration_min: 45, transit_line: 'Buýt số 62' },
  { id: 'binhtan_q5', label: 'Bình Tân → Q5', from: 'Bình Tân', to: 'Q5', distance_km: 9, duration_min: 35, transit_line: 'Buýt số 10' },
];

export const ALL_LABELS: XanhWrapLabelDef[] = [
  { code: 'no_smoke_absolute', name: 'KHÔNG KHÓI TUYỆT ĐỐI', group: 'green', description: '100% chặng đi bus/metro và tổng quãng đường ≥ 20km' },
  { code: 'retired_driver', name: 'TAY LÁI VỀ HƯU', group: 'green', description: '100% chặng di chuyển bằng xe buýt hoặc metro' },
  { code: 'station_regular', name: 'RA GA NHƯ VỀ NHÀ', group: 'green', description: 'Từ 60% số chặng trở lên đi bằng phương tiện công cộng' },
  { code: 'quitting_rookie', name: 'TẬP TÀNH BỎ XE', group: 'green', description: 'Có ít nhất 1 chặng di chuyển bằng buýt hoặc metro' },
  { code: 'highway_boss', name: 'TRÙM CUỐI XA LỘ', group: 'standard', description: 'Tổng quãng đường di chuyển trong ngày ≥ 35km' },
  { code: 'night_owl', name: 'CÚ ĐÊM CHÍNH HIỆU', group: 'standard', description: 'Có chặng xuất phát từ 21:00 đêm trở đi' },
  { code: 'team_5am', name: 'TEAM 5 GIỜ SÁNG', group: 'standard', description: 'Chặng đầu tiên bắt đầu trước 06:30 sáng' },
  { code: 'city_speedrun', name: 'SPEEDRUN THÀNH PHỐ', group: 'standard', description: 'Thực hiện từ 6 chặng di chuyển trở lên trong ngày' },
  { code: 'rush_hour_god', name: 'CHIẾN THẦN GIỜ CAO ĐIỂM', group: 'standard', description: '≥ 2 chặng lướt trong khung giờ 06:30-08:30 hoặc 16:30-19:00' },
  { code: 'traffic_bestie', name: 'KẸT XE LÀ BẠN THÂN', group: 'standard', description: 'Vận tốc trung bình cả ngày nhỏ hơn 18 km/h' },
  { code: 'steel_spine', name: 'CỘT SỐNG THÉP', group: 'standard', description: 'Ngồi tự lái xe máy từ 150 phút trở lên trong ngày' },
  { code: 'self_driver', name: 'XE ÔM CỦA CHÍNH MÌNH', group: 'standard', description: 'Từ 4 chặng trở lên, mỗi chặng là tuyến đường khác nhau' },
  { code: 'two_end_pendulum', name: 'CON LẮC HAI ĐẦU', group: 'standard', description: 'Đúng 2 chặng di chuyển và tổng quãng đường ≥ 12km' },
  { code: 'downtown_native', name: 'DÂN NỘI ĐÔ XỊN', group: 'standard', description: 'Tất cả các chặng di chuyển đều dưới 5km' },
  { code: 'golden_hour', name: 'NGƯỜI CỦA GIỜ VÀNG', group: 'standard', description: 'Không có chặng nào dính giờ cao điểm sáng hay chiều' },
  { code: 'model_employee', name: 'NHÂN VIÊN KIỂU MẪU', group: 'standard', description: 'Hành trình di chuyển tiêu chuẩn năng động trong ngày' },
];

export const MODE_COEF_CO2: Record<string, number> = {
  motorbike: 56,
  car: 192,
  ride_hailing: 192,
  bus: 45,
  metro: 25,
  bicycle: 0,
  walk: 0,
};

export function isRushHour(timeStr: string): boolean {
  if (!timeStr || !timeStr.includes(':')) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m;
  const morningStart = 6 * 60 + 30; // 06:30
  const morningEnd = 8 * 60 + 30;   // 08:30
  const eveningStart = 16 * 60 + 30; // 16:30
  const eveningEnd = 19 * 60;        // 19:00
  return (totalMins >= morningStart && totalMins <= morningEnd) ||
         (totalMins >= eveningStart && totalMins <= eveningEnd);
}

export function assignXanhWrapLabel(legs: XanhWrapLeg[]): XanhWrapLabelDef {
  if (!legs || legs.length === 0) {
    return ALL_LABELS.find(l => l.code === 'model_employee')!;
  }

  const totalKm = legs.reduce((acc, l) => acc + (l.distance_km || 0), 0);
  const totalMin = legs.reduce((acc, l) => acc + (l.duration_min || 0), 0);
  
  const publicLegs = legs.filter(l => ['bus', 'metro'].includes(l.mode));
  const publicRatio = publicLegs.length / legs.length;

  if (publicRatio === 1 && totalKm >= 20) {
    return ALL_LABELS.find(l => l.code === 'no_smoke_absolute')!;
  }

  if (publicRatio === 1) {
    return ALL_LABELS.find(l => l.code === 'retired_driver')!;
  }

  if (publicRatio >= 0.6) {
    return ALL_LABELS.find(l => l.code === 'station_regular')!;
  }

  if (publicLegs.length >= 1) {
    return ALL_LABELS.find(l => l.code === 'quitting_rookie')!;
  }

  if (totalKm >= 35) {
    return ALL_LABELS.find(l => l.code === 'highway_boss')!;
  }

  const hasNightLeg = legs.some(l => {
    if (!l.depart_time || !l.depart_time.includes(':')) return false;
    const h = parseInt(l.depart_time.split(':')[0], 10);
    return h >= 21;
  });
  if (hasNightLeg) {
    return ALL_LABELS.find(l => l.code === 'night_owl')!;
  }

  if (legs[0]?.depart_time) {
    const [h, m] = legs[0].depart_time.split(':').map(Number);
    if ((h * 60 + m) < (6 * 60 + 30)) {
      return ALL_LABELS.find(l => l.code === 'team_5am')!;
    }
  }

  if (legs.length >= 6) {
    return ALL_LABELS.find(l => l.code === 'city_speedrun')!;
  }

  const rushHourLegsCount = legs.filter(l => isRushHour(l.depart_time)).length;
  if (rushHourLegsCount >= 2) {
    return ALL_LABELS.find(l => l.code === 'rush_hour_god')!;
  }

  const avgSpeed = totalMin > 0 ? (totalKm / (totalMin / 60)) : 25;
  if (avgSpeed < 18) {
    return ALL_LABELS.find(l => l.code === 'traffic_bestie')!;
  }

  const motorbikeMins = legs.filter(l => l.mode === 'motorbike').reduce((sum, l) => sum + (l.duration_min || 0), 0);
  if (motorbikeMins >= 150) {
    return ALL_LABELS.find(l => l.code === 'steel_spine')!;
  }

  if (legs.length >= 4) {
    return ALL_LABELS.find(l => l.code === 'self_driver')!;
  }

  if (legs.length === 2 && totalKm >= 12) {
    return ALL_LABELS.find(l => l.code === 'two_end_pendulum')!;
  }

  const allShort = legs.every(l => l.distance_km < 5);
  if (allShort) {
    return ALL_LABELS.find(l => l.code === 'downtown_native')!;
  }

  const noRushHour = legs.every(l => !isRushHour(l.depart_time));
  if (noRushHour) {
    return ALL_LABELS.find(l => l.code === 'golden_hour')!;
  }

  return ALL_LABELS.find(l => l.code === 'model_employee')!;
}

export function calculateXanhWrapStats(legs: XanhWrapLeg[]) {
  const totalKm = parseFloat(legs.reduce((acc, l) => acc + (l.distance_km || 0), 0).toFixed(1));
  const totalMin = legs.reduce((acc, l) => acc + (l.duration_min || 0), 0);

  const handsFreeMin = legs
    .filter(l => ['bus', 'metro', 'ride_hailing'].includes(l.mode))
    .reduce((sum, l) => sum + (l.duration_min || 0), 0);

  const transitMin = legs.reduce((sum, l) => {
    if (['bus', 'metro'].includes(l.mode)) {
      return sum + l.duration_min;
    }
    if (l.transit_line?.includes('Metro')) {
      return sum + Math.round((l.distance_km / 35) * 60 + 8);
    }
    return sum + Math.round((l.distance_km / 16) * 60 + 12);
  }, 0);

  const baselinePrivateCoef = 124;
  let co2SavedGrams = 0;
  legs.forEach(l => {
    const currentCoef = MODE_COEF_CO2[l.mode] ?? 56;
    if (['bus', 'metro', 'bicycle', 'walk'].includes(l.mode)) {
      co2SavedGrams += Math.round(l.distance_km * (baselinePrivateCoef - currentCoef));
    }
  });

  const value = handsFreeMin > 0 ? handsFreeMin : transitMin;
  const daysPerYear = Math.round((value * 250) / (60 * 24));
  const episodesPerYear = Math.round((value * 250) / 45);

  return {
    totalKm,
    totalMin,
    handsFreeMin,
    transitMin,
    co2SavedGrams: Math.max(0, co2SavedGrams),
    metricValue: value,
    daysPerYear: Math.max(1, daysPerYear),
    episodesPerYear: Math.max(1, episodesPerYear),
  };
}
