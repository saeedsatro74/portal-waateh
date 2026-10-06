import React, { useState, useEffect } from 'react';
import { getShamsiDateString, getFormattedTimeString } from '../utils/dateUtils';
import { 
  Search, 
  Database, 
  Maximize, 
  Minimize, 
  Calendar, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Lock,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isSupabaseConnected,
  onOpenSupabaseModal,
}) => {
  const [shamsiDate, setShamsiDate] = useState('');
  const [time, setTime] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Clock & Shamsi Date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(getFormattedTimeString(now));
      setShamsiDate(getShamsiDateString(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => console.log(err));
      }
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Right Section: Waateh Emblem & Brand Title */}
        <div className="flex items-center gap-3.5 shrink-0">
          {/* Waateh Geometric Monogram / Emblem */}
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-0.5 shadow-md flex items-center justify-center border border-amber-600/40">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {/* Subtle metallic copper accent line inside logo */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-500/30 rounded-full blur-xs"></div>
                <div className="font-extrabold text-amber-500 text-lg tracking-wider font-mono flex items-center">
                  <span>W</span>
                  <span className="text-[10px] text-amber-300 font-sans -mr-0.5">واته</span>
                </div>
              </div>
            </div>
            {/* Online status indicator */}
            <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight">
                پرتال یکپارچه سامانه‌های واته
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold border border-amber-200/80">
                نگارش سازمانی
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              Waateh Integrated Systems Portal &mdash; Executive C-Suite Dashboard
            </p>
          </div>
        </div>

        {/* Center: Search & Live Shamsi / Digital Clock */}
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-auto justify-center">
          {/* Quick Search Input */}
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-amber-700/70" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجوی سریع سامانه (نام، شناسه یا دسته‌بندی)..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Official Persian Date & Digital Live Clock */}
          <div className="hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs shrink-0 select-none">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-medium">{shamsiDate}</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-1 font-mono text-slate-900 font-bold tracking-wider" dir="ltr">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{time.hours}</span>
              <span className="animate-pulse text-amber-600">:</span>
              <span>{time.minutes}</span>
              <span className="text-[10px] text-slate-400">:{time.seconds}</span>
            </div>
          </div>
        </div>

        {/* Left Section: Supabase Badge, Manage Button, Fullscreen & CEO Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Supabase Connection Status Indicator */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            title="مشاهده وضعیت اتصال به سوپابیس و اسکریپت SQL"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              isSupabaseConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50/80 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'سوپابیس ابری: متصل' : 'دیتابیس سوپابیس'}
            </span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'خروج از حالت تمام‌صفحه' : 'نمایش تمام‌صفحه پرتال'}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* CEO Executive Profile Avatar */}
          <div className="flex items-center gap-2 pr-1 border-r border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-800 text-white font-bold flex items-center justify-center shadow-xs border border-amber-500/30 text-xs">
              مدیر
            </div>
            <div className="hidden lg:block text-right select-none">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>مدیریت عامل</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[10px] text-amber-800 font-medium">سازمان صنعتی واته</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
