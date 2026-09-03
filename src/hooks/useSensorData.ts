// ============================================================
// THULIR - Sensor Data Hook
// ============================================================
// Manages latest + historical sensor data, merging realtime/demo sources.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useRealtimeData } from './useRealtimeData';
import { useDemoMode } from './useDemoMode';
import { getHistory } from '../services/sensorService';
import { NODE_ID } from '../config/thresholds';
import type { SensorData, TimeRange, DataSource } from '../types';

export function useSensorData() {
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  const [liveHistory, setLiveHistory] = useState<SensorData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1H');

  // Realtime data from Supabase
  const { latestData: realtimeData, connectionType, error: realtimeError } = useRealtimeData(NODE_ID);

  // Demo data
  const { demoData, demoHistory } = useDemoMode(demoMode);

  // Fetch live historical data from Supabase
  useEffect(() => {
    if (!demoMode && isSupabaseConfigured) {
      let isCancelled = false;

      const load = async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        try {
          const data = await getHistory(timeRange);
          if (!isCancelled) {
            setLiveHistory(data);
          }
        } catch (err) {
          if (!isCancelled) {
            const msg = err instanceof Error ? err.message : String(err);
            setHistoryError(msg);
            console.error('[SENSOR] History fetch error:', msg);
          }
        } finally {
          if (!isCancelled) {
            setHistoryLoading(false);
          }
        }
      };

      load();

      return () => {
        isCancelled = true;
      };
    }
  }, [demoMode, timeRange]);

  // Combine fetched history with latest live packet seamlessly
  const combinedLiveHistory = useMemo(() => {
    if (!realtimeData) return liveHistory;
    if (liveHistory.some(r => r.id === realtimeData.id && r.id !== 0)) return liveHistory;
    return [...liveHistory, realtimeData];
  }, [liveHistory, realtimeData]);

  // Determine which data to use
  const latestData = demoMode ? demoData : realtimeData;
  const history = demoMode ? demoHistory : combinedLiveHistory;

  // Determine data source label
  let dataSource: DataSource = 'NO_DATA';
  if (demoMode) {
    dataSource = 'DEMO';
  } else if (realtimeError && !realtimeData) {
    dataSource = 'ERROR';
  } else if (realtimeData) {
    dataSource = 'LIVE';
  }

  const toggleDemoMode = useCallback(() => {
    setDemoMode(prev => !prev);
  }, []);

  return {
    latestData,
    history,
    historyLoading: demoMode ? false : historyLoading,
    historyError: demoMode ? null : historyError,
    timeRange,
    setTimeRange,
    dataSource,
    connectionType,
    demoMode,
    toggleDemoMode,
    realtimeError,
    supabaseConfigured: isSupabaseConfigured,
  };
}
