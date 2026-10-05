import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Boxes, 
  Snowflake, 
  Calculator, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Thermometer, 
  Gauge, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface SimulatedSystemDashboardProps {
  systemCode?: string;
  title: string;
}

export const SimulatedSystemDashboard: React.FC<SimulatedSystemDashboardProps> = ({
  systemCode,
  title,
}) => {
  if (systemCode === 'FIN-SAP' || title.includes('حسابداری')) {
    return (
      <div className="w-full h-full bg-slate-900 text-slate-100 p-6 flex flex-col justify-between select-none">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>سامانه حسابداری مالی واته</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  سال مالی فعال ۱۴۰۵
                </span>
              </div>
              <div className="text-xs text-slate-400">SAP S/4HANA Waateh Enterprise Edition</div>
            </div>
          </div>
          <div className="text-left text-xs font-mono text-slate-400">
            <div>سند قطعی: #SAP-94821</div>
            <div className="text-emerald-400">وضعیت: تراز بالانس</div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">گردش کل بدهکار</div>
            <div className="text-lg font-bold text-white mt-1">۸۴,۲۵۰,۰۰۰,۰۰۰</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+۱۲.۴٪ نسبت به ماه قبل</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">گردش کل بستانکار</div>
            <div className="text-lg font-bold text-amber-400 mt-1">۸۴,۲۵۰,۰۰۰,۰۰۰</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>مغایرت صفر ریال</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">مانده نقد و بانک</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">۳۱,۱۸۰,۴۰۰,۰۰۰</div>
            <div className="text-[11px] text-slate-400">۵ حساب بانکی فعال</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">اسناد در انتظار تایید</div>
            <div className="text-lg font-bold text-amber-500 mt-1">۳ سند</div>
            <div className="text-[11px] text-amber-400">نیاز به امضای مدیر مالی</div>
          </div>
        </div>

        {/* Financial table */}
        <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800 p-3 overflow-hidden">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              دفتر روزنامه - ۵ تراکنش آخر خزانه‌داری
            </span>
            <span className="text-[11px] text-slate-500">همگام‌سازی لحظه‌ای با وب‌سرویس</span>
          </div>
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-2 font-normal">شماره سند</th>
                <th className="pb-2 font-normal">شرح حساب</th>
                <th className="pb-2 font-normal">مرکز هزینه</th>
                <th className="pb-2 font-normal">مبلغ (تومان)</th>
                <th className="pb-2 font-normal text-left">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 font-mono text-amber-400">#TR-8921</td>
                <td>تسویه فاکتور خرید شمش مس مس سرچشمه</td>
                <td>واحد ذوب و ریخته‌گری</td>
                <td className="font-semibold">۱۲,۸۰۰,۰۰۰,۰۰۰</td>
                <td className="text-left text-emerald-400">تایید نهایی</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-amber-400">#TR-8920</td>
                <td>حقوق و مزایای پرسنل فنی و اداری (شهریور)</td>
                <td>منابع انسانی مرکزی</td>
                <td className="font-semibold">۲,۴۵۰,۰۰۰,۰۰۰</td>
                <td className="text-left text-emerald-400">پرداخت شده</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-amber-400">#TR-8919</td>
                <td>خرید قطعات کمپرسور چیلر کریر واحد ۱</td>
                <td>تعمیرات و نگهداری (نت)</td>
                <td className="font-semibold">۴۹۵,۰۰۰,۰۰۰</td>
                <td className="text-left text-amber-400">در انتظار وصول</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (systemCode === 'CU-PLATFORM' || title.includes('پلتفرم مس')) {
    return (
      <div className="w-full h-full bg-slate-900 text-slate-100 p-6 flex flex-col justify-between select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>پلتفرم معاملات و زنجیره مس واته</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LME Live Sync
                </span>
              </div>
              <div className="text-xs text-slate-400">Waateh Copper Trading & Supply Hub</div>
            </div>
          </div>
          <div className="text-left text-xs font-mono text-slate-400">
            <div>نرخ بورس لندن: <span className="text-amber-400 font-bold">$9,842.50 / MT</span></div>
            <div className="text-emerald-400 flex items-center gap-1 justify-end">
              <TrendingUp className="w-3 h-3" />
              <span>+1.85% (خرید قوی)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">موجودی کاتد مس گرید A</div>
            <div className="text-lg font-bold text-amber-400 mt-1">۱,۲۴۰ تن</div>
            <div className="text-[11px] text-slate-400">ارزش کل: ۹۴۰ میلیارد تومان</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">سفارشات تحویل هفته</div>
            <div className="text-lg font-bold text-white mt-1">۴۸۰ تن</div>
            <div className="text-[11px] text-emerald-400">۸ حواله خروج صادر شده</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">نرخ پایه بورس کالا (کیلو)</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">۶۸۵,۵۰۰ ت</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+۳,۲۰۰ ت نسبت به دیروز</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">قراردادهای آتی باز</div>
            <div className="text-lg font-bold text-cyan-400 mt-1">۱۴ قرارداد</div>
            <div className="text-[11px] text-slate-400">پوشش ریسک ۱۰۰٪</div>
          </div>
        </div>

        <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800 p-3 overflow-hidden flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>مانیتورینگ تخصیص شمش و مفتول مس</span>
            <span className="text-emerald-400 text-[11px]">سامانه در وضعیت آنلاین و پایدار</span>
          </div>
          <div className="space-y-2 mt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>تخصیص خط تولید نورد اکستروژن</span>
                <span className="text-amber-400 font-bold">۸۵٪ تکمیل ظرفیت</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-amber-500 to-amber-700 rounded-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>آماده بارگیری انبار مرکزی</span>
                <span className="text-emerald-400 font-bold">۶۲٪ بارنامه آماده</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-700 rounded-full w-[62%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (systemCode === 'CU-WMS' || title.includes('انبارداری')) {
    return (
      <div className="w-full h-full bg-slate-900 text-slate-100 p-6 flex flex-col justify-between select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>سامانه مدیریت انبارداری هوشمند مس</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  RFID & Barcode Live
                </span>
              </div>
              <div className="text-xs text-slate-400">Waateh Copper Warehousing & Inventory System</div>
            </div>
          </div>
          <div className="text-left text-xs font-mono text-slate-400">
            <div>انبار مرکزی شماره ۳ (سوله A)</div>
            <div className="text-teal-400">اسکنرها فعال (۹ ایستگاه)</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">تعداد پالت‌های ثبت‌شده</div>
            <div className="text-lg font-bold text-teal-400 mt-1">۸۴۲ پالت</div>
            <div className="text-[11px] text-slate-400">دارای برچسب RFID فعال</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">ظرفیت اشغال شده</div>
            <div className="text-lg font-bold text-white mt-1">۷۴٪</div>
            <div className="text-[11px] text-emerald-400">۲۶۰ جایگاه خالی در رک‌ها</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">حواله ورودی امروز</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">۶ تریلی</div>
            <div className="text-[11px] text-slate-400">۱۵۰ تن مس تخلیه شده</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400">مغایرت انبارگردانی</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">۰.۰۰٪</div>
            <div className="text-[11px] text-emerald-400">آخرین بازرسی دیروز</div>
          </div>
        </div>

        <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800 p-3 overflow-hidden">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>آخرین جابجایی‌ها و رهگیری بچ‌های تولیدی</span>
            <span className="text-xs font-mono text-slate-400">Gate #2 ACTIVE</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400">بچ مس کاتد #CU-994</span>
              <span className="text-teal-400 font-bold mt-1">پالت ۴۸ - ردیف C</span>
              <span className="text-[10px] text-emerald-400">تایید QC واحد کنترل کیفی</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400">مفتول مس ۸ میلیمتر</span>
              <span className="text-amber-400 font-bold mt-1">پالت ۱۲ - آماده بارگیری</span>
              <span className="text-[10px] text-slate-400">حواله خروج #WH-512</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400">شمش مس آلیاژی</span>
              <span className="text-cyan-400 font-bold mt-1">پالت ۳۰ - انبار قرنطینه</span>
              <span className="text-[10px] text-amber-400">در انتظار آزمایشگاه متالورژی</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waateh Chiller Maintenance WebApp
  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 p-6 flex flex-col justify-between select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>وب‌اپلیکیشن مانیتورینگ و تعمیرات چیلر واته</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                SCADA IoT Online
              </span>
            </div>
            <div className="text-xs text-slate-400">Waateh Industrial Chiller HVAC & PM Maintenance</div>
          </div>
        </div>
        <div className="text-left text-xs font-mono text-slate-400">
          <div>چیلر مرکزی چندهسته‌ای Carrier 19XR</div>
          <div className="text-emerald-400">وضعیت کمپرسور: نرمال (COP: 5.8)</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 my-4">
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
            دمای آب رفت اواپراتور
          </div>
          <div className="text-lg font-bold text-sky-400 mt-1 font-mono">۶.۸ °C</div>
          <div className="text-[11px] text-emerald-400">ست‌پوینت مطلوب: ۷.۰ °C</div>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            فشار روغن کمپرسور
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">۳۸.۵ PSI</div>
          <div className="text-[11px] text-emerald-400">محدوده ایمن سازنده</div>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            آمپراژ الکتروموتور
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">۲۱۴ A</div>
          <div className="text-[11px] text-slate-400">بار کاری کمپرسور: ۷۲٪</div>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            سرویس دوره‌ای بعدی (PM)
          </div>
          <div className="text-lg font-bold text-amber-400 mt-1">۱۲ روز دیگر</div>
          <div className="text-[11px] text-slate-400">تعویض فیلتر درایر و روغن</div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800 p-3 overflow-hidden flex flex-col justify-between">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>دستورکارهای فعال تیم نگهداری و تعمیرات (نت)</span>
          <span className="text-[11px] text-sky-400">تکنسین کشیک: مهندس رضوانی</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">کالیبراسیون سنسورهای فشار دیسشارژ</div>
              <div className="text-[11px] text-slate-400">چیلر شماره ۲ - سالن تولید</div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              انجام شده
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">بازرسی ارتعاش‌سنجی یاتاقان موتور</div>
              <div className="text-[11px] text-slate-400">برنامه پایش وضعیت (CBM)</div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              در حال اقدام
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
