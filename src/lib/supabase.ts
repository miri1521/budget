import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get stored Supabase config from localStorage or fallback to environment variables
export const getSupabaseConfig = () => {
  const metaEnv = (import.meta as any).env || {};
  const url = localStorage.getItem('supabase_url') || metaEnv.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem('supabase_anon_key') || metaEnv.VITE_SUPABASE_ANON_KEY || '';
  return { url, anonKey };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('supabase_url', url.trim());
  localStorage.setItem('supabase_anon_key', anonKey.trim());
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};
