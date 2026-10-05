import { WaatehSystem } from '../types';
import { getSupabaseClient } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

const STORAGE_KEY_SYSTEMS = 'waateh_portal_systems_cache';

export const INITIAL_SYSTEMS: WaatehSystem[] = [
  {
    id: 'sys-fin-sap-1',
    title: 'حسابداری واته / SAP Waateh',
    subtitle: 'مدیریت جامع حسابداری مالی، خزانه‌داری، صدور اسناد و گزارشات ترازنامه',
    url: '',
    category: 'مالی و اداری',
    icon: 'Calculator',
    accent_color: '#b45309', // metallic copper
    sort_order: 1,
    is_active: true,
    system_code: 'FIN-SAP',
  },
  {
    id: 'sys-copper-plat-2',
    title: 'پلتفرم مس',
    subtitle: 'مرکز مدیریت زنجیره ارزش، نظارت بر نرخ‌های جهانی و معاملات شمش مس',
    url: '',
    category: 'تولید و بازرگانی',
    icon: 'Layers',
    accent_color: '#d97706', // warm amber copper
    sort_order: 2,
    system_code: 'CU-PLATFORM',
    is_active: true,
  },
  {
    id: 'sys-copper-wms-3',
    title: 'سامانه انبارداری مس',
    subtitle: 'رهگیری بارنامه‌ها، بسته‌بندی پالت‌ها، صدور حواله خروج و مانیتورینگ موجودی',
    url: '',
    category: 'لجستیک و انبار',
    icon: 'Boxes',
    accent_color: '#0f766e', // metallic teal-slate
    sort_order: 3,
    system_code: 'CU-WMS',
    is_active: true,
  },
  {
    id: 'sys-chiller-app-4',
    title: 'وب‌اپلیکیشن تعمیرات چیلر واته',
    subtitle: 'سامانه مانیتورینگ آنلاین، نگهداری پیشگیرانه (PM) و تعمیرات تاسیسات سرمایشی',
    url: '',
    category: 'فنی و تاسیسات',
    icon: 'Snowflake',
    accent_color: '#0284c7', // cool chiller cyan-blue
    sort_order: 4,
    system_code: 'CHILLER-APP',
    is_active: true,
  },
];

// Helper to get local cache
export function getLocalCachedSystems(): WaatehSystem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYSTEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      }
    }
  } catch (err) {
    console.error('Error reading systems cache', err);
  }
  return INITIAL_SYSTEMS;
}

export function saveLocalCachedSystems(systems: WaatehSystem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SYSTEMS, JSON.stringify(systems));
  } catch (err) {
    console.error('Error saving systems cache', err);
  }
}

