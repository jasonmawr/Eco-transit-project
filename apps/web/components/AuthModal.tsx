'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [showResendCTA, setShowResendCTA] = useState(false);

  // Clear inputs, errors, and resend states on modal open/tab change
  useEffect(() => {
    setError(null);
    setResendSuccess(null);
    setShowSlowMessage(false);
    setShowResendCTA(false);
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setResendCooldown(0);
    }
  }, [isOpen, activeTab]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDemoFill = () => {
    setEmail('user@ecotransit.vn');
    setPassword('User@123456');
    setError(null);
    setShowResendCTA(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    setError(null);
    try {
      const data = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
      setResendSuccess(data.message || 'Yêu cầu gửi lại email xác thực thành công. Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      const isProduction = process.env.NODE_ENV === 'production';
      const isExpectedError = isProduction && (
        err.status === 429 ||
        err.status === 503 ||
        err.code === 'SMTP_NOT_CONFIGURED' ||
        err.code === 'EMAIL_DELIVERY_UNAVAILABLE'
      );
      if (!isExpectedError) {
        console.error(err);
      }
      if (err.cooldownRemaining && typeof err.cooldownRemaining === 'number') {
        setResendCooldown(err.cooldownRemaining);
      } else {
        const match = err.message.match(/(\d+)\s*giây/);
        if (match) {
          setResendCooldown(parseInt(match[1], 10));
        } else {
          setResendCooldown(60);
        }
      }
      setError(err.message || 'Yêu cầu gửi lại email xác thực thất bại.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(null);
    setLoading(true);
    setShowSlowMessage(false);
    setShowResendCTA(false);

    const slowTimer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 4000);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (activeTab === 'register') {
        if (data.verificationEmailSent === false) {
          setError('Tài khoản đã được tạo nhưng email xác minh chưa được gửi thành công. Đăng nhập để gửi lại email xác minh.');
        } else {
          setResendSuccess(data.message || 'Đăng ký tài khoản thành công. Vui lòng kiểm tra hộp thư để xác thực email.');
        }
        if (data.recoveryAvailable === true) {
          setShowResendCTA(true);
        }
        return;
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      const isProduction = process.env.NODE_ENV === 'production';
      const isExpectedError = isProduction && (
        err.status === 429 ||
        err.status === 401 ||
        err.status === 503 ||
        err.code === 'EMAIL_UNVERIFIED' ||
        err.code === 'SMTP_NOT_CONFIGURED' ||
        err.code === 'EMAIL_DELIVERY_UNAVAILABLE'
      );
      if (!isExpectedError) {
        console.error(err);
      }
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      if (err.code === 'EMAIL_UNVERIFIED' || err.recoveryAvailable === true) {
        setShowResendCTA(true);
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setShowSlowMessage(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-eco-ink/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-white border border-eco-mint rounded-3xl shadow-2xl overflow-hidden z-10 font-inter"
          >
            
            {/* Header branding block */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-eco-bgBeige via-white to-eco-mint/20 border-b border-eco-primary/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-eco-muted hover:bg-eco-mint/40 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-lg font-black tracking-tight text-eco-primary uppercase font-display-campaign">
                  Lướt Khói
                </span>
                <span className="text-lg font-black tracking-tight text-eco-accentGreen uppercase font-display-campaign">
                  Chạm Xanh
                </span>
              </div>
              <p className="text-xs text-eco-muted font-medium">Bắt đầu hành trình di chuyển xanh & tích điểm đô thị.</p>
            </div>

            {/* Content area */}
            <div className="p-6">
              
              {/* Tab Selector */}
              <div className="flex bg-eco-bgBeige/60 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-white text-eco-primary shadow-sm'
                      : 'text-eco-muted hover:text-eco-ink'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-white text-eco-primary shadow-sm'
                      : 'text-eco-muted hover:text-eco-ink'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold flex flex-col items-start gap-2">
                  <span className="flex items-center gap-1.5">⚠️ {error}</span>
                </div>
              )}

              {/* Resend Success Message */}
              {resendSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
                  ✓ {resendSuccess}
                </div>
              )}

              {/* Resend CTA */}
              {showResendCTA && (
                <div className="mb-4 flex items-center justify-start">
                  <button
                    type="button"
                    disabled={resendLoading || resendCooldown > 0}
                    onClick={handleResend}
                    className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-eco-primary hover:bg-eco-primaryDeep text-white transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? 'Đang gửi...' : resendCooldown > 0 ? `Gửi lại sau 00:${resendCooldown < 10 ? '0' : ''}${resendCooldown}` : 'Gửi lại email xác thực'}
                  </button>
                </div>
              )}

              {/* Slow loading helper progress message */}
              {loading && showSlowMessage && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-medium animate-pulse">
                  ℹ️ Dịch vụ đang khởi động. Việc gửi email có thể mất thêm một chút thời gian.
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-eco-muted uppercase tracking-wider mb-1">
                    Email hành khách
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-muted" />
                    <input
                      type="email"
                      required
                      placeholder="ten.nguoidung@ecotransit.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-eco-bgBeige/30 border border-eco-primary/10 rounded-xl focus:border-eco-primary focus:ring-1 focus:ring-eco-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-eco-muted uppercase tracking-wider mb-1">
                    Mật khẩu bảo mật
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-muted" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-eco-bgBeige/30 border border-eco-primary/10 rounded-xl focus:border-eco-primary focus:ring-1 focus:ring-eco-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Demo Convenience CTA */}
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-eco-primary/5 to-eco-accentGreen/5 border border-eco-mint/40 rounded-xl hover:from-eco-primary/10 hover:to-eco-accentGreen/10 transition-all text-[11px] font-bold text-eco-primary"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-eco-accentGreen" />
                    <span>Đăng nhập nhanh bằng tài khoản có sẵn</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 bg-eco-primary hover:bg-eco-primaryDeep text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md disabled:bg-eco-muted/30 disabled:text-eco-muted disabled:cursor-not-allowed transition-all duration-200 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : activeTab === 'login' ? (
                    'Đăng nhập ngay'
                  ) : (
                    'Đăng ký tài khoản'
                  )}
                </button>
              </form>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
