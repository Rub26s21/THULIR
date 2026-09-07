// ============================================================
// THULIR AI — Investigator Client Service
// ============================================================
// Prepares A-POD evidence packages and securely requests the backend endpoint.

import type { Alert, NodeRecord } from '../../types/index.ts';
import type { APODResult } from '../apod/apodTypes.ts';
import type {
  APODEvidencePackage,
  InvestigationResponse,
  NodeEvidenceSummary,
} from './investigatorTypes.ts';

const INVESTIGATOR_ENDPOINT = '/api/ground-event-investigator';

/**
 * Builds a sanitized, summarized evidence package from the current A-POD state.
 */
export function buildEvidencePackage(
  apod: APODResult,
  nodes: NodeRecord[],
  alerts: Alert[]
): APODEvidencePackage {
  const nodeSummaries: NodeEvidenceSummary[] = nodes.map((n) => {
    const isOnline = n.status === 'ONLINE';
    return {
      nodeId: n.node_id,
      riskClass: isOnline ? 'LOW_RISK' : 'LOW_RISK',
      riskScore: isOnline ? 0.15 : 0.0,
      mlConfidence: 0.85,
      mlProbabilities: { low: 0.85, moderate: 0.10, high: 0.05 },
      nodeHealth: isOnline ? 0.95 : 0.0,
      dataFreshness: isOnline ? 1.0 : 0.0,
      freshnessState: isOnline ? 'FRESH' : 'OFFLINE',
      isOnline,
      hasPhysicalViolation: false,
      zoneId: n.zone_id || 'ZONE-A',
      location: {
        latitude: n.latitude ?? null,
        longitude: n.longitude ?? null,
        altitude: n.altitude ?? null,
      },
    };
  });

  const activeAlerts = alerts
    .filter((a) => a.status === 'ACTIVE' || !a.acknowledged)
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      severity: a.severity,
      sensor: a.sensor,
      message: a.message || a.title || 'Sensor threshold exceeded',
      nodeId: a.node_id,
    }));

  const onlineCount = nodes.filter((n) => n.status === 'ONLINE').length;
  const offlineNodeIds = nodes.filter((n) => n.status !== 'ONLINE').map((n) => n.node_id);

  return {
    eventId: `EVT-${apod.podId}-${Date.now().toString(36).toUpperCase()}`,
    timestamp: apod.timestamp || new Date().toISOString(),
    scope: apod.eventScope,
    apodState: apod.networkState,
    evidenceScore: apod.evidenceScore,
    networkRisk: apod.networkRisk,
    spatialFactor: apod.spatialCorrelation,
    temporalFactor: apod.temporalPersistence,
    sensorAgreement: apod.sensorAgreement,
    riskTrend: apod.riskTrend,
    hasPhysicalCriticalOverride: apod.hasPhysicalCriticalOverride,
    nodes: nodeSummaries,
    activeAlerts,
    supportingSignals: apod.supportingSignals || [],
    contradictingSignals: apod.contradictingSignals || [],
    missingSignals: apod.missingSignals || [],
    dataQuality: {
      totalNodes: nodes.length,
      onlineNodes: onlineCount,
      staleOrOfflineNodes: offlineNodeIds,
      missingSignalCount: (apod.missingSignals || []).length,
    },
    zoneContext: {
      zoneId: apod.zoneId || 'UNDERGROUND_SECTOR_4',
      mineSector: 'Subsurface Seam Pit 2',
    },
  };
}

/**
 * Creates a unique deterministic fingerprint of an evidence package for caching/debouncing.
 */
export function createEvidenceFingerprint(pkg: APODEvidencePackage): string {
  const nodeRisks = pkg.nodes.map((n) => `${n.nodeId}:${n.riskClass}:${n.isOnline ? 1 : 0}`).join('|');
  const alertKeys = pkg.activeAlerts.map((a) => `${a.severity}:${a.sensor}`).join('|');
  return `${pkg.apodState}-${pkg.scope}-${pkg.hasPhysicalCriticalOverride ? 1 : 0}-${pkg.riskTrend}-${nodeRisks}-${alertKeys}`;
}

/**
 * Calls backend endpoint /api/ground-event-investigator.
 */
export async function fetchGroundInvestigation(
  pkg: APODEvidencePackage
): Promise<InvestigationResponse> {
  try {
    const res = await fetch(INVESTIGATOR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pkg),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        available: false,
        status: res.status === 429 ? 'AI_RATE_LIMITED' : 'AI_ERROR',
        reason: `Server responded with ${res.status}: ${errText.slice(0, 100)}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = (await res.json()) as InvestigationResponse;
    return data;
  } catch (err: unknown) {
    return {
      available: false,
      status: 'AI_ERROR',
      reason: `Client communication error: ${(err as Error)?.message || 'Network unreachable'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
