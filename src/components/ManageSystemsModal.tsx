import React, { useState } from 'react';
import { WaatehSystem } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Upload, 
  RotateCcw, 
  Pencil, 
  Check, 
  Globe, 
  Sparkles,
  Building2,
  Calculator,
  Layers,
  Boxes,
  Warehouse,
  Snowflake,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { INITIAL_SYSTEMS } from '../services/systemsService';

interface ManageSystemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: WaatehSystem[];
  onSaveSystem: (system: Partial<WaatehSystem> & { title: string }) => Promise<void>;
  onDeleteSystem: (id: string) => Promise<void>;
  onReorderSystems: (systems: WaatehSystem[]) => Promise<void>;
  onResetToDefaults: () => Promise<void>;
  editingSystem?: WaatehSystem | null;
  onClearEditingSystem: () => void;
  initialTab?: 'list' | 'form';
}

const AVAILABLE_ICONS = [
  { name: 'Calculator', label: 'حسابداری/ماشین‌حساب', icon: Calculator },
  { name: 'Layers', label: 'لایه‌ها/پلتفرم', icon: Layers },
  { name: 'Boxes', label: 'بسته‌ها/انبار', icon: Boxes },
  { name: 'Snowflake', label: 'برودت/چیلر', icon: Snowflake },
  { name: 'Warehouse', label: 'انبار مرکزی', icon: Warehouse },
  { name: 'Wrench', label: 'فنی/تعمیرات', icon: Wrench },
  { name: 'Building2', label: 'سازمان مرکزی', icon: Building2 },
  { name: 'Globe', label: 'وب‌سرویس', icon: Globe },
];

const PRESET_COLORS = [
  { color: '#b45309', label: 'مسی متالیک' },
  { color: '#d97706', label: 'مسی طلایی' },
  { color: '#0f766e', label: 'کبود سربی' },
  { color: '#0284c7', label: 'آبی سرمایشی' },
  { color: '#1e3a8a', label: 'سرمه‌ای تیره' },
  { color: '#475569', label: 'خاکستری اداری' },
];

export const ManageSystemsModal: React.FC<ManageSystemsModalProps> = ({
  isOpen,
  onClose,
  systems,
  onSaveSystem,
  onDeleteSystem,
  onReorderSystems,
  onResetToDefaults,
  editingSystem,
  onClearEditingSystem,
  initialTab = 'list',
}) => {
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
  const [activeTab, setActiveTab] = useState<'list' | 'form'>(initialTab);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load editing system into form or handle initialTab
  React.useEffect(() => {
    if (isOpen) {
      if (editingSystem) {
        setFormData({
          id: editingSystem.id,
          title: editingSystem.title,
          subtitle: editingSystem.subtitle,
          url: editingSystem.url,
          category: editingSystem.category,
          icon: editingSystem.icon,
          accent_color: editingSystem.accent_color,
          system_code: editingSystem.system_code,
        });
        setActiveTab('form');
      } else {
        setActiveTab(initialTab);
        if (initialTab === 'form') {
          setFormData({
            title: '',
            subtitle: '',
            url: '',
            category: 'مالی و اداری',
            icon: 'Building2',
            accent_color: '#b45309',
            system_code: '',
          });
        }
      }
    }
  }, [isOpen, editingSystem, initialTab]);

  if (!isOpen) return null;

  const handleStartNew = () => {
    onClearEditingSystem();
    setFormData({
      title: '',
      subtitle: '',
      url: '',
      category: 'مالی و اداری',
      icon: 'Building2',
      accent_color: '#b45309',
      system_code: '',
    });
    setActiveTab('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

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
      setSaveSuccessMsg(
        formData.id
          ? 'مشخصات سامانه با موفقیت ذخیره و به‌روزرسانی شد.'
          : 'سامانه جدید با موفقیت اضافه شد و به دیتابیس سوپابیس ارسال گردید.'
      );
      setActiveTab('list');
      onClearEditingSystem();
      setTimeout(() => setSaveSuccessMsg(''), 5000);
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                مرکز مدیریت و پیکربندی سامانه‌های واته
              </h3>
              <p className="text-xs text-slate-400">
                افزودن، ویرایش، جابجایی ترتیب و پشتیبان‌گیری
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                onClearEditingSystem();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              فهرست سامانه‌ها ({systems.length})
            </button>
            <button
              type="button"
              onClick={handleStartNew}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{formData.id ? 'ویرایش سامانه' : 'افزودن سامانه جدید'}</span>
            </button>
          </div>

          {/* Backup & Reset buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportJson}
              title="دانلود فایل نسخه پشتیبان JSON"
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs transition cursor-pointer inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">پشتیبان</span>
            </button>

            <label
              title="بازیابی فایل پشتیبان JSON"
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs transition cursor-pointer inline-flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">بازیابی</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onResetToDefaults}
              title="بازنشانی به ۴ سامانه اولیه استاندارد واته"
              className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs transition cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">بازنشانی پیش‌فرض</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {saveSuccessMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-3">
              {systems.map((sys, idx) => (
                <div
                  key={sys.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between gap-4 transition shadow-xs"
                >
                  {/* Left: Reorder buttons & Edit/Delete */}
                  <div className="flex items-center gap-1.5 order-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      title="انتقال به بالا"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === systems.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      title="انتقال به پایین"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(sys);
                        setActiveTab('form');
                      }}
                      title="ویرایش"
                      className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSystem(sys.id)}
                      title="حذف سامانه"
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Info */}
                  <div className="flex items-center gap-3 order-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ 
                        backgroundColor: `${sys.accent_color}15`,
                        color: sys.accent_color,
                        borderColor: `${sys.accent_color}30`
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
                      <div className="text-xs text-slate-500 truncate" dir="ltr">
                        {sys.url ? sys.url : <span className="text-amber-600 italic">بدون آدرس (آماده ثبت مستقیم)</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Form Tab */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان سامانه *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: حسابداری واته / SAP Waateh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دسته‌بندی</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                  >
                    <option value="مالی و اداری">مالی و اداری</option>
                    <option value="تولید و بازرگانی">تولید و بازرگانی</option>
                    <option value="لجستیک و انبار">لجستیک و انبار</option>
                    <option value="فنی و تاسیسات">فنی و تاسیسات</option>
                    <option value="مرکزی و مدیریت">مرکزی و مدیریت</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">آدرس اینترنتی یا پورت محلی (URL)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://... یا خالی جهت درج از طریق باکس سریع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شرح کوتاه / زیرعنوان سامانه</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="مثال: مدیریت جامع مالی، خزانه‌داری و صدور اسناد"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">انتخاب نشان گرافیکی (Icon)</label>
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
                            ? 'bg-amber-100 border-amber-500 text-amber-800'
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

              {/* Color selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">رنگ سازمانی اختصاصی</label>
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

              {/* Form buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{formData.id ? 'ذخیره تغییرات سامانه' : 'افزودن به پرتال'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    onClearEditingSystem();
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
