// ============================================================
// THULIR AI — Ground Event Investigator Types & Schema
// ============================================================
// Deterministic contracts for LLM-based engineering incident interpretation.

import type {
  APODNetworkState,
  APODEventScope,
  APODRiskTrend,
  APODRiskClass,
  APODFreshnessState,
} from '../apod/apodTypes.ts';

export type InvestigatorEventType =
  | 'NORMAL'
  | 'SINGLE_NODE_ANOMALY'
  | 'MULTI_SENSOR_ANOMALY'
  | 'SPATIAL_CORRELATED_ANOMALY'
  | 'TEMPORAL_ESCALATION'
  | 'SENSOR_CONFLICT'
  | 'DATA_QUALITY_ISSUE'
  | 'UNKNOWN';

export type InvestigatorSeverity =
  | 'NORMAL'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL'
  | 'UNKNOWN';

export interface NodeEvidenceSummary {
  nodeId: string;
  riskClass: APODRiskClass;
  riskScore: number;
  mlConfidence: number;
  mlProbabilities: {
    low: number;
    moderate: number;
    high: number;
  };
  nodeHealth: number;
  dataFreshness: number;
  freshnessState: APODFreshnessState;
  isOnline: boolean;
  hasPhysicalViolation?: boolean;
  zoneId?: string;
  location?: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
  };
  sensorTelemetry?: Record<string, number | null>;
}

/**
 * Clean, summarized evidence package sent to Ground Event Investigator.
 */
export interface APODEvidencePackage {
  eventId: string;
  timestamp: string;
  scope: APODEventScope;
  apodState: APODNetworkState;
  evidenceScore: number | null;
  networkRisk: number | null;
  spatialFactor: number;
  temporalFactor: number;
  sensorAgreement: number;
  riskTrend: APODRiskTrend;
  hasPhysicalCriticalOverride: boolean;
  nodes: NodeEvidenceSummary[];
  activeAlerts: Array<{
    id?: string | number;
    severity: string;
    sensor: string;
    message: string;
    nodeId?: string;
  }>;
  supportingSignals: string[];
  contradictingSignals: string[];
  missingSignals: string[];
  dataQuality: {
    totalNodes: number;
    onlineNodes: number;
    staleOrOfflineNodes: string[];
    missingSignalCount: number;
  };
  zoneContext?: {
    zoneId?: string;
    mineSector?: string;
  };
}

/**
 * Validated output returned by NVIDIA Nemotron 3 Ultra.
 */
export interface GroundEventInvestigation {
  event_type: InvestigatorEventType;
  severity_interpretation: InvestigatorSeverity;
  confidence: number;
  summary: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  data_gaps: string[];
  possible_interpretations: string[];
  operator_verification: string[];
  limitations: string[];
}

export type InvestigatorStatus =
  | 'AI_IDLE'
  | 'AI_INVESTIGATING'
  | 'AI_AVAILABLE'
  | 'AI_UNAVAILABLE'
  | 'AI_ERROR'
  | 'AI_INVALID_RESPONSE'
  | 'AI_RATE_LIMITED';

export interface InvestigationResponse {
  available: boolean;
  status: InvestigatorStatus;
  investigation?: GroundEventInvestigation;
  reason?: string;
  model?: string;
  timestamp: string;
  cached?: boolean;
}

export const VALID_EVENT_TYPES: Set<string> = new Set([
  'NORMAL',
  'SINGLE_NODE_ANOMALY',
  'MULTI_SENSOR_ANOMALY',
  'SPATIAL_CORRELATED_ANOMALY',
  'TEMPORAL_ESCALATION',
  'SENSOR_CONFLICT',
  'DATA_QUALITY_ISSUE',
  'UNKNOWN',
]);

export const VALID_SEVERITIES: Set<string> = new Set([
  'NORMAL',
  'WATCH',
  'ELEVATED',
  'HIGH',
  'CRITICAL',
  'UNKNOWN',
]);

/**
 * Validates untrusted JSON response from LLM against strict schema.
 */
export function validateInvestigationResponse(raw: unknown): GroundEventInvestigation | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;

  if (typeof data.summary !== 'string' || data.summary.trim().length === 0) {
    return null;
  }

  const eventType = String(data.event_type || '').toUpperCase() as InvestigatorEventType;
  if (!VALID_EVENT_TYPES.has(eventType)) {
    return null;
  }

  const severity = String(data.severity_interpretation || '').toUpperCase() as InvestigatorSeverity;
  if (!VALID_SEVERITIES.has(severity)) {
    return null;
  }

  const confidence = Number(data.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    return null;
  }

  const toStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => String(item || '').trim()).filter(s => s.length > 0);
  };

  return {
    event_type: eventType,
    severity_interpretation: severity,
    confidence: Number(confidence.toFixed(2)),
    summary: data.summary.trim(),
    supporting_evidence: toStringArray(data.supporting_evidence),
    contradicting_evidence: toStringArray(data.contradicting_evidence),
    data_gaps: toStringArray(data.data_gaps),
    possible_interpretations: toStringArray(data.possible_interpretations),
    operator_verification: toStringArray(data.operator_verification),
    limitations: toStringArray(data.limitations),
  };
}
