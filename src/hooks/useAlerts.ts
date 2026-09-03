// ============================================================
// THULIR - Alerts Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { evaluateAlerts } from '../utils/alertEngine';
import * as alertService from '../services/alertService';
import { isSupabaseConfigured } from '../lib/supabase';
import type { SensorData, Alert, MLPrediction } from '../types';

export function useAlerts(
  latestData: SensorData | null,
  mlPrediction?: MLPrediction | null
) {
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([]);

  // Evaluate alerts when live telemetry or ML prediction updates
  useEffect(() => {
    if (!latestData) return;

    const timer = setTimeout(() => {
      setLocalAlerts(prev => {
        const { updatedAlerts, newAlertsCount } = evaluateAlerts(
          latestData,
          mlPrediction,
          prev
        );

        // Async sync to Supabase if configured
        if (isSupabaseConfigured && newAlertsCount > 0) {
          const newestItems = updatedAlerts.slice(0, newAlertsCount);
          for (const alert of newestItems) {
            alertService.createAlert(alert).catch(() => {});
          }
        }

        return updatedAlerts;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [latestData, mlPrediction]);

  // Acknowledge an active alert
  const acknowledgeAlert = useCallback((alertId: number) => {
    setLocalAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'ACKNOWLEDGED' as const, acknowledged: true }
          : a
      )
    );

    if (isSupabaseConfigured) {
      alertService.acknowledgeAlert(alertId).catch(() => {});
    }
  }, []);

  const activeAlerts = localAlerts.filter(a => a.status !== 'RESOLVED');
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;
  const watchCount = activeAlerts.filter(a => a.severity === 'WATCH').length;
  const recentAlerts = localAlerts.slice(0, 30);

  return {
    alerts: localAlerts,
    activeAlerts,
    recentAlerts,
    criticalCount,
    watchCount,
    acknowledgeAlert,
  };
}
