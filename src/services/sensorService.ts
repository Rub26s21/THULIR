// ============================================================
// THULIR - Sensor Data Service
// ============================================================

import { getSupabase } from '../lib/supabase';
import { mapRowToSensorData } from '../utils/dataMapping';
import { HISTORY_LIMITS, NODE_ID } from '../config/thresholds';
import type { SensorData, TimeRange } from '../types';

/**
 * Fetch the latest sensor reading for a node.
 */
export async function getLatestReading(nodeId: string = NODE_ID): Promise<SensorData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('node_id', nodeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      console.log('[SENSOR] No data found for node:', nodeId);
      return null;
    }
    console.error('[SENSOR] Error fetching latest reading:', error.message);
    throw error;
  }

  return data ? mapRowToSensorData(data) : null;
}

/**
 * Fetch historical sensor data for charts.
 */
export async function getHistory(
  timeRange: TimeRange,
  nodeId: string = NODE_ID
): Promise<SensorData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const config = HISTORY_LIMITS[timeRange];
  const since = new Date(Date.now() - config.hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('node_id', nodeId)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(config.maxRows);

  if (error) {
    console.error('[SENSOR] Error fetching history:', error.message);
    throw error;
  }

  return (data || []).map(mapRowToSensorData);
}

/**
 * Test Supabase connectivity by performing a simple SELECT.
 */
export async function testConnection(): Promise<{ success: boolean; error?: string; rowCount?: number }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error, count } = await supabase
      .from('sensor_data')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, rowCount: count ?? 0 };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Get the count of records for a node.
 */
export async function getRecordCount(nodeId: string = NODE_ID): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('sensor_data')
    .select('id', { count: 'exact', head: true })
    .eq('node_id', nodeId);

  if (error) {
    console.error('[SENSOR] Error counting records:', error.message);
    return 0;
  }

  return count ?? 0;
}
