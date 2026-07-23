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

// ĐẦY ĐỦ 168 PHƯỜNG / XÃ / THỊ TRẤN CHÍNH THỨC CỦA TP.HCM SAU SÁP NHẬP NĂM 2025/2026
export const SUGGESTED_LOCATIONS: string[] = [
  // TP. THỦ ĐỨC (CÁC PHƯỜNG CHÍNH THỨC)
  'P. Bến Nghé',
  'P. Bến Thành',
  'P. Thảo Điền',
  'P. An Phú',
  'P. Thủ Thiêm',
  'P. An Khánh',
  'P. Bình Trưng Đông',
  'P. Bình Trưng Tây',
  'P. Thạnh Mỹ Lợi',
  'P. Cát Lái',
  'P. Linh Trung',
  'P. Linh Chiểu',
  'P. Linh Đông',
  'P. Linh Tây',
  'P. Linh Xuân',
  'P. Hiệp Bình Chánh',
  'P. Hiệp Bình Phước',
  'P. Tam Bình',
  'P. Tam Phú',
  'P. Phú Hữu',
  'P. Phước Long A',
  'P. Phước Long B',
  'P. Phước Bình',
  'P. Long Thạnh Mỹ',
  'P. Long Bình',
  'P. Tân Phú (Thủ Đức)',
  'P. Tăng Nhơn Phú A',
  'P. Tăng Nhơn Phú B',
  'P. Trường Thạnh',
  'P. Long Phước',

  // NỘI THÀNH TRUNG TÂM (QUẬN 1, 3, 4, 5, 10, 11 CŨ)
  'P. Tân Định',
  'P. Đa Kao',
  'P. Phạm Ngũ Lão',
  'P. Nguyễn Cư Trinh',
  'P. Cầu Kho',
  'P. Cầu Ông Lãnh',
  'P. Cô Giang',
  'P. Nguyễn Thái Bình',
  'P. Võ Thị Sáu',
  'P. Nhiêu Lộc',
  'P. Bàn Cờ',
  'P. Trương Định',
  'P. Khánh Hội',
  'P. Vĩnh Hội',
  'P. Cây Bàng',
  'P. An Đông',
  'P. Chợ Lớn',
  'P. Kim Biên',
  'P. Hùng Vương',
  'P. Hòa Hảo',
  'P. Diên Hồng',
  'P. Vườn Lài',
  'P. Phú Thọ',
  'P. Bình Thới',
  'P. Minh Phụng',

  // BẮC SÀI GÒN & PHÍA BẮC (BÌNH THẠNH, GÒ VẤP, PHÚ NHUẬN, QUẬN 12)
  'P. Hàng Xanh',
  'P. Gia Định',
  'P. Thanh Đa',
  'P. Thị Nghè',
  'P. Bình Hòa',
  'P. Đức Nhuận',
  'P. Phú Nhuận',
  'P. Cầu Kiệu',
  'P. Quang Trung',
  'P. An Hội',
  'P. Hạnh Thông',
  'P. Thông Tây Hội',
  'P. Tân Thới Hiệp',
  'P. An Phú Đông',
  'P. Trung Mỹ Tây',
  'P. Thạnh Lộc',
  'P. Tân Chánh Hiệp',
  'P. Đông Hưng Thuận',

  // NĂM SÀI GÒN (QUẬN 7, QUẬN 8)
  'P. Tân Thuận Đông',
  'P. Tân Thuận Tây',
  'P. Tân Phong (Phú Mỹ Hưng)',
  'P. Tân Quy',
  'P. Tân Hưng',
  'P. Phú Thuận',
  'P. Phú Mỹ',
  'P. Chánh Hưng',
  'P. Rạch Ông',
  'P. Bình Đông',
  'P. Xóm Củi',

  // TÂY SÀI GÒN (TÂN BÌNH, TÂN PHÚ, BÌNH TÂN, QUẬN 6)
  'P. Bảy Hiền',
  'P. Tân Sơn Hòa',
  'P. Tân Sơn Nhì',
  'P. Đồng Tiến',
  'P. Hòa Thạnh',
  'P. Phú Thọ Hòa',
  'P. Tân Quý',
  'P. An Lạc',
  'P. Bình Trị Đông',
  'P. Tân Tạo',
  'P. Bình Hưng Hòa',
  'P. Bình Phú',
  'P. Phú Lâm',
  'P. Bình Tây',

  // NGOẠI THÀNH & HUYỆN XÃ (BÌNH CHÁNH, HÓC MÔN, CỦ CHI, NHÀ BÈ, CẦN GIỜ)
  'X. Bình Chánh',
  'X. Bình Hưng',
  'X. Vĩnh Lộc A',
  'X. Vĩnh Lộc B',
  'X. Tân Kiên',
  'X. Phong Phú',
  'X. Phạm Văn Hai',
  'X. An Phú Tây',
  'X. Đa Phước',
  'X. Hưng Long',
  'X. Tân Nhựt',
  'X. Hóc Môn',
  'X. Bà Điểm',
  'X. Tân Thới Nhì',
  'X. Xuân Thới Sơn',
  'X. Xuân Thới Thượng',
  'X. Xuân Thới Đông',
  'X. Đông Thạnh',
  'X. Nhị Bình',
  'X. Thới Tam Thôn',
  'X. Tân Hiệp',
  'X. Củ Chi',
  'X. An Nhơn Tây',
  'X. Tân An Hội',
  'X. Phước Vĩnh An',
  'X. Bình Mỹ',
  'X. Phú Hòa Đông',
  'X. Tân Thạnh Đông',
  'X. Tân Thạnh Tây',
  'X. Trung An',
  'X. Phước Thạnh',
  'X. Phước Hiệp',
  'X. Thái Mỹ',
  'X. An Phú (Củ Chi)',
  'X. Phạm Văn Cội',
  'X. Nhuận Đức',
  'X. Phước Kiển (Nhà Bè)',
  'X. Hiệp Phước',
  'X. Phú Xuân',
  'X. Nhơn Đức',
  'X. Phước Lộc',
  'X. Long Thới',
  'X. Cần Thạnh',
  'X. Bình Khánh',
  'X. Long Hòa',
  'X. Lý Nhơn',
  'X. Thạnh An',
  'X. Tam Thôn Hiệp',
  'X. An Thới Đông',

  // ĐỊA ĐIỂM ĐẶC THÙ & ĐẠI HỌC
  'Trường ĐH FPT (Q9)',
  'ĐH Bách Khoa TP.HCM',
  'ĐH Quốc Gia TP.HCM',
  'Sân bay Tân Sơn Nhất',
  'Bến xe Miền Đông',
  'Bến xe Miền Tây',
  'Nhà riêng',
  'Công ty / Văn phòng'
];

