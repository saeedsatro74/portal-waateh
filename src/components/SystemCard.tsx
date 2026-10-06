import React, { useState, useRef, useEffect } from 'react';
import { WaatehSystem, GridAspectRatio } from '../types';
import { InlineSetupCard, getSystemIcon } from './InlineSetupCard';
import { SimulatedSystemDashboard } from './SimulatedSystemDashboard';
import { 
  Pencil, 
  GripVertical,
  Maximize2
} from 'lucide-react';

interface SystemCardProps {
  system: WaatehSystem;
  aspectRatio?: GridAspectRatio;
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEdit(system);
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
    <div className="w-full h-full min-h-[460px] xl:min-h-[520px] 2xl:min-h-[580px] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
      {/* Top Header Bar of the Box */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between z-20 select-none">
        {/* Right side: Drag Handle, Icon, Title & Category */}
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="p-1 -mr-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-grab active:cursor-grabbing transition shrink-0"
            title="برای جابجایی جایگاه سامانه با موس بکشید و رها کنید (Drag & Drop)"
          >
            <GripVertical className="w-4 h-4" />
          </div>
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

        {/* Left side: Only admin edit button if in admin mode */}
        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleEditClick}
              title="ویرایش مشخصات سامانه و آدرس"
              className="p-1.5 rounded-lg bg-white border border-amber-300/80 text-amber-700 hover:bg-amber-50 text-xs transition cursor-pointer font-medium"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        onClick={() => onOpenFullscreen(system)}
        className="flex-1 relative overflow-hidden bg-slate-900 cursor-pointer"
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
          {system.url ? (
            <iframe
              src={system.url}
              title={system.title}
              className="w-full h-full border-0 bg-white pointer-events-none"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : (
            <SimulatedSystemDashboard
              systemCode={system.system_code}
              title={system.title}
            />
          )}
        </div>

        {/* Click-through overlay to open fullscreen on click */}
        <div className="absolute inset-0 bg-transparent z-10 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center pointer-events-auto">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>کلیک برای نمایش تمام‌صفحه</span>
          </div>
        </div>
      </div>
    </div>
  );
};
