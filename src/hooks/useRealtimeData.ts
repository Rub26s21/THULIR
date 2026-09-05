// ============================================================
// THULIR - Realtime Data Hook (PRODUCTION-HARDENED)
// ============================================================
// Strategy: ALWAYS poll every 5s as baseline. Additionally subscribe
// to Supabase Realtime for instant updates when available.
// This dual approach ensures data ALWAYS flows to the dashboard
// regardless of whether Realtime publication is configured.

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { mapRowToSensorData } from '../utils/dataMapping';
import { POLLING_INTERVAL_MS } from '../config/thresholds';
import type { SensorData, ConnectionType } from '../types';

export function useRealtimeData(nodeId: string) {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType>('DISCONNECTED');
  const [error, setError] = useState<string | null>(() =>
    !isSupabaseConfigured ? 'Supabase not configured' : null
  );
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const latestIdRef = useRef<number>(0);
  const realtimeActiveRef = useRef(false);

  // ── Poll Function (always active as baseline) ──────────────
  const pollOnce = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('node_id', nodeId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('[POLL] Error:', fetchError.message);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        const rowId = Number(row.id) || 0;
        // Only update if this is genuinely new data
        if (rowId !== latestIdRef.current) {
          latestIdRef.current = rowId;
          const mapped = mapRowToSensorData(row);
          setLatestData(mapped);
          setError(null);
          console.log('[POLL] New data received — id:', rowId, 'ts:', mapped.created_at);
        }
      }
    } catch (err) {
      console.error('[POLL] Exception:', err);
    }
  }, [nodeId]);

  // ── Polling lifecycle ──────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Immediately fetch latest data on mount
    pollOnce();

    // Start interval polling — runs regardless of Realtime status
    const interval = setInterval(pollOnce, POLLING_INTERVAL_MS);
    pollingRef.current = interval;
    setConnectionType('POLLING');
    console.log(`[POLL] Active for ${nodeId} (every ${POLLING_INTERVAL_MS}ms)`);

    return () => {
      clearInterval(interval);
      pollingRef.current = null;
    };
  }, [nodeId, pollOnce]);

  // ── Realtime subscription (bonus — instant updates) ────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const channelName = `sensor_realtime_${nodeId}_${Date.now()}`;

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sensor_data',
            filter: `node_id=eq.${nodeId}`,
          },
          (payload) => {
            if (payload.new) {
              const mapped = mapRowToSensorData(payload.new as Record<string, unknown>);
              const rowId = Number((payload.new as Record<string, unknown>).id) || 0;
              latestIdRef.current = rowId;
              setLatestData(mapped);
              setError(null);
              setConnectionType('REALTIME');
              console.log('[REALTIME] Instant data received — id:', rowId);
            }
          }
        )
        .subscribe((status) => {
          console.log('[REALTIME] Status:', status);
          if (status === 'SUBSCRIBED') {
            realtimeActiveRef.current = true;
            // Don't stop polling — keep it as safety net
            console.log('[REALTIME] Subscribed (polling still active as backup)');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            realtimeActiveRef.current = false;
            console.warn('[REALTIME] Channel error — polling continues as primary');
          }
        });

      channelRef.current = channel;

      return () => {
        realtimeActiveRef.current = false;
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } catch (err) {
      console.warn('[REALTIME] Setup failed:', err);
    }
  }, [nodeId]);

  return { latestData, connectionType, error };
}
