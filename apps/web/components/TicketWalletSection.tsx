'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, getApiBaseUrl } from '../lib/api';
import AuthModal from './AuthModal';
import { 
  Wallet, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Train, 
  Bus, 
  Zap, 
  ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketWalletSectionProps {
  user: any;
  onLoginClick: () => void;
}

export default function TicketWalletSection({ user, onLoginClick }: TicketWalletSectionProps) {
  // Authentication local fallback
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  
  // Wallet / Tickets / Ledger states
  const [walletStats, setWalletStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [brokenTickets, setBrokenTickets] = useState<Record<string, boolean>>({});

  // Form states
  const [vehicleType, setVehicleType] = useState<'metro' | 'bus' | 'ebus' | 'other'>('metro');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [routeLabel, setRouteLabel] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Upload status states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  
  // Drag and drop visual state
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all necessary data
  const fetchData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const stats = await apiFetch('/api/wallet/me');
      setWalletStats(stats);

      const ticketList = await apiFetch('/api/tickets/mine');
      setTickets(ticketList);
      setBrokenTickets({});

      const ledgerList = await apiFetch('/api/points/ledger');
      setLedger(ledgerList);

      try {
        const leaderboardList = await apiFetch('/api/leaderboard');
        setLeaderboard(leaderboardList);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    } catch (err) {
      console.error('Error fetching wallet/ticket data:', err);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Fetch stations list for selector
  useEffect(() => {
    const fetchStationsList = async () => {
      try {
        const list = await apiFetch('/api/stations');
        setStations(list);
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };
    fetchStationsList();
  }, []);

  // Handle file preview
  const handleFileChange = (selectedFile: File) => {
    setUploadError(null);
    setUploadSuccess(false);

    if (selectedFile.size === 0) {
      setUploadError('Tệp tin này trống (0 bytes). Vui lòng chọn tệp tin khác.');
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setUploadError('Dung lượng tệp vượt quá 2MB. Vui lòng nén ảnh hoặc chọn tệp nhỏ hơn.');
      return;
    }

    const fileType = selectedFile.type;
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'svg' || fileType.includes('svg') || fileType.includes('xml')) {
      setUploadError('Định dạng ảnh vectơ SVG không được hỗ trợ. Chỉ nhận ảnh JPG/PNG/WEBP.');
      return;
    }

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(fileType)) {
      setUploadError('Định dạng tệp không hợp lệ. Vui lòng tải lên ảnh JPG, PNG hoặc WEBP.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImagePreview(null);
    setRouteLabel('');
    setAmount('');
    setSelectedStationId('');
    setUploadError(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Vui lòng chọn hoặc kéo thả một ảnh vé xe.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('ticketImage', file);
      formData.append('type', vehicleType);
      if (selectedStationId) {
        formData.append('stationId', selectedStationId);
      }
      if (routeLabel) {
        formData.append('routeLabel', routeLabel);
      }
      if (amount) {
        formData.append('amount', amount);
      }

      const apiUrl = `${getApiBaseUrl()}/api/tickets/upload`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi xử lý vé từ hệ thống.');
      }

      setUploadSuccess(true);
      resetForm();
      fetchData(); // Refresh metrics, tickets and ledger list
    } catch (err: any) {
      setUploadError(err.message || 'Có lỗi xảy ra khi tải lên vé.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-eco-accentGreen/15 text-eco-accentGreenDeep border border-eco-accentGreen/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" /> Từ chối
          </span>
        );
      case 'manual_review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3 h-3 mr-1" /> Cần xem xét
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200" title="Kiểm duyệt viên/Quản trị viên sẽ kiểm tra vé trong bảng điều hành trước khi cộng điểm.">
            <Clock className="w-3 h-3 mr-1 animate-pulse" /> Chờ kiểm duyệt
          </span>
        );
    }
  };

  const getVehicleBadge = (type: string) => {
    switch (type) {
      case 'metro':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-eco-primary/10 text-eco-primary border border-eco-primary/20">
            <Train className="w-3 h-3 mr-1" /> Metro
          </span>
        );
      case 'bus':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-eco-accentGreen/10 text-eco-accentGreenDeep border border-eco-accentGreen/20">
            <Bus className="w-3 h-3 mr-1" /> Xe buýt
          </span>
        );
      case 'ebus':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
            <Zap className="w-3 h-3 mr-1" /> VinBus
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-eco-muted/10 text-eco-muted border border-eco-muted/20">
            <FileText className="w-3 h-3 mr-1" /> Khác
          </span>
        );
    }
  };

  // Auth Guard Gate
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-16 h-16 bg-eco-mint rounded-full flex items-center justify-center text-eco-primary mb-4 border border-eco-primary/10">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-eco-ink mb-2">Tích Lũy Điểm Xanh — Nhận Quà Bảo Vệ Môi Trường</h3>
        <p className="text-sm text-eco-muted max-w-lg mb-6 leading-relaxed">
          Đăng nhập tài khoản của bạn để gửi vé di chuyển bằng tàu điện Metro, xe buýt hoặc VinBus,
          tích lũy điểm thưởng và đổi các voucher nước uống từ Highlands, Phúc Long.
        </p>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="px-6 py-2.5 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md transition-all duration-200"
        >
          Đăng nhập ngay
        </button>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between border-b border-eco-primary/10 pb-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-eco-ink tracking-tight font-display-campaign">
            TÍCH ĐIỂM & VÉ XANH CỦA TÔI
          </h2>
          <p className="text-xs text-eco-muted mt-0.5">Tải lên chứng từ di chuyển xanh của bạn để tích lũy Green Points</p>
        </div>
        <div className="flex items-center space-x-2">
          {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
            <button
              onClick={() => {
                window.location.hash = 'admin';
              }}
              className="px-3 py-1.5 bg-eco-ink hover:bg-eco-ink/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center space-x-1"
            >
              🛠️ <span>Mở bảng duyệt vé</span>
            </button>
          )}
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 bg-eco-mint hover:bg-eco-primary hover:text-white rounded-full text-eco-primary transition-all duration-200 disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Wallet Card & Upload Form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PREMIUM GREEN WALLET CARD */}
          <div className="relative bg-gradient-to-br from-eco-ink via-[#0d1c2b] to-eco-primary rounded-3xl p-6 text-white overflow-hidden shadow-xl border border-white/5">
            {/* Visual background rings */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-eco-accentGreen/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-24 h-24 bg-eco-primary/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-eco-accentGreen font-black uppercase tracking-widest font-mono">
                  GREEN POINTS WALLET
                </p>
                <h3 className="text-[11px] text-white/60 font-semibold mt-0.5">EcoTransit Campaign Card</h3>
              </div>
              <Wallet className="w-5 h-5 text-eco-accentGreen" />
            </div>

            {loadingStats ? (
              <div className="py-2 space-y-3">
                <div className="h-8 w-28 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
              </div>
            ) : (
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-eco-accentGreen tracking-tight">
                    {walletStats?.balance ?? 0}
                  </span>
                  <span className="text-xs font-bold text-white/80">điểm</span>
                </div>
                
                <p className="text-[10px] text-white/50 font-mono mt-1">
                  Mã thẻ: {user.id.slice(0, 8).toUpperCase()}-XXXX
                </p>

                {/* Substats */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-5">
                  <div>
                    <span className="text-[9px] text-white/50 block font-medium">Tích lũy trọn đời</span>
                    <span className="text-sm font-bold text-eco-accentGreen">+{walletStats?.lifetimeEarned ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block font-medium">Đã sử dụng</span>
                    <span className="text-sm font-bold text-white/90">-{walletStats?.lifetimeSpent ?? 0}</span>
                  </div>
                </div>

                {/* Ticket status summaries */}
                <div className="border-t border-white/10 pt-3 mt-4 flex items-center justify-between text-[9.5px] text-white/70">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                    <span>{walletStats?.ticketCounts?.pending ?? 0} Chờ kiểm duyệt</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-eco-accentGreen mr-1.5" />
                    <span>{walletStats?.ticketCounts?.verified ?? 0} Đã duyệt</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5" />
                    <span>{walletStats?.ticketCounts?.rejected ?? 0} Từ chối</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* POINTS RULE PANEL */}
          <div className="bg-emerald-50/60 border border-emerald-200/50 p-5 rounded-3xl space-y-2">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center space-x-1.5">
              <span>💡 QUY ĐỊNH TÍCH ĐIỂM & ĐUA TOP</span>
            </h4>
            <ul className="text-[11px] text-emerald-900 leading-relaxed font-semibold space-y-1.5 list-disc pl-4">
              <li>Vé hợp lệ phải được Ban tổ chức/Kiểm duyệt viên duyệt mới chính thức được cộng điểm xanh.</li>
              <li>Đổi quà sử dụng <strong>Điểm khả dụng</strong>. Điểm khả dụng sẽ bị trừ tương ứng khi đổi quà thành công.</li>
              <li>Thành tích đua top (bảng xếp hạng) dựa trên <strong>Tổng điểm tích lũy trọn đời</strong> và không bị giảm đi khi bạn thực hiện đổi quà.</li>
              <li>Bảng xếp hạng (Leaderboard) chỉ hiển thị biệt danh và thứ hạng ẩn danh để bảo mật thông tin, không công khai số điểm cụ thể.</li>
              <li>Ban tổ chức sẽ xác minh tính chính danh và đối soát thủ công trước khi trao giải chung cuộc vào cuối chiến dịch.</li>
            </ul>
          </div>

          {/* TICKET UPLOAD FORM */}
          <div className="bg-white rounded-3xl p-6 border border-eco-primary/10 shadow-sm">
            <h3 className="text-base font-black text-eco-ink mb-2 uppercase tracking-tight">
              Tải Lên Vé Di Chuyển Xanh
            </h3>
            
            <div className="mb-4 p-3.5 bg-eco-bgBeige/60 border border-eco-primary/10 rounded-2xl text-[10px] sm:text-[11px] text-eco-muted leading-relaxed font-semibold">
              ℹ️ <strong>Thông tin kiểm duyệt:</strong> Ảnh vé tải lên sẽ ở trạng thái <strong>Chờ kiểm duyệt</strong>. Đội ngũ vận hành (Kiểm duyệt viên hoặc Quản trị viên) sẽ kiểm tra tính hợp lệ trong bảng điều khiển. Vé sau khi được duyệt thành công sẽ cộng <strong>+10 điểm xanh</strong> cho tài khoản của bạn.
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Vehicle Type Selector Chips */}
              <div>
                <label className="block text-xs font-bold text-eco-muted mb-2 uppercase tracking-wide">
                  1. Chọn phương tiện di chuyển
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleType('metro')}
                    className={`py-2 px-1 flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
                      vehicleType === 'metro'
                        ? 'border-eco-primary bg-eco-mint text-eco-primary font-bold shadow-sm'
                        : 'border-gray-200 text-eco-muted hover:border-eco-primary/30 hover:bg-gray-50'
                    }`}
                  >
                    <Train className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Metro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType('bus')}
                    className={`py-2 px-1 flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
                      vehicleType === 'bus'
                        ? 'border-eco-accentGreen bg-eco-accentGreen/10 text-eco-accentGreenDeep font-bold shadow-sm'
                        : 'border-gray-200 text-eco-muted hover:border-eco-accentGreen/30 hover:bg-gray-50'
                    }`}
                  >
                    <Bus className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Xe buýt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType('ebus')}
                    className={`py-2 px-1 flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
                      vehicleType === 'ebus'
                        ? 'border-orange-400 bg-orange-50 text-orange-700 font-bold shadow-sm'
                        : 'border-gray-200 text-eco-muted hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    <Zap className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">VinBus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType('other')}
                    className={`py-2 px-1 flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
                      vehicleType === 'other'
                        ? 'border-eco-muted bg-gray-100 text-eco-ink font-bold shadow-sm'
                        : 'border-gray-200 text-eco-muted hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Khác</span>
                  </button>
                </div>
              </div>

              {/* Station Selection (Condition: if metro or bus) */}
              <div>
                <label className="block text-xs font-bold text-eco-muted mb-1.5 uppercase tracking-wide">
                  2. Ga/Trạm liên quan (Không bắt buộc)
                </label>
                <div className="relative">
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs text-eco-ink bg-eco-soft border border-eco-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-eco-primary appearance-none transition-all duration-200"
                  >
                    <option value="">-- Chọn ga tàu (Ví dụ: Bến Thành) --</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.lineName})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-eco-muted absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Route Label Input */}
              <div>
                <label className="block text-xs font-bold text-eco-muted mb-1.5 uppercase tracking-wide">
                  3. Số hiệu / Tên tuyến đường
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tuyến số 1, Bus 19, VinBus D4..."
                  value={routeLabel}
                  onChange={(e) => setRouteLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-eco-ink bg-eco-soft border border-eco-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-eco-primary transition-all duration-200"
                />
              </div>

              {/* Drag and Drop File Zone */}
              <div>
                <label className="block text-xs font-bold text-eco-muted mb-2 uppercase tracking-wide">
                  4. Chọn tệp ảnh vé di chuyển
                </label>
                
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full min-h-[120px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-eco-primary bg-eco-mint/30 shadow-inner'
                      : imagePreview
                      ? 'border-eco-accentGreen/50 bg-eco-accentGreen/5'
                      : 'border-gray-300 hover:border-eco-primary hover:bg-eco-mint/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {imagePreview ? (
                    <div className="relative w-full max-w-[140px] aspect-[4/3] rounded-xl overflow-hidden shadow-sm group">
                      <img src={imagePreview} alt="Vé xanh preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-[10px] font-black uppercase text-white tracking-wider">Đổi ảnh</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-eco-muted mb-2" />
                      <p className="text-[10px] text-eco-ink font-bold">Kéo thả ảnh vé hoặc nhấp để tải lên</p>
                      <p className="text-[9px] text-eco-muted mt-1">Định dạng JPG, PNG, WEBP. Tối đa 2MB.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Status Alerts */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-[10px] font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </motion.div>
                )}

                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-eco-accentGreen/10 border border-eco-accentGreen/20 rounded-xl flex items-start space-x-2 text-eco-accentGreenDeep text-[10px] font-bold"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 text-eco-accentGreen" />
                    <span>Vé xanh đã được gửi và đang chờ đội vận hành EcoTransit kiểm duyệt. Khi được duyệt, bạn sẽ nhận +10 điểm xanh.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-2">
                {file && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-eco-ink text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200"
                  >
                    Hủy tệp
                  </button>
                )}
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className={`flex-2 py-2 px-4 text-[11px] font-black uppercase tracking-wider text-white rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-1 ${
                    uploading || !file
                      ? 'bg-gray-300 shadow-none cursor-not-allowed'
                      : 'bg-eco-primary hover:bg-eco-primaryDeep'
                  }`}
                  style={{ flexGrow: file ? 2 : 1 }}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Đang xử lý ảnh...
                    </>
                  ) : (
                    'Gửi vé xanh tích điểm'
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Ticket List & Ledger History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TICKET SUBMISSION LIST */}
          <div className="bg-white rounded-3xl p-6 border border-eco-primary/10 shadow-sm">
            <h3 className="text-base font-black text-eco-ink mb-4 uppercase tracking-tight">
              Vé đã tải lên gần đây
            </h3>

            {loadingStats ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-eco-muted text-xs">
                Bạn chưa gửi vé di chuyển nào. Hãy chụp và gửi vé để tích điểm!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {tickets.map((t) => (
                  <div 
                    key={t.id}
                    className="p-3.5 bg-eco-soft border border-eco-primary/5 hover:border-eco-primary/10 rounded-2xl flex space-x-3 items-center justify-between transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Ticket Thumbnail Preview */}
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shadow-inner shrink-0 border border-gray-200 relative group flex items-center justify-center">
                        {brokenTickets[t.id] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        ) : (
                          <img 
                            src={t.imageUrl || '/images/ticket-placeholder.png'} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover"
                            onError={() => {
                              setBrokenTickets(prev => ({ ...prev, [t.id]: true }));
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Info details */}
                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {getVehicleBadge(t.type)}
                          {t.routeLabel && (
                            <span className="text-[10px] font-extrabold text-eco-ink font-mono">
                              {t.routeLabel}
                            </span>
                          )}
                        </div>
                        {t.stationName && (
                          <p className="text-[10px] text-eco-muted mt-1">
                            Ga liên kết: <strong className="text-eco-ink">{t.stationName}</strong>
                          </p>
                        )}
                        {brokenTickets[t.id] && (
                          <p className="text-[9px] font-bold text-amber-600 mt-1 italic">
                            ⚠️ Ảnh vé không còn khả dụng trong bản demo
                          </p>
                        )}
                        <p className="text-[9px] text-eco-muted/70 mt-0.5">
                          Tải lên: {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* OCR text display toggle or preview */}
                        {t.ocrText && (
                          <div className="text-[9px] text-eco-muted bg-white/60 px-2 py-0.5 rounded border border-gray-100 mt-1.5 italic overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]">
                            🔍 {t.ocrText}
                          </div>
                        )}

                        {/* Rejected reason review note */}
                        {t.status === 'rejected' && t.reviewNote && (
                          <p className="text-[9px] font-bold text-red-600 mt-1 italic">
                            ⚠️ Lý do: {t.reviewNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {getStatusBadge(t.status)}
                      {t.status === 'verified' && (
                        <p className="text-[10px] font-extrabold text-eco-accentGreenDeep mt-1">
                          +10 điểm
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LEDGER TRANSACTION HISTORY */}
          <div className="bg-white rounded-3xl p-6 border border-eco-primary/10 shadow-sm">
            <h3 className="text-base font-black text-eco-ink mb-4 uppercase tracking-tight">
              Lịch sử giao dịch điểm xanh
            </h3>

            {loadingStats ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : ledger.length === 0 ? (
              <div className="text-center py-6 text-eco-muted text-xs">
                Chưa có giao dịch điểm xanh nào được thực hiện.
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto overflow-x-auto pr-1">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-eco-primary/10 text-eco-muted font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2">Giao dịch / Thời gian</th>
                      <th className="py-2 text-right">Biến động</th>
                      <th className="py-2 text-right">Số dư sau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((item) => {
                      const isPositive = item.delta > 0;
                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-eco-soft/40 transition-colors duration-150">
                          <td className="py-2.5">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                isPositive ? 'bg-eco-accentGreen/10 text-eco-accentGreenDeep' : 'bg-red-50 text-red-500'
                              }`}>
                                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <span className="font-bold text-eco-ink block leading-tight">
                                  {item.eventType === 'ticket_approved' && '🎫 Duyệt vé xanh'}
                                  {item.eventType === 'bonus' && '🎁 Điểm thưởng đăng ký'}
                                  {item.eventType === 'quiz_reward' && '🧠 Câu đố bảo vệ môi trường'}
                                  {item.eventType === 'voucher_redeem' && '☕ Đổi mã giảm giá'}
                                  {!['ticket_approved', 'bonus', 'quiz_reward', 'voucher_redeem'].includes(item.eventType) && item.eventType}
                                </span>
                                <span className="text-[9px] text-eco-muted/70 block">
                                  {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-black">
                            <span className={isPositive ? 'text-eco-accentGreenDeep' : 'text-red-600'}>
                              {isPositive ? `+${item.delta}` : item.delta}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-eco-muted">
                            {item.balanceAfter}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LEADERBOARD */}
          <div className="bg-white rounded-3xl p-6 border border-eco-primary/10 shadow-sm">
            <h3 className="text-base font-black text-eco-ink mb-4 uppercase tracking-tight">
              🏆 Bảng xếp hạng chiến dịch xanh
            </h3>
            <p className="text-[10px] text-eco-muted mb-4 leading-normal font-semibold">
              Bảng xếp hạng hiển thị thứ tự di chuyển xanh của các hành khách dựa trên tổng tích lũy trọn đời. 
              Biệt danh được mã hóa ẩn danh để bảo mật.
            </p>

            {loadingStats ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-6 text-eco-muted text-xs">
                Chưa có dữ liệu bảng xếp hạng.
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto pr-1">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-eco-primary/10 text-eco-muted font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2 pl-2">Hạng</th>
                      <th className="py-2">Hành khách</th>
                      <th className="py-2 text-right pr-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, idx) => {
                      const isTop3 = item.rank <= 3;
                      const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '';
                      return (
                        <tr 
                          key={idx} 
                          className={`border-b border-gray-50 transition-colors duration-150 ${
                            item.isMe 
                              ? 'bg-emerald-50/70 hover:bg-emerald-100/70 font-bold border-l-4 border-l-eco-primary' 
                              : 'hover:bg-eco-soft/40'
                          }`}
                        >
                          <td className="py-2.5 pl-2 font-mono font-black text-eco-ink">
                            {isTop3 ? `${medal} ${item.rank}` : `#${item.rank}`}
                          </td>
                          <td className="py-2.5">
                            <span className={`${item.isMe ? 'text-emerald-800' : 'text-eco-ink'}`}>
                              {item.nickname}
                            </span>
                          </td>
                          <td className="py-2.5 text-right pr-2 font-extrabold text-[10px]">
                            {item.isMe ? (
                              <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Bạn
                              </span>
                            ) : (
                              <span className="text-gray-400">Ẩn danh</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
