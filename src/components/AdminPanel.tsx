import React, { useState } from 'react';
import { WaatehSystem } from '../types';
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
  ArrowRight, 
  Check, 
  AlertCircle, 
  ExternalLink,
  LogOut
} from 'lucide-react';

interface AdminPanelProps {
  systems: WaatehSystem[];
  onBackToPortal: () => void;
  onLogout: () => void;
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
  onLogout,
  onSaveSystem,
  onDeleteSystem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('مالی و اداری');
  const [icon, setIcon] = useState('Building2');
  const [accentColor, setAccentColor] = useState('#b45309');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStartEdit = (sys: WaatehSystem) => {
    setEditingId(sys.id);
    setTitle(sys.title);
    setSubtitle(sys.subtitle || '');
    setUrl(sys.url || '');
    setCategory(sys.category || 'مالی و اداری');
    setIcon(sys.icon || 'Building2');
    setAccentColor(sys.accent_color || '#b45309');
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setUrl('');
    setCategory('مالی و اداری');
    setIcon('Building2');
    setAccentColor('#b45309');
    setStatusMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'لطفاً عنوان سامانه را وارد کنید.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveSystem({
        id: editingId || undefined,
        title: title.trim(),
        subtitle: subtitle.trim(),
        url: url.trim(),
        category,
        icon,
        accent_color: accentColor,
        system_code: `SYS-${Date.now().toString().slice(-4)}`,
      });

      setStatusMessage({
        type: 'success',
        text: editingId ? 'سامانه با موفقیت ویرایش شد.' : 'سایت جدید با موفقیت اضافه شد.',
      });

      handleCancelEdit();
    } catch {
      setStatusMessage({ type: 'error', text: 'خطا در ثبت سامانه در پایگاه داده.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Clean Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            src="/logo-wateh.png"
            alt="واته"
            className="h-9 w-auto object-contain cursor-default"
          />
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            مدیریت سامانه‌ها
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToPortal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>مشاهده پرتال</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition cursor-pointer"
            title="خروج از حساب ادمین"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content: Add Site Form & List */}
      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col gap-8">
        
        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 transition ${
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

        {/* Form Card: Add / Edit Site */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                <span>{editingId ? 'ویرایش سامانه' : 'افزودن سایت جدید'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                مشخصات سایت را وارد کنید تا مستقیماً به پرتال اضافه شود.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                انصراف از ویرایش
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان سایت / سامانه *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: پرتال بازرگانی"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  دسته‌بندی
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none bg-white"
                >
                  <option value="مالی و اداری">مالی و اداری</option>
                  <option value="تولید و بازرگانی">تولید و بازرگانی</option>
                  <option value="لجستیک و انبار">لجستیک و انبار</option>
                  <option value="فنی و تاسیسات">فنی و تاسیسات</option>
                  <option value="مدیریت و کنترل پروژه">مدیریت و کنترل پروژه</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                آدرس اینترنتی سایت (URL)
              </label>
              <input
                type="text"
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                توضیحات کوتاه
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="توضیح کوتاه درباره سامانه"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>

            {/* Icon Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                آیکون سامانه
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon?.toLowerCase() === item.name.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setIcon(item.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 text-amber-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
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
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.color}
                    onClick={() => setAccentColor(c.color)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition ${
                      accentColor === c.color
                        ? 'border-slate-900 bg-slate-100 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px]">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>{editingId ? 'ذخیره تغییرات' : 'افزودن سایت'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Sites List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
            سامانه‌های فعلی ({systems.length})
          </h3>

          <div className="space-y-2.5">
            {systems.map((sys, idx) => (
              <div
                key={sys.id}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{sys.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
                      {sys.url || 'بدون آدرس'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {sys.url && (
                    <a
                      href={sys.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition"
                      title="باز کردن سایت"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStartEdit(sys)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                    title="ویرایش"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`آیا از حذف سامانه «${sys.title}» اطمینان دارید؟`)) {
                        onDeleteSystem(sys.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
