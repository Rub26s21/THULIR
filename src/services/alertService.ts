// ============================================================
// THULIR - Alert Service
// ============================================================

import { getSupabase } from '../lib/supabase';
import { NODE_ID } from '../config/thresholds';
import type { Alert } from '../types';

/**
 * Fetch all alerts, newest first.
 */
export async function getAlerts(
  nodeId: string = NODE_ID,
  limit: number = 50
): Promise<Alert[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('node_id', nodeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Table may not exist yet — that's OK
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.log('[ALERT] alerts table does not exist');
      return [];
    }
    console.error('[ALERT] Error fetching alerts:', error.message);
    return [];
  }

  return (data || []) as Alert[];
}

/**
 * Get active (non-resolved) alerts.
 */
export async function getActiveAlerts(nodeId: string = NODE_ID): Promise<Alert[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('node_id', nodeId)
    .neq('status', 'RESOLVED')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    console.error('[ALERT] Error fetching active alerts:', error.message);
    return [];
  }

  return (data || []) as Alert[];
}

/**
 * Create a new alert.
 */
export async function createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'resolved_at'>): Promise<Alert | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      ...alert,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[ALERT] Error creating alert:', error.message);
    return null;
  }

  return data as Alert;
}

/**
 * Acknowledge an alert.
 */
export async function acknowledgeAlert(alertId: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('alerts')
    .update({ status: 'ACKNOWLEDGED', acknowledged: true })
    .eq('id', alertId);

  if (error) {
    console.error('[ALERT] Error acknowledging alert:', error.message);
    return false;
  }

  return true;
}

/**
 * Resolve an alert.
 */
export async function resolveAlert(alertId: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('alerts')
    .update({ status: 'RESOLVED', resolved_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) {
    console.error('[ALERT] Error resolving alert:', error.message);
    return false;
  }

  return true;
}
