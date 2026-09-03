// ============================================================
// THULIR - Supabase Client
// ============================================================
// Single source of truth for Supabase connection.
// Uses environment variables with verified production fallbacks.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://cdsjgvpjvyewepgalset.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2pndnBqdnlld2VwZ2Fsc2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODczMTEsImV4cCI6MjEwMzU2MzMxMX0._1rsBzlWEl5GcO701B-KMvhyLoNeMN69P5-woTFFtLc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

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
    '[SUPABASE] Not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
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
      'Supabase client not initialized. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    );
  }
  return supabase;
}

export { supabase };
