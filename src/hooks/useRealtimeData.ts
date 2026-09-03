// ============================================================
// THULIR - Realtime Data Hook
// ============================================================
// Supabase Realtime subscription with automatic 5s polling fallback.

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
  const isConnectedRef = useRef(false);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;

    const poll = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('node_id', nodeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          if (fetchError.code !== 'PGRST116') {
            console.error('[REALTIME] Polling error:', fetchError.message);
          }
          return;
        }

        if (data) {
          const mapped = mapRowToSensorData(data);
          setLatestData(mapped);
        }
      } catch (err) {
        console.error('[REALTIME] Polling exception:', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, POLLING_INTERVAL_MS);
    setConnectionType('POLLING');
    console.log('[REALTIME] Polling fallback active (5s interval)');
  }, [nodeId]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    // Initial fetch
    const fetchLatest = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('node_id', nodeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (data) {
          setLatestData(mapRowToSensorData(data));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[REALTIME] Initial fetch error:', msg);
        setError(msg);
      }
    };

    fetchLatest();

    try {
      const channel = supabase
        .channel('sensor_data_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sensor_data',
            filter: `node_id=eq.${nodeId}`,
          },
          (payload) => {
            console.log('[REALTIME] New sensor data received');
            if (payload.new) {
              const mapped = mapRowToSensorData(payload.new as Record<string, unknown>);
              setLatestData(mapped);
            }
          }
        )
        .subscribe((status) => {
          console.log('[REALTIME] Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isConnectedRef.current = true;
            setConnectionType('REALTIME');
            setError(null);
            stopPolling();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            isConnectedRef.current = false;
            console.warn('[REALTIME] Subscription failed, falling back to polling');
            setError('Realtime subscription failed — using polling fallback');
            startPolling();
          }
        });

      channelRef.current = channel;

      const fallbackTimeout = setTimeout(() => {
        if (!isConnectedRef.current) {
          console.warn('[REALTIME] Connection timeout, starting polling');
          startPolling();
        }
      }, 10000);

      return () => {
        clearTimeout(fallbackTimeout);
        stopPolling();
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } catch (err) {
      console.warn('[REALTIME] Failed to setup subscription:', err);
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [nodeId, startPolling, stopPolling]);

  return { latestData, connectionType, error };
}