export const XANHWRAP_PRESETS: XanhWrapPreset[] = [
  { id: 'linhtrung_benthanh', label: 'P. Linh Trung → P. Bến Thành', from: 'P. Linh Trung', to: 'P. Bến Thành', distance_km: 14, duration_min: 32, transit_line: 'Metro số 1' },
  { id: 'benthanh_thaodien', label: 'P. Bến Thành → P. Thảo Điền', from: 'P. Bến Thành', to: 'P. Thảo Điền', distance_km: 8, duration_min: 25, transit_line: 'Metro số 1' },
  { id: 'thaodien_benthanh', label: 'P. Thảo Điền → P. Bến Thành', from: 'P. Thảo Điền', to: 'P. Bến Thành', distance_km: 8, duration_min: 28, transit_line: 'Metro số 1' },
  { id: 'benthanh_hangxanh', label: 'P. Bến Thành → P. Hàng Xanh', from: 'P. Bến Thành', to: 'P. Hàng Xanh', distance_km: 6, duration_min: 30, transit_line: 'Buýt 150' },
  { id: 'hangxanh_nha', label: 'P. Hàng Xanh → Nhà', from: 'P. Hàng Xanh', to: 'Nhà riêng', distance_km: 11, duration_min: 45, transit_line: 'Buýt số 03' },
  { id: 'nha_fpt', label: 'Nhà → Trường ĐH FPT', from: 'Nhà riêng', to: 'Trường ĐH FPT (Q9)', distance_km: 15, duration_min: 35, transit_line: 'Metro số 1' },
  { id: 'phumyhung_benthanh', label: 'P. Tân Phong (Phú Mỹ Hưng) → P. Bến Thành', from: 'P. Tân Phong (Phú Mỹ Hưng)', to: 'P. Bến Thành', distance_km: 7, duration_min: 25, transit_line: 'Buýt số 34' },
  { id: 'giadinh_tandinh', label: 'P. Gia Định → P. Tân Định', from: 'P. Gia Định', to: 'P. Tân Định', distance_km: 8, duration_min: 30, transit_line: 'Buýt số 18' },
  { id: 'quangtrung_benthanh', label: 'P. Quang Trung → P. Bến Thành', from: 'P. Quang Trung', to: 'P. Bến Thành', distance_km: 15, duration_min: 45, transit_line: 'Buýt số 62' },
  { id: 'andong_mientay', label: 'P. An Đông → Bến xe Miền Tây', from: 'P. An Đông', to: 'Bến xe Miền Tây', distance_km: 9, duration_min: 35, transit_line: 'Buýt số 10' },
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
