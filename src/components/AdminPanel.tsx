import React, { useState, useEffect } from 'react';
import { WaatehSystem, SupabaseConfig } from '../types';
import { 
  Building2, 
  Calculator, 
  Layers, 
  Boxes, 
  Snowflake, 
  Warehouse, 
  Wrench, 
  Globe, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  Database, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  Radio,
  Lock,
  Search,
  Eye
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  getSupabaseClient 
} from '../services/supabaseClient';
import { syncAllToSupabase } from '../services/systemsService';

interface AdminPanelProps {
  systems: WaatehSystem[];
  onBackToPortal: () => void;
  onSaveSystem: (system: Partial<WaatehSystem> & { title: string }) => Promise<void>;
  onDeleteSystem: (id: string) => Promise<void>;
  onReorderSystems: (systems: WaatehSystem[]) => Promise<void>;
  onResetToDefaults: () => Promise<void>;
  onRefreshData: () => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'Calculator', label: 'حسابداری/مالی', icon: Calculator },
  { name: 'Layers', label: 'پلتفرم/تولید', icon: Layers },
  { name: 'Boxes', label: 'انبار/لجستیک', icon: Boxes },
  { name: 'Snowflake', label: 'برودت/چیلر', icon: Snowflake },
  { name: 'Warehouse', label: 'انبار مرکزی', icon: Warehouse },
  { name: 'Wrench', label: 'فنی/تاسیسات', icon: Wrench },
  { name: 'Building2', label: 'سازمانی/ستادی', icon: Building2 },
  { name: 'Globe', label: 'وب‌سرویس عمومی', icon: Globe },
];

