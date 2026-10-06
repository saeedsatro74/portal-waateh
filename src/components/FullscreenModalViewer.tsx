import React from 'react';
import { WaatehSystem } from '../types';
import { getSystemIcon } from './InlineSetupCard';
import { SimulatedSystemDashboard } from './SimulatedSystemDashboard';
import { ArrowRight } from 'lucide-react';

interface FullscreenModalViewerProps {
  system: WaatehSystem | null;
  onClose: () => void;
}

export const FullscreenModalViewer: React.FC<FullscreenModalViewerProps> = ({
  system,
  onClose,
}) => {
  if (!system) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-150">
      {/* Top Header Bar: Only Title on one side and Return button on the other side */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between select-none shadow-md">
        {/* Right side: System info */}
        <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">{system.title}</span>
            {system.category && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {system.category}
              </span>
            )}
          </div>
        </div>

        {/* Left side: ONLY Return button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به پرتال</span>
        </button>
      </header>

      {/* Main View Area */}
      <main className="flex-1 bg-white relative overflow-hidden">
        {system.url ? (
          <iframe
            src={system.url}
            title={system.title}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        ) : (
          <div className="w-full h-full">
            <SimulatedSystemDashboard
              systemCode={system.system_code}
              title={system.title}
            />
          </div>
        )}
      </main>
    </div>
  );
};
