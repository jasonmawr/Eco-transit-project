'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch, getApiBaseUrl } from '../../lib/api';
import { CheckCircle, XCircle, RefreshCw, Mail, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('Đang xác thực địa chỉ email của bạn...');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Thiếu mã xác thực email hoặc liên kết không đúng định dạng.');
      return;
    }

    const verify = async () => {
      try {
        const res = await apiFetch('/api/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setStatus('success');
        setMessage(res.message || 'Xác thực tài khoản thành công!');
      } catch (err: any) {
        console.error('Verification failed:', err);
        setStatus('error');
        setMessage(err.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      // Prompt user for email if they are not logged in, or try resending to session account
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({}), // uses session account if authenticated
      });
      setResendStatus(res.message || 'Yêu cầu gửi lại email xác thực thành công.');
    } catch (err: any) {
      setResendStatus(err.message || 'Gửi lại email xác thực thất bại. Vui lòng đăng nhập lại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-900 border border-emerald-500/20 rounded-3xl p-8 text-center shadow-2xl relative z-10 text-white font-inter">
      {/* Decorative inner gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-3xl pointer-events-none" />

      {status === 'verifying' && (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20 animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-emerald-400">Đang xác thực</h3>
            <p className="text-xs text-white/60 mt-2 leading-relaxed font-semibold">
              Hệ thống đang kiểm tra chữ ký số của mã thông báo...
            </p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-400/30 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-wide text-emerald-400">Xác thực thành công!</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-semibold">
              {message}
            </p>
            <p className="text-[10px] text-white/40 pt-2 leading-normal">
              Chào mừng bạn đến với chiến dịch EcoTransit. Bây giờ bạn có thể mở trang cá nhân và bắt đầu thiết lập Avatar nhân vật di chuyển xanh của mình.
            </p>
          </div>
          <button
            onClick={() => {
              // Trigger route back to home with hash to open onboarding
              router.push('/#onboarding');
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Thiết lập Avatar nhân vật 🚀</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto border border-rose-400/30">
            <XCircle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-wide text-rose-400">Xác thực thất bại</h3>
            <p className="text-xs text-rose-100/80 leading-relaxed font-semibold">
              {message}
            </p>
          </div>
          
          <div className="border-t border-white/5 pt-4 space-y-3">
            <p className="text-[10px] text-white/50 leading-relaxed font-medium">
              Bạn có thể yêu cầu gửi lại email xác thực mới nếu link đã hết hạn (15 phút).
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-extrabold text-xs py-2.5 rounded-2xl transition-all flex items-center justify-center space-x-1.5"
            >
              {resending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              <span>{resending ? 'Đang gửi yêu cầu...' : 'Gửi lại email xác nhận'}</span>
            </button>
            {resendStatus && (
              <p className="text-[10px] font-bold text-yellow-300 italic pt-1">{resendStatus}</p>
            )}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-3 rounded-2xl transition-all"
          >
            Quay lại trang chủ
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 font-inter relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-teal-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      {/* Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-center py-6 relative z-10">
        <div className="flex items-center space-x-2 text-white font-black text-lg tracking-tight uppercase">
          <span>🌿 EcoTransit</span>
        </div>
      </header>

      {/* Content */}
      <section className="flex-grow flex items-center justify-center py-6">
        <Suspense fallback={
          <div className="text-center space-y-3 text-white">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs font-bold text-white/50">Đang tải...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto py-6 relative z-10 text-center">
        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">
          Chiến dịch di chuyển xanh Thành phố Hồ Chí Minh
        </p>
      </footer>
    </main>
  );
}
