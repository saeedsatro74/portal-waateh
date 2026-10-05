export interface WaatehSystem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  category: string;
  icon: string;
  accent_color: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  system_code?: string;
}

export type GridAspectRatio = '4:3' | '1:1' | '16:10';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isConnecting: boolean;
  errorMessage: string | null;
  lastSyncTime: string | null;
}
