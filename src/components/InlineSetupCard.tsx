import React, { useState } from 'react';
import { WaatehSystem } from '../types';
import { 
  Building2, 
  Calculator, 
  Coins, 
  Layers, 
  Boxes, 
  Warehouse, 
  Snowflake, 
  Wrench, 
  Globe, 
  Check, 
  Database,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface InlineSetupCardProps {
  system: WaatehSystem;
  onSaveUrl: (url: string) => Promise<void>;
  onOpenEditModal: () => void;
}

export const getSystemIcon = (iconName: string, className = 'w-6 h-6') => {
  switch (iconName?.toLowerCase()) {
    case 'calculator':
      return <Calculator className={className} />;
    case 'coins':
      return <Coins className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'boxes':
      return <Boxes className={className} />;
    case 'warehouse':
      return <Warehouse className={className} />;
    case 'snowflake':
      return <Snowflake className={className} />;
    case 'wrench':
      return <Wrench className={className} />;
    default:
      return <Building2 className={className} />;
  }
};

export const InlineSetupCard: React.FC<InlineSetupCardProps> = ({
  system,
  onSaveUrl,
  onOpenEditModal,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) {
      setErrorMsg('لطفاً آدرس سامانه (URL) را وارد کنید');
      return;
    }
    
    // Add protocol if missing
    let finalUrl = cleanUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSaveUrl(finalUrl);
    } catch {
      setErrorMsg('خطا در ذخیره‌سازی آدرس');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (presetUrl: string) => {
    setInputUrl(presetUrl);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-amber-50/40 p-6 flex flex-col justify-between items-center text-center relative overflow-hidden border border-slate-200/80 rounded-2xl shadow-sm">
      {/* Decorative top metallic accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: system.accent_color || '#b45309' }}
      />

      {/* Top Badges */}
      <div className="w-full flex items-center justify-between text-xs pt-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-800 font-medium border border-amber-300/50">
          <Database className="w-3.5 h-3.5 text-amber-700" />
          <span>ثبت‌شده در سوپابیس</span>
        </span>
        <span className="font-mono text-slate-400 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
          {system.system_code || 'WAATEH-SYS'}
        </span>
      </div>

      {/* Center Identity Section */}
      <div className="my-auto max-w-md w-full flex flex-col items-center">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md border"
          style={{ 
            backgroundColor: `${system.accent_color}15`, 
            color: system.accent_color || '#b45309',
            borderColor: `${system.accent_color}35`
          }}
        >
          {getSystemIcon(system.icon, 'w-8 h-8')}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {system.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 max-w-sm mb-4 leading-relaxed">
          {system.subtitle || 'جهت دسترسی به داشبورد و پیش‌نمایش زنده، آدرس وب‌سایت یا پورت محلی سامانه را وارد نمایید.'}
        </p>

        {/* Direct URL Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-2.5">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4 text-amber-600" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="مثال: https://crm.waateh.com یا localhost:3000"
              dir="ltr"
              className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono transition-all shadow-inner"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-600 text-right">{errorMsg}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer hover:shadow hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
              style={{ backgroundColor: system.accent_color || '#b45309' }}
            >
              {isSubmitting ? (
                <span>در حال ثبت...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ثبت در دیتابیس</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenEditModal}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
              title="تنظیمات پیشرفته سامانه"
            >
              ویرایش کامل
            </button>
          </div>
        </form>

        {/* Quick presets for executive ease */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <span>پیشنهاد سریع:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('https://example.com')}
            className="text-amber-700 hover:underline px-1.5 py-0.5 rounded bg-amber-50/80 border border-amber-200/50 cursor-pointer"
          >
            تست دمو (example.com)
          </button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2.5 mt-2">
        <span className="flex items-center gap-1 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>پروتکل امن سازمانی واته</span>
        </span>
        <span className="text-slate-400">دسته‌بندی: {system.category}</span>
      </div>
    </div>
  );
};
