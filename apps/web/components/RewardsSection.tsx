'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, getApiBaseUrl } from '../lib/api';
import { 
  Gift, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Ticket, 
  Clock, 
  User, 
  ShoppingBag, 
  Coffee, 
  Compass, 
  BookOpen, 
  Car, 
  Lock, 
  Loader2,
  HelpCircle,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardsSectionProps {
  user: any;
  onLoginClick: () => void;
}

export default function RewardsSection({ user, onLoginClick }: RewardsSectionProps) {
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_vouchers'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // States
  const [rewards, setRewards] = useState<any[]>([]);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redeem Flow States
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<any | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const handleOpenRedeemModal = (reward: any) => {
    setSelectedVoucher(reward);
    const key = `idemp-cl-${user?.id?.slice(0, 8) || 'guest'}-${reward.id?.slice(0, 8)}-${Date.now()}`;
    setIdempotencyKey(key);
  };

  // Fetch functions
  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      if (searchQuery) {
        queryParams.append('q', searchQuery);
      }
      
      const catalog = await apiFetch(`/api/rewards?${queryParams.toString()}`);
      setRewards(catalog);
    } catch (err: any) {
      console.error('Fetch catalog error:', err);
      setError('Không thể tải danh mục quà tặng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVouchers = async () => {
    if (!user) return;
    try {
      const list = await apiFetch('/api/rewards/mine');
      setMyVouchers(list);
    } catch (err) {
      console.error('Fetch my vouchers error:', err);
    }
  };

  const fetchWalletStats = async () => {
    if (!user) return;
    try {
      const stats = await apiFetch('/api/wallet/me');
      setWallet(stats);
    } catch (err) {
      console.error('Fetch wallet stats error:', err);
    }
  };

  // Sync data on filter change or tab change
  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchCatalog();
    } else {
      fetchMyVouchers();
    }
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (user) {
      fetchWalletStats();
      fetchMyVouchers();
    }
  }, [user]);

  // Trigger search on debounce or submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drink':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'food':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'transit':
        return <Car className="w-3.5 h-3.5" />;
      case 'shopping':
        return <Tag className="w-3.5 h-3.5" />;
      case 'study':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'experience':
        return <Compass className="w-3.5 h-3.5" />;
      default:
        return <Gift className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'drink': return 'Nước uống';
      case 'food': return 'Ẩm thực';
      case 'transit': return 'Di chuyển';
      case 'shopping': return 'Mua sắm';
      case 'study': return 'Học tập';
      case 'experience': return 'Trải nghiệm';
      default: return 'Khác';
    }
  };

  const executeRedeem = async () => {
    if (!selectedVoucher || !idempotencyKey) return;
    setRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/rewards/${selectedVoucher.slug}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ idempotencyKey }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi xử lý đổi quà từ hệ thống.');
      }

      setRedeemSuccess(data.redemption);
      
      // Refresh user balance & my vouchers lists immediately
      fetchWalletStats();
      fetchMyVouchers();
      fetchCatalog();
    } catch (err: any) {
      setRedeemError(err.message || 'Có lỗi xảy ra trong quá trình đổi điểm.');
    } finally {
      setRedeeming(false);
    }
  };

  // Close confirm modal and clear states
  const closeRedeemModal = () => {
    setSelectedVoucher(null);
    setIdempotencyKey(null);
    setRedeemError(null);
    setRedeemSuccess(null);
    setRedeeming(false);
  };

  return (
    <div className="relative">
      {/* Campaign Copywriting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-eco-primary/10 pb-4 mb-6">
        <div>
          <h2 className="sr-only">
            Đổi Điểm Xanh Nhận Ưu Đãi
          </h2>
          <p className="text-xs text-eco-muted mt-0.5">Tích lũy vé di chuyển xanh, quy đổi đặc quyền lướt phố thông minh</p>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-2 mt-4 md:mt-0 p-1 bg-eco-soft border border-eco-primary/5 rounded-2xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
              activeTab === 'catalog'
                ? 'bg-eco-primary text-white shadow-sm'
                : 'text-eco-muted hover:text-eco-ink'
            }`}
          >
            Kho ưu đãi xanh
          </button>
          <button
            onClick={() => {
              if (!user) {
                onLoginClick();
              } else {
                setActiveTab('my_vouchers');
              }
            }}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center space-x-1 ${
              activeTab === 'my_vouchers'
                ? 'bg-eco-primary text-white shadow-sm'
                : 'text-eco-muted hover:text-eco-ink'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Voucher của tôi ({myVouchers.length})</span>
          </button>
        </div>
      </div>

      {/* Wallet Balance Widget for logged in users */}
      {user && wallet && (
        <div className="mb-6 py-2.5 px-4 bg-eco-soft border border-eco-primary/5 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-eco-muted font-bold">Số dư hiện tại của bạn:</span>
          <div className="flex items-center space-x-1">
            <span className="text-base font-extrabold text-eco-accentGreenDeep">{wallet.balance}</span>
            <span className="text-[10px] text-eco-muted font-bold">Green Points</span>
          </div>
        </div>
      )}

      {/* CATALOG TAB DISPLAY */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Category Chips Filters */}
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'drink', label: 'Nước uống' },
              { id: 'food', label: 'Ẩm thực' },
              { id: 'transit', label: 'Di chuyển' },
              { id: 'shopping', label: 'Mua sắm' },
              { id: 'study', label: 'Học tập' },
              { id: 'experience', label: 'Trải nghiệm' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-200 flex items-center space-x-1 ${
                  selectedCategory === cat.id
                    ? 'bg-eco-mint text-eco-primary border-eco-primary font-bold shadow-sm'
                    : 'bg-white border-gray-200 text-eco-muted hover:border-eco-primary/30'
                }`}
              >
                {cat.id !== 'all' && getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Loader */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-eco-muted">
              <Loader2 className="w-8 h-8 animate-spin text-eco-primary mb-2" />
              <p className="text-xs font-semibold">Đang tải kho ưu đãi xanh...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4 bg-red-50/50 border border-red-200 rounded-3xl text-red-700">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-16 px-4 bg-eco-soft/50 border border-dashed border-gray-200 rounded-3xl text-eco-muted">
              <Gift className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-bold">Không tìm thấy ưu đãi nào phù hợp trong danh mục.</p>
            </div>
          ) : (
            /* Voucher Grid (Responsive Stack/Columns) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const isOutOfStock = reward.stockStatus === 'out_of_stock';
                const hasExpired = reward.cantRedeemReason?.includes('hết hạn');
                const canRedeem = user ? reward.isRedeemable : true;
                const pointsDiff = wallet ? wallet.balance - reward.pointsCost : 0;
                
                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-3xl border border-eco-primary/10 overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                      !reward.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div>
                      {/* Image header placeholder or thumbnail */}
                      <div className="h-32 bg-eco-soft border-b border-eco-primary/5 flex items-center justify-center relative">
                        {reward.imageUrl ? (
                          <img
                            src={reward.imageUrl}
                            alt={reward.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%230066FF" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="4"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-eco-mint flex items-center justify-center text-eco-primary">
                            {getCategoryIcon(reward.category)}
                          </div>
                        )}
                        {/* Category Badge overlay */}
                        <span className="absolute top-3 left-3 bg-eco-ink text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                          {getCategoryLabel(reward.category)}
                        </span>

                        {/* Stock warning status */}
                        {isOutOfStock ? (
                          <span className="absolute top-3 right-3 bg-red-100 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            Hết kho
                          </span>
                        ) : reward.stockStatus === 'low_stock' ? (
                          <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            Sắp hết
                          </span>
                        ) : null}
                      </div>

                      {/* Content details */}
                      <div className="p-4 space-y-2">
                        <span className="text-[10px] text-eco-primary font-black uppercase tracking-wider font-mono">
                          {reward.brandName}
                        </span>
                        <h4 className="text-sm font-black text-eco-ink leading-tight">
                          {reward.title}
                        </h4>
                        <p className="text-[11px] text-eco-muted leading-relaxed line-clamp-2">
                          {reward.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-eco-primary/5 bg-eco-soft/30 flex items-center justify-between">
                      {/* Cost */}
                      <div className="leading-none">
                        <div className="flex items-baseline space-x-0.5">
                          <span className="text-lg font-extrabold text-eco-ink">
                            {reward.pointsCost}
                          </span>
                          <span className="text-[9px] text-eco-muted font-bold">điểm</span>
                        </div>
                        <span className="text-[9px] text-eco-accentGreenDeep font-extrabold block mt-0.5">
                          ~ {Math.round(reward.pointsCost / 10)} vé xanh
                        </span>
                        {reward.validUntil && (
                          <span className="text-[8px] text-eco-muted block mt-0.5">
                            HSD: {new Date(reward.validUntil).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>

                      {/* Redeem Action button */}
                      {user ? (
                        <button
                          disabled={!canRedeem || isOutOfStock}
                          onClick={() => handleOpenRedeemModal(reward)}
                          className={`py-1.5 px-4 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : !canRedeem
                              ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                              : 'bg-eco-primary hover:bg-eco-primaryDeep text-white shadow-sm'
                          }`}
                          title={reward.cantRedeemReason || 'Đổi ưu đãi này'}
                        >
                          {!canRedeem && pointsDiff < 0 ? 'Thiếu điểm' : 'Đổi ngay'}
                        </button>
                      ) : (
                        <button
                          onClick={onLoginClick}
                          className="py-1.5 px-4 bg-eco-ink hover:bg-eco-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all duration-200 flex items-center space-x-1"
                        >
                          <Lock className="w-3 h-3 mr-0.5" />
                          <span>Đổi ngay</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY VOUCHERS TAB DISPLAY */}
      {activeTab === 'my_vouchers' && (
        <div className="space-y-4">
          {myVouchers.length === 0 ? (
            <div className="text-center py-16 px-4 bg-eco-soft/50 border border-dashed border-gray-200 rounded-3xl text-eco-muted">
              <Ticket className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-bold mb-1">Ví voucher của bạn trống.</p>
              <p className="text-[10px] text-eco-muted">Hãy lướt tàu điện tích điểm để đổi những ưu đãi hấp dẫn từ chiến dịch!</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-4 px-4 py-2 bg-eco-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm hover:bg-eco-primaryDeep"
              >
                Khám phá ưu đãi ngay
              </button>
            </div>
          ) : (
            /* Vouchers portfolio list */
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {myVouchers.map((item) => {
                const hasExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
                
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-eco-primary/10 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                  >
                    {/* Visual left colored stripe */}
                    <div className="absolute top-0 left-0 bottom-0 w-2 bg-eco-accentGreen" />

                    <div className="pl-2 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-eco-mint text-eco-primary rounded-md">
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="text-[10px] text-eco-muted font-bold">
                          {item.brandName}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-black text-eco-ink">{item.voucherTitle}</h4>
                      
                      <div className="flex items-center space-x-3 text-[9px] text-eco-muted font-bold">
                        <span>Đổi ngày: {new Date(item.redeemedAt).toLocaleDateString('vi-VN')}</span>
                        {item.expiresAt && (
                          <span className={hasExpired ? 'text-red-500' : ''}>
                            Hết hạn: {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Voucher action demo code details */}
                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-eco-muted block font-bold">MÃ ƯU ĐÃI</span>
                        <span className="text-sm font-black font-mono text-eco-primary tracking-wider uppercase bg-eco-soft px-3 py-1 rounded-lg border border-eco-primary/5 select-all">
                          {item.code}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM / SUCCESS MODAL DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-eco-primary/10 flex flex-col justify-between"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-eco-primary/10 bg-eco-soft/40">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase bg-eco-ink text-white px-2 py-0.5 rounded-md tracking-wider">
                      {getCategoryLabel(selectedVoucher.category)}
                    </span>
                    <h3 className="text-base font-black text-eco-ink mt-2">
                      Xác nhận đổi ưu đãi xanh
                    </h3>
                    <p className="text-[10px] text-eco-muted mt-0.5">{selectedVoucher.brandName}</p>
                  </div>
                  <button
                    onClick={closeRedeemModal}
                    className="p-1 rounded-full text-eco-muted hover:bg-gray-100"
                  >
                    <span className="sr-only">Đóng</span>
                    &times;
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                
                {/* Voucher Title details */}
                <div className="py-3 px-4 bg-eco-mint/10 border border-eco-mint rounded-2xl">
                  <h4 className="text-sm font-black text-eco-primary">{selectedVoucher.title}</h4>
                  <p className="text-[10px] text-eco-muted mt-1 leading-relaxed">
                    {selectedVoucher.description}
                  </p>
                </div>

                {/* Terms of usage */}
                {selectedVoucher.terms && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-eco-muted uppercase tracking-wider">Điều kiện áp dụng</span>
                    <p className="text-[10px] text-eco-ink leading-relaxed bg-eco-soft/50 p-2.5 rounded-xl border border-eco-primary/5">
                      {selectedVoucher.terms}
                    </p>
                  </div>
                )}

                {/* Point deduction calculation preview */}
                {wallet && !redeemSuccess && (
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-eco-soft border border-eco-primary/5 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[8px] text-eco-muted block font-bold uppercase">Số dư hiện tại</span>
                      <span className="font-extrabold text-eco-ink">{wallet.balance}</span>
                    </div>
                    <div className="text-red-500 font-extrabold flex items-center justify-center">
                      - {selectedVoucher.pointsCost}
                    </div>
                    <div>
                      <span className="text-[8px] text-eco-muted block font-bold uppercase">Số dư còn lại</span>
                      <span className="font-extrabold text-eco-accentGreenDeep">
                        {wallet.balance - selectedVoucher.pointsCost}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status messages */}
                {redeemError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-[10px] font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{redeemError}</span>
                  </div>
                )}

                {redeemSuccess && (
                  <div className="p-4 bg-eco-accentGreen/10 border border-eco-accentGreen/20 rounded-2xl flex flex-col items-center text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-eco-accentGreen" />
                    <div className="leading-tight">
                      <span className="text-xs font-black text-eco-accentGreenDeep block">Đổi điểm xanh thành công!</span>
                      <p className="text-[10px] text-eco-muted mt-1 leading-normal">
                        Mã voucher ưu đãi của bạn đã được khởi tạo an toàn:
                      </p>
                    </div>
                    
                    {/* Visual Code */}
                    <div className="py-2.5 px-6 bg-white border border-eco-primary/10 rounded-xl mt-2 select-all">
                      <span className="text-base font-black font-mono text-eco-primary tracking-widest uppercase">
                        {redeemSuccess.code}
                      </span>
                    </div>
                    <span className="text-[8px] text-eco-muted">Sao chép mã này để xuất trình trực tiếp khi sử dụng dịch vụ.</span>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-eco-primary/10 bg-eco-soft/40 flex space-x-3">
                {redeemSuccess ? (
                  <button
                    onClick={() => {
                      closeRedeemModal();
                      setActiveTab('my_vouchers');
                    }}
                    className="w-full py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center space-x-1"
                  >
                    <span>Xem ví voucher của tôi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      disabled={redeeming}
                      onClick={closeRedeemModal}
                      className="flex-1 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-eco-ink text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200"
                    >
                      Bỏ qua
                    </button>
                    <button
                      disabled={redeeming}
                      onClick={executeRedeem}
                      className="flex-1 py-2 bg-eco-primary hover:bg-eco-primaryDeep text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center space-x-1"
                    >
                      {redeeming ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          Đang đổi quà...
                        </>
                      ) : (
                        'Đồng ý đổi điểm'
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
