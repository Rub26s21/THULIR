// ============================================================
// THULIR AI — A-POD Master Evidence Fusion Engine
// ============================================================
// Orchestrates multi-node evidence aggregation, reliability weighting,
// spatial topology correlation, temporal persistence, and sensor agreement.
//
// Formula: E = 0.40 * R_network + 0.20 * S + 0.20 * T + 0.20 * M

import { DEFAULT_APOD_CONFIG } from './apodConfig.ts';
import { calculateNodeReliability } from './reliability.ts';
import { calculateNetworkRisk } from './networkRisk.ts';
import { calculateSpatialCorrelation, type SpatialNodeInput, type SpatialLinkInput } from './spatialCorrelation.ts';
import { calculateTemporalPersistence } from './temporalPersistence.ts';
import { calculateSensorAgreement } from './sensorAgreement.ts';
import { generateAPODExplanation, getRecommendedAction } from './apodExplainability.ts';
import type {
  NodeRiskState,
  APODResult,
  APODNetworkState,
  APODConfig,
} from './apodTypes.ts';
import type { SensorData } from '../../types/index.ts';

export interface APODEngineInput {
  podId?: string;
  zoneId?: string;
  nodes: NodeRiskState[];
  links?: SpatialLinkInput[];
  historicalNetworkRiskSeries?: number[];
  latestSensorDataByNode?: Record<string, SensorData | null>;
  config?: APODConfig;
}

/**
 * Determines the categorical Network State from the continuous evidence score E:
 * E < 0.30        -> NORMAL
 * 0.30 <= E < 0.50 -> WATCH
 * 0.50 <= E < 0.70 -> ELEVATED
 * 0.70 <= E < 0.85 -> HIGH
 * E >= 0.85       -> CRITICAL
 */