// Fetch systems from Supabase or fallback
export async function fetchSystems(): Promise<{
  systems: WaatehSystem[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  const client = getSupabaseClient();
  const cached = getLocalCachedSystems();

  if (!client) {
    return { systems: cached, source: 'local' };
  }

  try {
    const { data, error } = await client
      .from('systems')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetch failed, using local cache:', error.message);
      return { systems: cached, source: 'local', error: error.message };
    }

    if (data && data.length > 0) {
      const mapped: WaatehSystem[] = data.map((item) => ({
        id: item.id?.toString() || `sys-${Date.now()}`,
        title: item.title || '',
        subtitle: item.subtitle || '',
        url: item.url || '',
        category: item.category || 'سازمانی',
        icon: item.icon || 'Building2',
        accent_color: item.accent_color || '#b45309',
        sort_order: Number(item.sort_order ?? 0),
        is_active: item.is_active ?? true,
        system_code: item.system_code,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      saveLocalCachedSystems(mapped);
      return { systems: mapped, source: 'supabase' };
    } else {
      // Supabase table is empty, seed it with initial systems!
      await syncAllToSupabase(cached);
      return { systems: cached, source: 'supabase' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای ارتباط با سرور';
    return { systems: cached, source: 'local', error: message };
  }
}

// Quick inline update URL
export async function updateSystemUrl(
  systemId: string,
  newUrl: string
): Promise<WaatehSystem[]> {
  const systems = getLocalCachedSystems();
  const updated = systems.map((sys) =>
    sys.id === systemId
      ? { ...sys, url: newUrl.trim(), updated_at: new Date().toISOString() }
      : sys
  );
  saveLocalCachedSystems(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('systems')
        .update({ url: newUrl.trim(), updated_at: new Date().toISOString() })
        .eq('id', systemId);
    } catch (e) {
      console.error('Supabase update URL failed', e);
    }
  }

  return updated;
}

// Save or Update Full System
export async function saveSystem(
  system: Partial<WaatehSystem> & { title: string }
): Promise<WaatehSystem[]> {
  let systems = getLocalCachedSystems();
  const now = new Date().toISOString();
  const client = getSupabaseClient();

  if (system.id) {
    // Edit existing
    systems = systems.map((s) =>
      s.id === system.id
        ? ({ ...s, ...system, updated_at: now } as WaatehSystem)
        : s
    );
    saveLocalCachedSystems(systems);

    if (client) {
      try {
        await client
          .from('systems')
          .update({
            title: system.title,
            subtitle: system.subtitle ?? '',
            url: system.url ?? '',
            category: system.category ?? 'سازمانی',
            icon: system.icon ?? 'Building2',
            accent_color: system.accent_color ?? '#b45309',
            sort_order: system.sort_order,
            is_active: system.is_active ?? true,
            system_code: system.system_code ?? '',
            updated_at: now,
          })
          .eq('id', system.id);
      } catch (e) {
        console.error('Supabase update failed', e);
      }
    }
  } else {
    // Add new
    const newId = `sys-${Date.now()}`;
    const newSys: WaatehSystem = {
      id: newId,
      title: system.title,
      subtitle: system.subtitle || '',
      url: system.url || '',
      category: system.category || 'سازمانی',
      icon: system.icon || 'Building2',
      accent_color: system.accent_color || '#b45309',
      sort_order: systems.length + 1,
      is_active: system.is_active ?? true,
      system_code: system.system_code || `SYS-${Date.now().toString().slice(-4)}`,
      created_at: now,
      updated_at: now,
    };

    if (client) {
      try {
        // Try insert with newId
        const { data, error } = await client
          .from('systems')
          .insert([
            {
              id: newId,
              title: newSys.title,
              subtitle: newSys.subtitle,
              url: newSys.url,
              category: newSys.category,
              icon: newSys.icon,
              accent_color: newSys.accent_color,
              sort_order: newSys.sort_order,
              is_active: newSys.is_active,
              system_code: newSys.system_code,
              created_at: now,
              updated_at: now,
            },
          ])
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert with id failed, retrying auto-id:', error.message);
          // Retry without explicit ID in case PostgreSQL table has UUID constraint
          const fallback = await client
            .from('systems')
            .insert([
              {
                title: newSys.title,
                subtitle: newSys.subtitle,
                url: newSys.url,
                category: newSys.category,
                icon: newSys.icon,
                accent_color: newSys.accent_color,
                sort_order: newSys.sort_order,
                is_active: newSys.is_active,
                system_code: newSys.system_code,
                created_at: now,
                updated_at: now,
              },
            ])
            .select()
            .single();

          if (fallback.data?.id) {
            newSys.id = fallback.data.id.toString();
          }
        } else if (data?.id) {
          newSys.id = data.id.toString();
        }
      } catch (e) {
        console.error('Supabase insert failed', e);
      }
    }

    systems.push(newSys);
    saveLocalCachedSystems(systems);
  }

  return systems;
}

// Delete System
export async function deleteSystem(systemId: string): Promise<WaatehSystem[]> {
  let systems = getLocalCachedSystems();
  systems = systems.filter((s) => s.id !== systemId);
  saveLocalCachedSystems(systems);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('systems').delete().eq('id', systemId);
    } catch (e) {
      console.error('Supabase delete failed', e);
    }
  }

  return systems;
}

// Reorder systems
export async function reorderSystems(systems: WaatehSystem[]): Promise<WaatehSystem[]> {
  const updated = systems.map((sys, idx) => ({
    ...sys,
    sort_order: idx + 1,
  }));
  saveLocalCachedSystems(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      for (const sys of updated) {
        await client
          .from('systems')
          .update({ sort_order: sys.sort_order })
          .eq('id', sys.id);
      }
    } catch (e) {
      console.error('Supabase reorder failed', e);
    }
  }

  return updated;
}

// Sync all local to Supabase
export async function syncAllToSupabase(systems: WaatehSystem[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = systems.map((s, idx) => ({
      id: s.id.startsWith('sys-') ? undefined : s.id,
      title: s.title,
      subtitle: s.subtitle,
      url: s.url,
      category: s.category,
      icon: s.icon,
      accent_color: s.accent_color,
      sort_order: s.sort_order ?? idx + 1,
      is_active: s.is_active,
      system_code: s.system_code,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('systems').upsert(payload);
    return !error;
  } catch (err) {
    console.error('Sync to supabase error:', err);
    return false;
  }
}

// Setup Supabase real-time subscription
export function subscribeToRealtimeChanges(
  onUpdate: () => void
): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel: RealtimeChannel = client
      .channel('waateh_systems_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'systems' },
        (payload) => {
          console.log('Realtime change received from Supabase:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}
