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
