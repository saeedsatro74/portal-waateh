import React, { useState, useEffect } from 'react';
import { WaatehSystem } from './types';
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
import { 
  getStoredSupabaseConfig, 
  getAdminSession, 
  signOutAdmin, 
  onAdminAuthStateChange 
} from './services/supabaseClient';
import { Header } from './components/Header';
import { SystemCard } from './components/SystemCard';
import { FullscreenModalViewer } from './components/FullscreenModalViewer';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/LoginPage';
import { 
  Building2, 
  RefreshCw
} from 'lucide-react';

const checkIsAdminPath = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path.startsWith('/admin') ||
    hash === '#admin' ||
    hash.startsWith('#/admin') ||
    search.includes('view=admin')
  );
};

export function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminPath);
  const [adminSession, setAdminSession] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [systems, setSystems] = useState<WaatehSystem[]>(INITIAL_SYSTEMS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Drag & drop reorder state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Modals state
  const [fullscreenSystem, setFullscreenSystem] = useState<WaatehSystem | null>(null);

  // Sync Supabase Auth Session and URL path changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getAdminSession();
        setAdminSession(session);
      } catch (err) {
        console.warn('Error checking Supabase auth session:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    const unsubscribeAuth = onAdminAuthStateChange((session) => {
      setAdminSession(session);
    });

    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

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

  // Open Edit for specific system
  const handleOpenEdit = (_system?: WaatehSystem) => {
    // In public view, editing is disabled and managed via /admin
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

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = sourceIndexStr !== '' ? Number(sourceIndexStr) : draggedIndex;

    if (
      sourceIndex !== null &&
      sourceIndex !== targetIndex &&
      sourceIndex >= 0 &&
      sourceIndex < systems.length
    ) {
      const updated = [...systems];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);

      const reordered = updated.map((item, idx) => ({
        ...item,
        sort_order: idx + 1,
      }));

      setSystems(reordered);
      await handleReorderSystems(reordered);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleGoToAdmin = () => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      window.location.hash = 'admin';
    }
    setIsAdminRoute(true);
  };

  const handleBackToPortal = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
  };

  const handleAdminLogout = async () => {
    await signOutAdmin();
    setAdminSession(null);
  };

  // If on /admin route: require Supabase Auth
  if (isAdminRoute) {
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-mono">در حال بررسی نشست کاربری با سوپابیس...</p>
        </div>
      );
    }

    // If not logged in, show LoginPage
    if (!adminSession) {
      return (
        <LoginPage
          onSuccess={() => {
            getAdminSession().then(setAdminSession);
          }}
          onBackToPortal={handleBackToPortal}
        />
      );
    }

    // If logged in, show AdminPanel
    return (
      <AdminPanel
        systems={systems}
        onBackToPortal={handleBackToPortal}
        onLogout={handleAdminLogout}
        onSaveSystem={handleSaveSystem}
        onDeleteSystem={handleDeleteSystem}
        onReorderSystems={handleReorderSystems}
        onResetToDefaults={handleResetToDefaults}
        onRefreshData={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Header with Official Waateh Logo and zero buttons */}
      <Header />

      {/* 2. Main Dashboard: Full-bleed Edge-to-Edge 2x2 Grid for Maximum Screen Presence */}
      <main className="flex-1 w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 flex flex-col">
        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-medium">در حال بارگذاری سامانه‌های یکپارچه واته...</p>
          </div>
        ) : systems.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-slate-300">
            <Building2 className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-700">سامانه‌ای ثبت نشده است</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full flex-1">
            {systems.map((system, idx) => (
              <div 
                key={system.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`w-full h-full min-h-[460px] xl:min-h-[520px] 2xl:min-h-[600px] flex rounded-2xl transition-all duration-200 ${
                  draggedIndex === idx
                    ? 'opacity-40 scale-[0.98] ring-2 ring-dashed ring-amber-500'
                    : dragOverIndex === idx
                    ? 'ring-4 ring-amber-500/80 scale-[1.01] shadow-2xl z-20'
                    : 'hover:shadow-md'
                }`}
              >
                <SystemCard
                  system={system}
                  onOpenFullscreen={(sys) => setFullscreenSystem(sys)}
                  onOpenEdit={(sys) => handleOpenEdit(sys)}
                  onSaveUrl={handleSaveUrl}
                  isAdmin={false}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. Slim Edge-to-Edge Footer */}
      <footer className="w-full bg-white/80 border-t border-slate-200/80 py-1.5 px-4 text-center text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">پرتال سازمانی واته</span>
          <span>&mdash;</span>
          <span>سامانه متمرکز پایش عملیاتی</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Waateh Enterprise Systems
        </div>
      </footer>

      {/* 4. Fullscreen View Modal */}
      <FullscreenModalViewer
        system={fullscreenSystem}
        onClose={() => setFullscreenSystem(null)}
      />
    </div>
  );
}

export default App;