const PRESET_COLORS = [
  { color: '#b45309', label: 'مسی متالیک' },
  { color: '#d97706', label: 'مسی طلایی' },
  { color: '#0f766e', label: 'کبود سربی' },
  { color: '#0284c7', label: 'آبی سرمایشی' },
  { color: '#1e3a8a', label: 'سرمه‌ای تیره' },
  { color: '#475569', label: 'خاکستری اداری' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  systems,
  onBackToPortal,
  onSaveSystem,
  onDeleteSystem,
  onReorderSystems,
  onResetToDefaults,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'systems' | 'add' | 'supabase' | 'backup'>('systems');
  const [editingSystem, setEditingSystem] = useState<WaatehSystem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WaatehSystem>>({
    title: '',
    subtitle: '',
    url: '',
    category: 'مالی و اداری',
    icon: 'Building2',
    accent_color: '#b45309',
    system_code: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase Connection Settings State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  // Search filter inside admin
  const [adminSearch, setAdminSearch] = useState('');

  useEffect(() => {
    const cfg = getStoredSupabaseConfig();
    setSupabaseUrl(cfg.url || '');
    setSupabaseAnonKey(cfg.anonKey || '');
  }, []);

  const handleStartAdd = () => {
    setEditingSystem(null);
    setFormData({
      title: '',
      subtitle: '',
      url: '',
      category: 'مالی و اداری',
      icon: 'Building2',
      accent_color: '#b45309',
      system_code: '',
    });
    setActiveTab('add');
    setStatusMessage(null);
  };

  const handleStartEdit = (sys: WaatehSystem) => {
    setEditingSystem(sys);
    setFormData({
      id: sys.id,
      title: sys.title,
      subtitle: sys.subtitle,
      url: sys.url,
      category: sys.category,
      icon: sys.icon,
      accent_color: sys.accent_color,
      system_code: sys.system_code,
    });
    setActiveTab('add');
    setStatusMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setStatusMessage({ type: 'error', text: 'لطفاً عنوان سامانه را وارد کنید.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveSystem({
        id: formData.id,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        url: formData.url?.trim() || '',
        category: formData.category || 'سازمانی',
        icon: formData.icon || 'Building2',
        accent_color: formData.accent_color || '#b45309',
        system_code: formData.system_code || `SYS-${Date.now().toString().slice(-4)}`,
      });

      setStatusMessage({
        type: 'success',
        text: formData.id
          ? 'مشخصات سامانه با موفقیت ویرایش و در دیتابیس ثبت شد.'
          : 'سامانه جدید با موفقیت ایجاد و به دیتابیس سوپابیس اضافه گردید.',
      });

      setTimeout(() => {
        setActiveTab('systems');
        setEditingSystem(null);
      }, 1500);
    } catch {
      setStatusMessage({ type: 'error', text: 'خطا در ثبت سامانه در پایگاه داده.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= systems.length) return;

    const copy = [...systems];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    await onReorderSystems(copy);
  };

  const handleTestAndSaveSupabase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTestingSupabase(true);
    setSupabaseTestStatus({ status: 'idle', message: 'در حال بررسی اتصال به سرور سوپابیس...' });

    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    const client = getSupabaseClient();

    if (!client) {
      setIsTestingSupabase(false);
      setSupabaseTestStatus({
        status: 'error',
        message: 'لطفاً آدرس پروژه و کلید عمومی anon را کامل وارد نمایید.',
      });
      return;
    }

    try {
      const { data, error } = await client.from('systems').select('id').limit(1);
      if (error) {
        setSupabaseTestStatus({
          status: 'error',
          message: `خطای سوپابیس: ${error.message} (از ایجاد جدول systems اطمینان حاصل فرمایید)`,
        });
      } else {
        setSupabaseTestStatus({
          status: 'success',
          message: 'اتصال به دیتابیس ابری سوپابیس برقرار است و جدول systems شناسایی شد.',
        });
        await onRefreshData();
      }
    } catch (err: unknown) {
      setSupabaseTestStatus({
        status: 'error',
        message: err instanceof Error ? err.message : 'خطای ارتباط با سرور',
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingSupabase(true);
    const success = await syncAllToSupabase(systems);
    setIsSyncingSupabase(false);
    if (success) {
      setSupabaseTestStatus({
        status: 'success',
        message: `تمام ${systems.length} سامانه با موفقیت در دیتابیس ابری سوپابیس همگام‌سازی شدند.`,
      });
    } else {
      setSupabaseTestStatus({
        status: 'error',
        message: 'خطا در ارسال اطلاعات به سوپابیس.',
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(systems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `waateh-systems-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await onReorderSystems(parsed);
          alert('نسخه پشتیبان با موفقیت بازیابی شد.');
        } else {
          alert('قالب فایل نامعتبر است.');
        }
      } catch {
        alert('خطا در خواندن فایل JSON');
      }
    };
    reader.readAsText(file);
  };

  const filteredSystems = systems.filter((s) => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.url && s.url.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md border border-amber-500/30">
              <Lock className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">
                  پنل مدیریت سامانه‌های واته (Admin Console)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  سطح دسترسی مدیر ارشد
                </span>
              </div>
              <p className="text-xs text-slate-400">
                مدیریت سایت‌ها، پیکربندی سوپابیس و کنترل دسترسی پرتال عمومی
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToPortal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>مشاهده پرتال اصلی (خروج از ادمین)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('systems');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'systems'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>فهرست سامانه‌ها ({systems.length})</span>
            </button>

            <button
              type="button"
              onClick={handleStartAdd}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingSystem ? 'ویرایش سامانه' : 'افزودن سایت جدید'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('supabase');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'supabase'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 text-amber-500" />
              <span>اتصال سوپابیس (Supabase)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('backup');
                setStatusMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>پشتیبان‌گیری و بازنشانی</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium px-3 hidden md:block">
            سامانه‌های ذخیره‌شده: <span className="font-bold text-slate-800">{systems.length}</span> سامانه
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 transition animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: Systems List Management */}
        {activeTab === 'systems' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  مدیریت و مرتب‌سازی سامانه‌های پرتال
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تغییر اولویت، ویرایش آدرس، حذف و بررسی اتصال هر سامانه
                </p>
              </div>

              {/* Search in Admin */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="جستجو در سامانه‌ها..."
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>
            </div>

            {filteredSystems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                سامانه‌ای یافت نشد. می‌توانید با زدن دکمه «افزودن سایت جدید» سامانه دلخواه خود را ثبت کنید.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSystems.map((sys, idx) => (
                  <div
                    key={sys.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white flex flex-wrap items-center justify-between gap-4 transition shadow-2xs hover:shadow-xs"
                  >
                    {/* Left: Reorder & Actions */}
                    <div className="flex items-center gap-1.5 order-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        title="جابجایی به بالا"
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === filteredSystems.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        title="جابجایی به پایین"
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {sys.url && (
                        <a
                          href={sys.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="تست باز کردن سایت در برگه جدید"
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer inline-flex items-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(sys)}
                        title="ویرایش مشخصات"
                        className="p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`آیا از حذف سامانه «${sys.title}» اطمینان دارید؟`)) {
                            onDeleteSystem(sys.id);
                          }
                        }}
                        title="حذف سامانه"
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Right: Info */}
                    <div className="flex items-center gap-3 order-1 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${sys.accent_color}18`,
                          color: sys.accent_color,
                          borderColor: `${sys.accent_color}35`,
                        }}
                      >
                        {AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === sys.icon?.toLowerCase())?.icon ? (
                          React.createElement(
                            AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === sys.icon?.toLowerCase())!.icon,
                            { className: 'w-5 h-5' }
                          )
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">{sys.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {sys.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 truncate" dir="ltr">
                          {sys.url ? (
                            <span className="text-emerald-700 font-semibold">{sys.url}</span>
                          ) : (
                            <span className="text-amber-600 italic">بدون آدرس ثبت‌شده</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Add / Edit System Form */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto w-full">
            <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingSystem ? 'ویرایش سامانه سازمانی' : 'افزودن سایت / سامانه جدید'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  اطلاعات وارد شده به صورت لحظه‌ای در دیتابیس سوپابیس ذخیره و در پرتال منعکس خواهد شد.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('systems')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                بازگشت به فهرست
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    عنوان سامانه (فارسی / انگلیسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: پرتال بازرگانی / SAP Finance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    دسته‌بندی سامانه
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none bg-white"
                  >
                    <option value="مالی و اداری">مالی و اداری</option>
                    <option value="تولید و بازرگانی">تولید و بازرگانی</option>
                    <option value="لجستیک و انبار">لجستیک و انبار</option>
                    <option value="فنی و تاسیسات">فنی و تاسیسات</option>
                    <option value="مدیریت و کنترل پروژه">مدیریت و کنترل پروژه</option>
                    <option value="سامانه‌های هوش تجاری (BI)">سامانه‌های هوش تجاری (BI)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  آدرس اینترنتی یا پورت محلی (URL)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://mysystem.waateh.com یا localhost:3000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  توضیحات کوتاه / عملکرد سامانه
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="مثال: صدور فاکتور، پیگیری سفارشات و تسویه ارزی"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  انتخاب آیکون سامانه
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = formData.icon?.toLowerCase() === item.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setFormData({ ...formData, icon: item.name })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 text-amber-800 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] truncate max-w-full">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  رنگ سازمانی
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.color}
                      onClick={() => setFormData({ ...formData, accent_color: c.color })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition ${
                        formData.accent_color === c.color
                          ? 'border-slate-900 bg-slate-100 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSystem ? 'ذخیره تغییرات در دیتابیس' : 'ثبت سامانه در سوپابیس'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('systems')}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Supabase Configuration */}
        {activeTab === 'supabase' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto w-full">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-600" />
                <span>پیکربندی دیتابیس ابری سوپابیس (Supabase Real-time)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اتصال مستقیم به جدول systems در سرور ابری سوپابیس جهت همگام‌سازی دائمی و خودکار
              </p>
            </div>

            <form onSubmit={handleTestAndSaveSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  آدرس پروژه سوپابیس (Project URL)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کلید دسترسی عمومی (Anon Public Key)
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              {supabaseTestStatus.message && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                    supabaseTestStatus.status === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : supabaseTestStatus.status === 'error'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {supabaseTestStatus.status === 'success' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : supabaseTestStatus.status === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-500 shrink-0" />
                  )}
                  <span>{supabaseTestStatus.message}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isTestingSupabase}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isTestingSupabase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>ذخیره و تست اتصال</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isSyncingSupabase}
                  className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSyncingSupabase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>همگام‌سازی فوری دیتابیس</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: Backup & Reset */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto w-full">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                پشتیبان‌گیری، بازیابی و بازنشانی
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                خروجی گرفتن از تمام تنظیمات و سامانه‌ها در قالب فایل JSON جهت انتقال به سرور دیگر یا بازیابی سریع
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 mb-1">دانلود نسخه پشتیبان</h3>
                  <p className="text-[11px] text-slate-500">ذخیره تمام مشخصات سامانه‌ها در فایل JSON</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="mt-4 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فایل JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 mb-1">بازیابی نسخه پشتیبان</h3>
                  <p className="text-[11px] text-slate-500">بارگذاری فایل JSON قبلی و جایگزینی داده‌ها</p>
                </div>
                <label className="mt-4 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>انتخاب فایل و بازیابی</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-amber-900 mb-1">بازنشانی به پیش‌فرض</h3>
                  <p className="text-[11px] text-amber-800">برگشت به ۴ سامانه اولیه استاندارد واته</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('آیا از بازنشانی کلیه سامانه‌ها به ۴ سامانه استاندارد پیش‌فرض اطمینان دارید؟')) {
                      onResetToDefaults();
                    }
                  }}
                  className="mt-4 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بازنشانی به پیش‌فرض</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
