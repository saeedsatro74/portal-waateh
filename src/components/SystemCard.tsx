import React, { useRef, useEffect, useState } from 'react';
import { WaatehSystem } from '../types';
import { InlineSetupCard, getSystemIcon } from './InlineSetupCard';
import { SimulatedSystemDashboard } from './SimulatedSystemDashboard';
import { Pencil, GripVertical, ExternalLink } from 'lucide-react';

interface SystemCardProps {
  system: WaatehSystem;
  onOpenFullscreen: (system: WaatehSystem) => void;
  onOpenEdit: (system: WaatehSystem) => void;
  onSaveUrl: (id: string, url: string) => Promise<void>;
  isAdmin?: boolean;
}

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  onOpenFullscreen,
  onOpenEdit,
  onSaveUrl,
  isAdmin = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [scaledHeight, setScaledHeight] = useState(900);

  // Virtual desktop standard width for scaled preview
  const VIRTUAL_WIDTH = 1280;

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
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEdit(system);
  };

  // If no URL and is Admin, render Inline Setup Card directly
  if (!system.url && isAdmin) {
    return (
      <div className="w-full h-full min-h-[460px] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        <InlineSetupCard
          system={system}
          onSaveUrl={(url) => onSaveUrl(system.id, url)}
          onOpenEditModal={() => onOpenEdit(system)}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => onOpenFullscreen(system)}
      className="w-full h-full min-h-[460px] sm:min-h-[500px] flex flex-col bg-slate-900 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group cursor-pointer relative"
      style={{
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top Preview Area (Fills the upper 78% of the card) */}
      <div 
        ref={containerRef}
        className="flex-1 w-full relative overflow-hidden bg-slate-950"
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

        {/* Hover Highlight Overlay */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/15 transition-colors duration-300 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-xl backdrop-blur-xs flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>مشاهده سامانه</span>
          </div>
        </div>

        {/* Grip Handle and Admin Edit on top corners */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <div 
            className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white/80 cursor-grab active:cursor-grabbing hover:text-white hover:bg-black/60 transition"
            title="برای جابجایی جایگاه با موس بکشید (Drag & Drop)"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleEditClick}
              title="ویرایش سامانه"
              className="p-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-600 text-white transition shadow"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Floating White Info Card (Exactly as in Reference Design) */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-100 select-none z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
            style={{ 
              backgroundColor: `${system.accent_color}14`, 
              color: system.accent_color || '#b45309',
              borderColor: `${system.accent_color}25`
            }}
          >
            {getSystemIcon(system.icon, 'w-5 h-5')}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight group-hover:text-amber-700 transition-colors">
              {system.title}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium" dir="ltr">
              {system.url || system.subtitle || 'آماده‌سازی دسترسی'}
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="سامانه متصل"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
