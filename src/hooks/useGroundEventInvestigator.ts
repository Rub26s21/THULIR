// ============================================================
// THULIR AI — useGroundEventInvestigator React Hook
// ============================================================
// Manages LLM investigation lifecycle, automated event-driven triggers,
// cooldown throttling, and UI state synchronization.

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Alert, NodeRecord } from '../types/index.ts';
import type { APODResult } from '../services/apod/apodTypes.ts';
import {
  buildEvidencePackage,
  createEvidenceFingerprint,
  fetchGroundInvestigation,
} from '../services/investigator/investigatorClient.ts';
import type {
  GroundEventInvestigation,
  InvestigatorStatus,
} from '../services/investigator/investigatorTypes.ts';

const COOLDOWN_DURATION_SEC = 8;

export interface UseGroundEventInvestigatorResult {
  investigation: GroundEventInvestigation | null;
  status: InvestigatorStatus;
  isInvestigating: boolean;
  reason: string | null;
  lastInvestigatedAt: string | null;
  cooldownRemaining: number;
  triggerManualInvestigation: () => Promise<void>;
}

export interface UseGroundEventInvestigatorOptions {
  apod: APODResult | null;
  nodes: NodeRecord[];
  alerts: Alert[];
}

export function useGroundEventInvestigator(
  optionsOrApod: UseGroundEventInvestigatorOptions | APODResult | null,
  _nodesParam?: NodeRecord[],
  alertsParam?: Alert[]
): UseGroundEventInvestigatorResult {
  const apod = optionsOrApod && typeof optionsOrApod === 'object' && 'nodes' in optionsOrApod
    ? (optionsOrApod as UseGroundEventInvestigatorOptions).apod
    : (optionsOrApod as APODResult | null);

  const alerts = optionsOrApod && typeof optionsOrApod === 'object' && 'alerts' in optionsOrApod
    ? (optionsOrApod as UseGroundEventInvestigatorOptions).alerts
    : (alertsParam || []);

  const [investigation, setInvestigation] = useState<GroundEventInvestigation | null>(null);
  const [status, setStatus] = useState<InvestigatorStatus>('AI_IDLE');
  const [reason, setReason] = useState<string | null>(null);
  const [lastInvestigatedAt, setLastInvestigatedAt] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const lastFingerprintRef = useRef<string>('');
  const isRequestingRef = useRef<boolean>(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Decrement cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setCooldownRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [cooldownRemaining]);

  // Core execution function
  const executeInvestigation = useCallback(
    async (force = false) => {
      if (!apod) return;
      if (isRequestingRef.current) return;
      if (!force && cooldownRemaining > 0) return;

      const pkg = buildEvidencePackage(apod, alerts, apod.nodeRiskStates);
      const currentFingerprint = createEvidenceFingerprint(pkg);

      if (!force && currentFingerprint === lastFingerprintRef.current && status === 'AI_AVAILABLE') {
        return; // Identical state already investigated
      }

      isRequestingRef.current = true;
      setStatus('AI_INVESTIGATING');
      setReason(null);

      try {
        const res = await fetchGroundInvestigation(pkg);

        setStatus(res.status);
        setLastInvestigatedAt(res.timestamp);
        setCooldownRemaining(COOLDOWN_DURATION_SEC);
        lastFingerprintRef.current = currentFingerprint;

        if (res.available && res.investigation) {
          setInvestigation(res.investigation);
          setReason(null);
        } else {
          setReason(res.reason || 'AI interpretation unavailable.');
        }
      } catch (err: unknown) {
        setStatus('AI_ERROR');
        setReason((err as Error)?.message || 'Failed to communicate with investigation engine.');
      } finally {
        isRequestingRef.current = false;
      }
    },
    [apod, alerts, cooldownRemaining, status]
  );

  // Automated Event-Driven Trigger:
  // Only fires when A-POD is not in quiet NORMAL or UNKNOWN, when an anomaly / override occurs
  useEffect(() => {
    if (!apod || apod.networkState === 'UNKNOWN') return;

    const isAbnormal =
      apod.networkState === 'WATCH' ||
      apod.networkState === 'ELEVATED' ||
      apod.networkState === 'HIGH' ||
      apod.networkState === 'CRITICAL' ||
      apod.hasPhysicalCriticalOverride ||
      alerts.some((a) => a.severity === 'CRITICAL' || a.severity === 'WATCH');

    if (isAbnormal) {
      const pkg = buildEvidencePackage(apod, alerts, apod.nodeRiskStates);
      const fp = createEvidenceFingerprint(pkg);

      if (fp !== lastFingerprintRef.current && !isRequestingRef.current && cooldownRemaining === 0) {
        executeInvestigation(false);
      }
    }
  }, [apod, alerts, cooldownRemaining, executeInvestigation]);

  const triggerManualInvestigation = useCallback(async () => {
    await executeInvestigation(true);
  }, [executeInvestigation]);

  return {
    investigation,
    status,
    isInvestigating: status === 'AI_INVESTIGATING',
    reason,
    lastInvestigatedAt,
    cooldownRemaining,
    triggerManualInvestigation,
  };
}
