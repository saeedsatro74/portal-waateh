import React, { useState } from 'react';
import { WaatehSystem } from '../types';
import { getSystemIcon } from './InlineSetupCard';
import { SimulatedSystemDashboard } from './SimulatedSystemDashboard';
import { 
  ArrowRight, 
  ExternalLink, 
  RotateCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Globe, 
  X,
  LayoutDashboard,
  Maximize2
} from 'lucide-react';

interface FullscreenModalViewerProps {
  system: WaatehSystem | null;
  onClose: () => void;
}

export const FullscreenModalViewer: React.FC<FullscreenModalViewerProps> = ({
  system,
  onClose,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [useSimulatedView, setUseSimulatedView] = useState(false);

  if (!system) return null;

  const handleCopyUrl = () => {
    if (system.url) {
      navigator.clipboard.writeText(system.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      {/* Top Corporate Navigation & Address Bar */}
      <header className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        {/* Right side: Back button & System info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به پرتال واته</span>
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1"></div>

          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ 
                backgroundColor: `${system.accent_color}25`,
                color: system.accent_color || '#b45309',
                borderColor: `${system.accent_color}50`
              }}
            >
              {getSystemIcon(system.icon, 'w-4 h-4')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">{system.title}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {system.category}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block truncate max-w-sm">
                {system.subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive Enterprise Address Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="w-full flex items-center bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
            <span className="flex-1 truncate text-left" dir="ltr">
              {system.url || 'آدرس تنظیم نشده'}
            </span>
            {system.url && (
              <button
                type="button"
                onClick={handleCopyUrl}
                title="کپی آدرس"
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Left: Tools and Close */}
        <div className="flex items-center gap-2">
          {/* Switch View Toggle */}
          <button
            type="button"
            onClick={() => setUseSimulatedView((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              useSimulatedView
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {useSimulatedView ? 'نمایش لایو آدرس' : 'داشبورد اختصاصی سامانه'}
            </span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            title="بارگذاری مجدد"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Open in external tab */}
          {system.url && (
            <a
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              title="باز کردن در برگه جداگانه"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer inline-flex items-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            title="بستن پنجره"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 bg-white relative overflow-hidden">
        {useSimulatedView || !system.url ? (
          <div className="w-full h-full">
            <SimulatedSystemDashboard
              systemCode={system.system_code}
              title={system.title}
            />
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={system.url || undefined}
            title={system.title}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        )}
      </main>
    </div>
  );
};
