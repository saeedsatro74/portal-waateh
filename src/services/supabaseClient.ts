import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'waateh_supabase_url';
const STORAGE_KEY_KEY = 'waateh_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  return {
    url: localUrl !== null ? localUrl : envUrl,
    anonKey: localKey !== null ? localKey : envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
}

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();

  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentUrl = url;
    currentKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('دیتابیس سوپابیس متصل نیست. لطفاً مقادیر VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY را تنظیم کنید.');
  }
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function signOutAdmin() {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

export async function getAdminSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export function onAdminAuthStateChange(callback: (session: any) => void) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => {
    subscription.unsubscribe();
  };
}

export const SUPABASE_SQL_SCRIPT = `-- ========================================================
-- ۱. حذف جدول قبلی در صورت وجود (Drop Old Table)
-- ========================================================
DROP TABLE IF EXISTS public.systems CASCADE;

-- ========================================================
-- ۲. ایجاد جدول جدید سامانه‌ها (Create Clean Systems Table)
-- ========================================================
CREATE TABLE public.systems (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'سازمانی',
  icon TEXT DEFAULT 'Building2',
  accent_color TEXT DEFAULT '#b45309',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  system_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- ۳. امنیت در سطح سطر (RLS) - فقط ادمین لاگین‌شده مجاز به نوشتن است
-- ========================================================
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

-- الف: اجازه مشاهده عمومی (هم کاربران مهمان و هم لاگین‌شده)
DROP POLICY IF EXISTS "مشاهده عمومی سامانه‌ها" ON public.systems;
CREATE POLICY "مشاهده عمومی سامانه‌ها" ON public.systems
  FOR SELECT
  TO public
  USING (true);

-- ب: اجازه درج فقط برای کاربران احرازهویت‌شده در Supabase Auth
DROP POLICY IF EXISTS "فقط ادمین لاگین‌شده می‌تواند درج کند" ON public.systems;
CREATE POLICY "فقط ادمین لاگین‌شده می‌تواند درج کند" ON public.systems
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ج: اجازه ویرایش فقط برای کاربران احرازهویت‌شده
DROP POLICY IF EXISTS "فقط ادمین لاگین‌شده می‌تواند ویرایش کند" ON public.systems;
CREATE POLICY "فقط ادمین لاگین‌شده می‌تواند ویرایش کند" ON public.systems
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- د: اجازه حذف فقط برای کاربران احرازهویت‌شده
DROP POLICY IF EXISTS "فقط ادمین لاگین‌شده می‌تواند حذف کند" ON public.systems;
CREATE POLICY "فقط ادمین لاگین‌شده می‌تواند حذف کند" ON public.systems
  FOR DELETE
  TO authenticated
  USING (true);

-- ========================================================
-- ۴. فعال‌سازی تغییرات زنده بلادرنگ (Real-time Broadcast)
-- ========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.systems;

-- ========================================================
-- ۵. درج داده‌های ۴ سامانه اولیه پیش‌فرض
-- ========================================================
INSERT INTO public.systems (id, title, subtitle, url, category, icon, accent_color, sort_order, system_code)
VALUES 
  ('sys-1', 'حسابداری واته / SAP Waateh', 'مدیریت جامع حسابداری مالی، خزانه‌داری، بودجه و حقوق دستمزد', '', 'مالی و اداری', 'Calculator', '#b45309', 1, 'FIN-SAP'),
  ('sys-2', 'پلتفرم مس', 'مرکز مدیریت زنجیره تامین، قیمت‌گذاری و معاملات شمش مس', '', 'تولید و بازرگانی', 'Layers', '#d97706', 2, 'CU-PLATFORM'),
  ('sys-3', 'سامانه انبارداری مس', 'کنترل موجودی انبار مرکزی، بارنامه‌ها، بچ‌بندی و پالت‌های مس', '', 'لجستیک و انبار', 'Boxes', '#0f766e', 3, 'CU-WMS'),
  ('sys-4', 'وب‌اپلیکیشن تعمیرات چیلر واته', 'مانیتورینگ آنلاین، نگهداری پیشگیرانه (PM) و تعمیرات تاسیسات سرمایشی', '', 'فنی و تاسیسات', 'Snowflake', '#0284c7', 4, 'CHILLER-APP');
`;
