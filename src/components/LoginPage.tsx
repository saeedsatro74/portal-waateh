import React, { useState } from 'react';
import { signInWithEmail } from '../services/supabaseClient';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  KeyRound,
  Building2
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToPortal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToPortal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('لطفاً ایمیل و کلمه عبور مدیر را وارد نمایید.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      await signInWithEmail(email, password);
      onSuccess();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('ایمیل یا کلمه عبور وارد شده نادرست است.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMessage('ایمیل کاربر در سوپابیس تایید نشده است. (گزینه Confirm Email را در داشبورد فعال کنید)');
      } else {
        setErrorMessage(msg || 'خطا در ورود. لطفاً اتصال سوپابیس و مشخصات را بررسی کنید.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-white font-sans text-right">
      
      {/* Return button */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToPortal}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-amber-500" />
          <span>بازگشت به پرتال عمومی واته</span>
        </button>
        <span className="text-[11px] font-mono text-slate-500">/admin/login</span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
        {/* Top copper accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

        {/* Brand Crest */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-md mb-3">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900">
            ورود به پنل مدیریت سامانه‌های واته
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            احراز هویت ابری سازمانی با Supabase Auth
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ایمیل مدیر سیستم (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="admin@waateh.com"
                className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              کلمه عبور (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                dir="ltr"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••••••"
                className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <span>در حال اعتبارسنجی با سوپابیس...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>ورود به سامانه مدیریت</span>
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            دسترسی به بخش مدیریت و تغییرات دیتابیس با استاندارد <strong>Row Level Security (RLS)</strong> محافظت می‌شود. بدون ورود موفق، هیچ مجوزی برای ثبت، ویرایش یا حذف سامانه‌ها صادر نمی‌گردد.
          </div>
        </div>
      </div>
    </div>
  );
};
