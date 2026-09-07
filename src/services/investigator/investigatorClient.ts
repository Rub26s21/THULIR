// ============================================================
// THULIR AI — Investigator Client Service
// ============================================================
// Prepares A-POD evidence packages and securely requests the backend endpoint.

import type { Alert } from '../../types/index.ts';
import type { APODResult, NodeRiskState } from '../apod/apodTypes.ts';
import type {
  APODEvidencePackage,
  InvestigationResponse,
  NodeEvidenceSummary,
} from './investigatorTypes.ts';

const INVESTIGATOR_ENDPOINT = '/api/ground-event-investigator';

/**
 * Builds a sanitized, summarized evidence package directly from the authoritative A-POD state.
 * Preserves exact node-level risk intelligence without downstream reconstruction or fabrication.
 */
export function buildEvidencePackage(
  apod: APODResult,
  alerts: Alert[],
  nodeRiskStates?: NodeRiskState[]
): APODEvidencePackage {
  const sourceNodes: NodeRiskState[] = nodeRiskStates || apod.nodeRiskStates || [];
  const nodeSummaries: NodeEvidenceSummary[] = sourceNodes.map((n: NodeRiskState) => ({
    nodeId: n.nodeId,
    riskClass: n.riskClass,
    riskScore: n.riskScore,
    mlConfidence: n.mlConfidence,
    mlProbabilities: n.probabilities,
    nodeHealth: n.nodeHealth,
    dataFreshness: n.dataFreshness,
    freshnessState: n.freshnessState,
    isOnline: n.isOnline,
    hasPhysicalViolation: Boolean(n.hasPhysicalCriticalViolation),
    zoneId: n.zoneId || 'ZONE_A',
    location: {
      latitude: n.latitude ?? null,
      longitude: n.longitude ?? null,
      altitude: n.altitude ?? null,
    },
  }));

  const activeAlerts = (alerts || [])
    .filter((a) => a.status === 'ACTIVE' || !a.acknowledged)
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      severity: a.severity,
      sensor: a.sensor,
      message: a.message || a.title || 'Sensor threshold exceeded',
      nodeId: a.node_id,
    }));

  const onlineCount = sourceNodes.filter((n) => n.isOnline).length;
  const offlineNodeIds = sourceNodes.filter((n) => !n.isOnline).map((n) => n.nodeId);

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
      totalNodes: sourceNodes.length,
      onlineNodes: onlineCount,
      staleOrOfflineNodes: offlineNodeIds,
      missingSignalCount: (apod.missingSignals || []).length,
    },
    zoneContext: {
      zoneId: apod.zoneId || 'NOT_AVAILABLE',
      mineSector: 'NOT_AVAILABLE',
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
