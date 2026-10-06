import React, { useState, useRef, useEffect } from 'react';
import { WaatehSystem, GridAspectRatio } from '../types';
import { InlineSetupCard, getSystemIcon } from './InlineSetupCard';
import { SimulatedSystemDashboard } from './SimulatedSystemDashboard';
import { 
  ExternalLink, 
  Maximize2, 
  RotateCw, 
  Pencil, 
  MousePointer, 
  Globe, 
  Sparkles,
  Layers,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

interface SystemCardProps {
  system: WaatehSystem;
  aspectRatio: GridAspectRatio;
  onOpenFullscreen: (system: WaatehSystem) => void;
  onOpenEdit: (system: WaatehSystem) => void;
  onSaveUrl: (id: string, url: string) => Promise<void>;
  isAdmin?: boolean;
}

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  aspectRatio,
  onOpenFullscreen,
  onOpenEdit,
  onSaveUrl,
  isAdmin = false,
}) => {
  const [isInteractiveScroll, setIsInteractiveScroll] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [useSimulatedView, setUseSimulatedView] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(800);

  // Virtual desktop width
  const VIRTUAL_WIDTH = 1280;

  // Calculate transform scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentWidth = rect.width;
      const currentHeight = rect.height;

      if (currentWidth > 0) {
        const computedScale = currentWidth / VIRTUAL_WIDTH;
        setScale(computedScale);
        if (computedScale > 0) {
          setScaledHeight(currentHeight / computedScale);
        }
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [aspectRatio]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (system.url) {
      window.open(system.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleScroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInteractiveScroll((prev) => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEdit(system);
  };

  const handleToggleSimulated = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUseSimulatedView((prev) => !prev);
  };

  // If no URL and is Admin, render Inline Setup Card directly
  if (!system.url && isAdmin) {
    return (
      <div className="w-full h-full min-h-[380px] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <InlineSetupCard
          system={system}
          onSaveUrl={(url) => onSaveUrl(system.id, url)}
          onOpenEditModal={() => onOpenEdit(system)}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[380px] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
      {/* Top Header Bar of the Box */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between z-20 select-none">
        {/* Right side: Icon, Title & Category */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
            style={{ 
              backgroundColor: `${system.accent_color}18`, 
              color: system.accent_color || '#b45309',
              borderColor: `${system.accent_color}30`
            }}
          >
            {getSystemIcon(system.icon, 'w-4 h-4')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {system.title}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium shrink-0">
                {system.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono truncate" dir="ltr">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate">{system.url}</span>
            </div>
          </div>
        </div>

        {/* Left side: Action Buttons (Edit Pencil, Scroll Mode, Refresh, External, Fullscreen) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Internal Simulation Toggle */}
          <button
            type="button"
            onClick={handleToggleSimulated}
            title={useSimulatedView ? "نمایش آیفریم اصلی سایت" : "نمایش داشبورد داخلی سامانه"}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer border ${
              useSimulatedView
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Scroll Toggle */}
          <button
            type="button"
            onClick={handleToggleScroll}
            title={isInteractiveScroll ? 'غیرفعال‌سازی اسکرول مستقیم (حالت کلیک پرتال)' : 'فعال‌سازی اسکرول مستقیم داخل پیش‌نمایش'}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer border ${
              isInteractiveScroll 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          {/* Refresh preview */}
          <button
            type="button"
            onClick={handleRefresh}
            title="بازنشانی و رفرش پیش‌نمایش"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Open External Tab */}
          <button
            type="button"
            onClick={handleOpenExternal}
            title="باز کردن در برگه جدید مرورگر"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Edit pencil button (shown only in admin mode) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleEditClick}
              title="ویرایش مشخصات سامانه و آدرس"
              className="p-1.5 rounded-lg bg-white border border-amber-300/80 text-amber-700 hover:bg-amber-50 text-xs transition cursor-pointer font-medium"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Internal Fullscreen Modal Viewer */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullscreen(system);
            }}
            title="نمای تمام‌صفحه پرتال"
            className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 text-xs transition cursor-pointer shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        onClick={() => {
          if (!isInteractiveScroll) {
            onOpenFullscreen(system);
          }
        }}
        className={`flex-1 relative overflow-hidden bg-slate-900 ${
          isInteractiveScroll ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        {/* Virtual Desktop Scaled Wrapper */}
        <div
          className="absolute top-0 right-0 origin-top-right transition-transform"
          style={{
            width: `${VIRTUAL_WIDTH}px`,
            height: `${scaledHeight}px`,
            transform: `scale(${scale})`,
          }}
        >
          {useSimulatedView ? (
            <SimulatedSystemDashboard
              systemCode={system.system_code}
              title={system.title}
            />
          ) : (
            <iframe
              key={iframeKey}
              src={system.url}
              title={system.title}
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )}
        </div>

        {/* Click-through overlay when interactive scroll is OFF */}
        {!isInteractiveScroll && (
          <div className="absolute inset-0 bg-transparent z-10 group-hover:bg-slate-900/5 transition-colors flex items-center justify-center pointer-events-auto">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 pointer-events-none">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>کلیک برای نمایش تمام‌صفحه سامانه</span>
            </div>
          </div>
        )}

        {/* Notice badge if in interactive scroll mode */}
        {isInteractiveScroll && (
          <div className="absolute bottom-2 left-2 z-20 bg-emerald-700/90 text-white text-[10px] px-2.5 py-1 rounded-md shadow flex items-center gap-1.5 backdrop-blur-xs pointer-events-none select-none">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>حالت اسکرول و تعامل مستقیم فعال است</span>
          </div>
        )}
      </div>
    </div>
  );
};
