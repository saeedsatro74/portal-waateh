import React, { useState, useEffect, useMemo } from 'react';
import { WaatehSystem, GridAspectRatio } from './types';
import { 
  fetchSystems, 
  updateSystemUrl, 
  saveSystem, 
  deleteSystem, 
  reorderSystems, 
  INITIAL_SYSTEMS, 
  subscribeToRealtimeChanges,
  saveLocalCachedSystems
} from './services/systemsService';
import { getStoredSupabaseConfig } from './services/supabaseClient';
import { Header } from './components/Header';
import { SystemCard } from './components/SystemCard';
import { FullscreenModalViewer } from './components/FullscreenModalViewer';
import { ManageSystemsModal } from './components/ManageSystemsModal';
import { SupabaseModal } from './components/SupabaseModal';
import { 
  Grid2X2, 
  Square, 
  RectangleHorizontal, 
  Sliders, 
  Building2, 
  Layers, 
  Plus, 
  Info,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export function App() {
  const [systems, setSystems] = useState<WaatehSystem[]>(INITIAL_SYSTEMS);
  const [aspectRatio, setAspectRatio] = useState<GridAspectRatio>('4:3');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Modals state
  const [fullscreenSystem, setFullscreenSystem] = useState<WaatehSystem | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [manageModalTab, setManageModalTab] = useState<'list' | 'form'>('list');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [editingSystem, setEditingSystem] = useState<WaatehSystem | null>(null);

  // Load systems on mount
  const loadData = async () => {
    try {
      const res = await fetchSystems();
      setSystems(res.systems);
      setIsSupabaseConnected(res.source === 'supabase');
    } catch (e) {
      console.error('Failed to load systems', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check supabase configured state
    const cfg = getStoredSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      setIsSupabaseConnected(true);
    }

    // Subscribe to Postgres real-time events
    const unsubscribe = subscribeToRealtimeChanges(() => {
      console.log('Realtime update detected, reloading systems...');
      loadData();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Quick inline update URL
  const handleSaveUrl = async (systemId: string, url: string) => {
    const updated = await updateSystemUrl(systemId, url);
    setSystems(updated);
  };

  // Open Edit Modal for specific system
  const handleOpenEdit = (system: WaatehSystem) => {
    setEditingSystem(system);
    setManageModalTab('form');
    setIsManageModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingSystem(null);
    setManageModalTab('form');
    setIsManageModalOpen(true);
  };

  // CRUD operations
  const handleSaveSystem = async (systemData: Partial<WaatehSystem> & { title: string }) => {
    const updated = await saveSystem(systemData);
    setSystems(updated);
  };

  const handleDeleteSystem = async (id: string) => {
    if (window.confirm('آیا از حذف این سامانه سازمانی اطمینان دارید؟')) {
      const updated = await deleteSystem(id);
      setSystems(updated);
    }
  };

  const handleReorderSystems = async (reordered: WaatehSystem[]) => {
    const updated = await reorderSystems(reordered);
    setSystems(updated);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('آیا مایل به بازنشانی سامانه‌ها به ۴ سامانه پیش‌فرض استاندارد واته هستید؟')) {
      saveLocalCachedSystems(INITIAL_SYSTEMS);
      setSystems(INITIAL_SYSTEMS);
    }
  };

  // Unique categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(systems.map((s) => s.category).filter(Boolean)));
    return ['همه', ...cats];
  }, [systems]);

  // Filtered systems
  const filteredSystems = useMemo(() => {
    return systems.filter((sys) => {
      const matchesCategory = selectedCategory === 'همه' || sys.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        sys.title.toLowerCase().includes(q) ||
        (sys.subtitle && sys.subtitle.toLowerCase().includes(q)) ||
        (sys.system_code && sys.system_code.toLowerCase().includes(q)) ||
        (sys.category && sys.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [systems, selectedCategory, searchQuery]);

  // CSS class for aspect ratio
  const getAspectRatioClass = (ratio: GridAspectRatio) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square min-h-[460px]';
      case '16:10':
        return 'aspect-[16/10] min-h-[400px]';
      case '4:3':
      default:
        return 'aspect-[4/3] min-h-[440px]';
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenManageModal={() => {
          setEditingSystem(null);
          setManageModalTab('list');
          setIsManageModalOpen(true);
        }}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* 2. Executive Toolbar: Aspect Ratio Switcher & Filters */}
      <section className="bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Categories Pill Bar & Add button */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن سامانه جدید</span>
            </button>

            <span className="text-xs font-bold text-slate-500 ml-1 shrink-0">دسته‌بندی:</span>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Aspect Ratio Switcher & Active Count */}
          <div className="flex items-center gap-4">
            {/* Aspect Ratio Switcher */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">قالب باکس‌ها:</span>
              
              <button
                type="button"
                onClick={() => setAspectRatio('4:3')}
                title="مستطیل بزرگ (۴:۳)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  aspectRatio === '4:3'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span>۴:۳ (پیش‌فرض)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                title="مربعی (۱:۱)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>۱:۱ مربعی</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('16:10')}
                title="عریض (۱۶:۱۰)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  aspectRatio === '16:10'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <RectangleHorizontal className="w-3.5 h-3.5" />
                <span>۱۶:۱۰ عریض</span>
              </button>
            </div>

            {/* Active Systems Count Badge */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{filteredSystems.length} سامانه فعال</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Main Dashboard: 2x2 Grid */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-medium">در حال بارگذاری سامانه‌های یکپارچه واته...</p>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <Building2 className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-700">سامانه‌ای با این مشخصات یافت نشد</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              می‌توانید عبارت جستجو را تغییر دهید یا از طریق دکمه زیر سامانه جدید اضافه کنید.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('همه');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              نمایش همه سامانه‌ها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {filteredSystems.map((system) => (
              <div 
                key={system.id} 
                className={`w-full transition-all duration-200 ${getAspectRatioClass(aspectRatio)}`}
              >
                <SystemCard
                  system={system}
                  aspectRatio={aspectRatio}
                  onOpenFullscreen={(sys) => setFullscreenSystem(sys)}
                  onOpenEdit={(sys) => handleOpenEdit(sys)}
                  onSaveUrl={handleSaveUrl}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="w-full bg-slate-50/80 border-t border-slate-200/90 py-3 px-4 lg:px-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">پرتال سازمانی واته</span>
          <span>&mdash;</span>
          <span>سامانه متمرکز دسترسی مدیران ارشد و پایش عملیاتی</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>استاندارد امنیتی ISO/IEC 27001</span>
          <span>نسخه ۲.۴ سازمانی</span>
        </div>
      </footer>

      {/* 5. Modals */}
      {/* Fullscreen View Modal */}
      <FullscreenModalViewer
        system={fullscreenSystem}
        onClose={() => setFullscreenSystem(null)}
      />

      {/* Manage Systems CRUD Modal */}
      <ManageSystemsModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setEditingSystem(null);
        }}
        initialTab={manageModalTab}
        systems={systems}
        onSaveSystem={handleSaveSystem}
        onDeleteSystem={handleDeleteSystem}
        onReorderSystems={handleReorderSystems}
        onResetToDefaults={handleResetToDefaults}
        editingSystem={editingSystem}
        onClearEditingSystem={() => setEditingSystem(null)}
      />

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        currentSystems={systems}
        onSynced={loadData}
      />
    </div>
  );
}

export default App;
