// ============================================================
// THULIR - Supabase Client
// ============================================================
// Single source of truth for Supabase connection.
// Uses environment variables only — never hardcoded keys.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Whether Supabase environment is properly configured */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  console.log('[SUPABASE] Client initialized:', supabaseUrl);
} else {
  console.warn(
    '[SUPABASE] Not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

/**
 * Get the Supabase client instance.
 * Returns null if not configured — callers must handle this gracefully.
 */
export function getSupabase(): SupabaseClient | null {
  return supabase;
}

/**
 * Get the Supabase client or throw.
 * Use only when you're certain Supabase is configured.
 */
export function getSupabaseOrThrow(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    );
  }
  return supabase;
}

export { supabase };