export function mapEvidenceToNetworkState(
  evidenceScore: number | null,
  hasCriticalOverride: boolean,
  config: APODConfig = DEFAULT_APOD_CONFIG
): APODNetworkState {
  if (hasCriticalOverride) return 'CRITICAL';
  if (evidenceScore === null || !Number.isFinite(evidenceScore)) return 'UNKNOWN';

  const bands = config.evidenceBands;
  if (evidenceScore < bands.normalMax) return 'NORMAL';
  if (evidenceScore < bands.watchMax) return 'WATCH';
  if (evidenceScore < bands.elevatedMax) return 'ELEVATED';
  if (evidenceScore < bands.highMax) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Executes the complete A-POD Evidence Fusion Pipeline.
 */
export function runAPODEngine(input: APODEngineInput): APODResult {
  const config = input.config || DEFAULT_APOD_CONFIG;
  const podId = input.podId || 'A-POD-01';
  const nodes = input.nodes || [];
  const links = input.links || [];
  const latestSensorData = input.latestSensorDataByNode || {};
  const historySeries = input.historicalNetworkRiskSeries || [];

  const timestamp = new Date().toISOString();

  // 1. Evaluate Individual Node Reliability & Classifications
  const nodeContributions = nodes.map((n) => {
    const reliability = calculateNodeReliability({
      nodeHealth: n.nodeHealth,
      mlConfidence: n.mlConfidence,
      dataFreshness: n.dataFreshness,
      freshnessState: n.freshnessState,
      isOnline: n.isOnline,
      nodeState: n.nodeState,
    });

    return {
      nodeId: n.nodeId,
      riskScore: n.riskScore,
      reliability,
    };
  });

  const isRealNode = (n: NodeRiskState) => n.nodeState === 'REAL' || (!n.nodeState && n.isOnline);

  const highRiskNodes = nodes.filter((n) => isRealNode(n) && (n.riskClass === 'HIGH_RISK' || n.riskScore >= 0.70)).map((n) => n.nodeId);
  const moderateRiskNodes = nodes.filter((n) => isRealNode(n) && (n.riskClass === 'MODERATE_RISK' || (n.riskScore >= 0.35 && n.riskScore < 0.70))).map((n) => n.nodeId);
  const normalNodes = nodes.filter((n) => isRealNode(n) && n.riskClass === 'LOW_RISK' && n.riskScore < 0.35).map((n) => n.nodeId);
  const unknownNodes = nodes.filter((n) => !isRealNode(n)).map((n) => n.nodeId);

  // Check for critical physical sensor overrides across nodes
  const hasPhysicalCriticalOverride = nodes.some((n) => isRealNode(n) && n.hasPhysicalCriticalViolation);

  // 2. Step 1: Weighted Network Risk (R_network)
  const networkRiskResult = calculateNetworkRisk(nodeContributions);
  const rNetwork = networkRiskResult.networkRisk;

  // 3. Step 2: Spatial Topology Correlation (S)
  const spatialNodes: SpatialNodeInput[] = nodes.map((n) => ({
    nodeId: n.nodeId,
    riskScore: n.riskScore,
    isOnline: isRealNode(n),
    neighborNodeIds: n.neighborNodeIds,
    zoneId: n.zoneId,
  }));

  const spatialResult = calculateSpatialCorrelation(spatialNodes, links, config.elevatedRiskThreshold);
  const s = spatialResult.spatialScore;

  // 4. Step 3: Temporal Persistence & Trend (T)
  const currentRiskForHistory = rNetwork !== null ? rNetwork : 0;
  const fullHistorySeries = [...historySeries, currentRiskForHistory];
  const temporalResult = calculateTemporalPersistence(fullHistorySeries, config.elevatedRiskThreshold, config.persistenceWindowSize);
  const t = temporalResult.temporalScore;

  // 5. Step 4: Multi-Sensor Agreement & Conflict Analysis (M)
  const agreements = nodes.filter(isRealNode).map((n) => {
    const rawData = latestSensorData[n.nodeId] ?? null;
    return calculateSensorAgreement(rawData, n.riskClass);
  });

  let avgAgreementScore = 0.5;
  let hasConflict = false;
  let conflictReason: string | undefined;
  const supportingSet = new Set<string>();
  const contradictingSet = new Set<string>();
  const missingSet = new Set<string>();

  if (agreements.length > 0) {
    const sumAgreements = agreements.reduce((acc, a) => acc + a.agreementScore, 0);
    avgAgreementScore = sumAgreements / agreements.length;

    for (const a of agreements) {
      if (a.hasConflict) {
        hasConflict = true;
        conflictReason = a.conflictReason;
      }
      for (const sSig of a.supportingSignals) supportingSet.add(sSig.message);
      for (const cSig of a.contradictingSignals) contradictingSet.add(cSig.message);
      for (const mSig of a.missingSignals) missingSet.add(mSig.message);
    }
  }

  const m = avgAgreementScore;

  // 6. Master Evidence Fusion Formula:
  // E = 0.40 * R_network + 0.20 * S + 0.20 * T + 0.20 * M
  let evidenceScore: number | null = null;
  if (rNetwork !== null) {
    const w = config.apodWeights;
    const rawEvidence = w.networkRisk * rNetwork + w.spatialCorrelation * s + w.temporalPersistence * t + w.sensorAgreement * m;
    evidenceScore = Math.min(Math.max(Number(rawEvidence.toFixed(4)), 0.0), 1.0);
  }

  // 7. Network State Determination
  const networkState = mapEvidenceToNetworkState(evidenceScore, hasPhysicalCriticalOverride, config);

  // 8. Event Scope Determination
  let eventScope = spatialResult.eventScope;
  if (networkState === 'UNKNOWN') {
    eventScope = 'UNKNOWN';
  } else if (networkState === 'CRITICAL' && highRiskNodes.length >= 2) {
    eventScope = 'AREA';
  }

  // 9. Overall Evidence Confidence
  // Reduced by stale/offline nodes, missing sensors, or physical conflicts
  const totalNodesCount = nodes.length || 1;
  const onlineRatio = networkRiskResult.contributingNodesCount / totalNodesCount;
  let confidence = onlineRatio * (hasConflict ? 0.75 : 0.95);
  if (rNetwork === null) confidence = 0.0;
  confidence = Math.min(Math.max(Number(confidence.toFixed(4)), 0.0), 1.0);

  // 10. Synthesize Deterministic Explainability & Recommendations
  const explanation = generateAPODExplanation({
    networkState,
    evidenceScore,
    networkRisk: rNetwork,
    eventScope,
    eventType: spatialResult.eventType,
    spatialScore: s,
    temporalScore: t,
    sensorAgreementScore: m,
    confidence,
    riskTrend: temporalResult.riskTrend,
    highRiskNodes,
    moderateRiskNodes,
    normalNodes,
    unknownNodes,
    hasConflict,
    conflictReason,
    hasPhysicalCriticalOverride,
    missingSignalCount: missingSet.size,
  });

  const recommendedAction = getRecommendedAction(networkState, eventScope, hasPhysicalCriticalOverride);

  return {
    podId,
    timestamp,
    zoneId: input.zoneId,
    networkState,
    evidenceScore,
    networkRisk: rNetwork,
    eventScope,
    eventType: spatialResult.eventType,
    contributingNodes: networkRiskResult.contributingNodeIds,
    highRiskNodes,
    moderateRiskNodes,
    normalNodes,
    unknownNodes,
    spatialCorrelation: Number(s.toFixed(4)),
    temporalPersistence: Number(t.toFixed(4)),
    sensorAgreement: Number(m.toFixed(4)),
    confidence,
    riskTrend: temporalResult.riskTrend,
    supportingSignals: Array.from(supportingSet),
    contradictingSignals: Array.from(contradictingSet),
    missingSignals: Array.from(missingSet),
    hasPhysicalCriticalOverride,
    nodeRiskStates: nodes,
    explanation,
    recommendedAction,
  };
}
