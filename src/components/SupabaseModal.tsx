import React, { useState, useEffect } from 'react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  getSupabaseClient 
} from '../services/supabaseClient';
import { WaatehSystem } from '../types';
import { syncAllToSupabase } from '../services/systemsService';
import { 
  Database, 
  X, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Radio
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSystems: WaatehSystem[];
  onSynced: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  currentSystems,
  onSynced,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult({ status: 'idle', message: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTesting(true);
    setTestResult({ status: 'idle', message: 'در حال بررسی اتصال به سوپابیس...' });

    saveSupabaseConfig(url, anonKey);
    const client = getSupabaseClient();

    if (!client) {
      setIsTesting(false);
      setTestResult({
        status: 'error',
        message: 'لطفاً آدرس پروژه (URL) و کلید دسترسی (Anon Key) را وارد کنید.',
      });
      return;
    }

    try {
      const { data, error } = await client.from('systems').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          setTestResult({
            status: 'error',
            message: 'اتصال به پروژه برقرار شد اما جدول systems یافت نشد! لطفاً اسکریپت SQL پایین را در سرور اجرا کنید.',
          });
        } else {
          setTestResult({
            status: 'error',
            message: `خطای سوپابیس: ${error.message}`,
          });
        }
      } else {
        setTestResult({
          status: 'success',
          message: 'اتصال به دیتابیس سوپابیس و جدول systems با موفقیت تایید شد. شنونده بلادرنگ فعال است.',
        });
      }
    } catch (err: unknown) {
      setTestResult({
        status: 'error',
        message: err instanceof Error ? err.message : 'خطای ارتباط با سرور سوپابیس',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    const success = await syncAllToSupabase(currentSystems);
    setIsSyncing(false);
    if (success) {
      setTestResult({
        status: 'success',
        message: `تعداد ${currentSystems.length} سامانه با موفقیت در دیتابیس سوپابیس ثبت و همگام‌سازی شد.`,
      });
      onSynced();
    } else {
      setTestResult({
        status: 'error',
        message: 'ارسال اطلاعات به سوپابیس با خطا مواجه شد. از ساخت جدول در سوپابیس اطمینان حاصل فرمایید.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                مدیریت اتصال دیتابیس ابری سوپابیس (Supabase)
              </h3>
              <p className="text-xs text-slate-400">
                ذخیره‌سازی پایدار و شنونده بلادرنگ (Postgres Real-time)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-right flex-1">
          {/* Status Banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950">
            <Radio className="w-5 h-5 text-amber-700 mt-0.5 shrink-0 animate-pulse" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block mb-0.5">همگام‌سازی دوطرفه بلادرنگ:</span>
              سامانه‌های واته با هر بار تغییر آدرس در هر نمایشگر یا داشبورد مدیریتی، فوراً بدون نیاز به رفرش صفحه از طریق کانال بلادرنگ سوپابیس در کل سازمان به‌روزرسانی می‌شوند.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                آدرس پروژه سوپابیس (Project URL)
              </label>
              <input
                type="text"
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                کلید دسترسی عمومی (Anon Public Key)
              </label>
              <input
                type="password"
                dir="ltr"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-slate-50/50"
              />
            </div>

            {testResult.message && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : testResult.status === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {testResult.status === 'success' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : testResult.status === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>ذخیره و تست اتصال سوپابیس</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncing}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>همگام‌سازی فوری دیتابیس</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
