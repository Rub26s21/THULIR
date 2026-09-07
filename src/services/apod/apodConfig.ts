// ============================================================
// THULIR AI — A-POD Configuration & Tunable Parameters
// ============================================================
// Centralized parameters for multi-node risk weights, fusion weights,
// evidence bands, and freshness policies.

import type { APODConfig } from './apodTypes';

/**
 * Normalized weights for converting 3-class ML probabilities into a single node risk score.
 * R_i = 0.0 * P_low + 0.5 * P_moderate + 1.0 * P_high
 */
export const NODE_RISK_WEIGHTS = {
  low: 0.0,
  moderate: 0.5,
  high: 1.0,
} as const;

/**
 * PROTOTYPE Master A-POD Evidence Fusion Weights.
 * E = 0.40 * R_network + 0.20 * S + 0.20 * T + 0.20 * M
 *
 * NOTE: These weights are prototype baseline values for engineering demonstration.
 * They are NOT scientifically validated for operational coal mine certification.
 */
export const APOD_WEIGHTS = {
  networkRisk: 0.40,
  spatialCorrelation: 0.20,
  temporalPersistence: 0.20,
  sensorAgreement: 0.20,
} as const;

// Ensure weight sum equals exactly 1.0
const weightsSum =
  APOD_WEIGHTS.networkRisk +
  APOD_WEIGHTS.spatialCorrelation +
  APOD_WEIGHTS.temporalPersistence +
  APOD_WEIGHTS.sensorAgreement;

if (Math.abs(weightsSum - 1.0) > 0.0001) {
  throw new Error(`[A-POD CONFIG ERROR] APOD_WEIGHTS must sum to 1.0 (currently ${weightsSum})`);
}

/**
 * PROTOTYPE Evidence Score Categorization Bands.
 * E < 0.30        -> NORMAL
 * 0.30 <= E < 0.50 -> WATCH
 * 0.50 <= E < 0.70 -> ELEVATED
 * 0.70 <= E < 0.85 -> HIGH
 * E >= 0.85       -> CRITICAL
 */
export const EVIDENCE_BANDS = {
  normalMax: 0.30,
  watchMax: 0.50,
  elevatedMax: 0.70,
  highMax: 0.85,
} as const;

/**
 * Data Freshness multiplier factors D_i in [0, 1].
 * OFFLINE is strictly 0.0 (D_i = 0 -> Q_i = 0).
 */
export const FRESHNESS_CONFIG = {
  fresh: 1.0,     // < 15s
  recent: 0.75,   // < 35s
  stale: 0.25,    // < 60s
  offline: 0.0,   // >= 60s or disconnected
} as const;

/**
 * Temporal Persistence configuration.
 */
export const PERSISTENCE_CONFIG = {
  windowSize: 6,                 // Evaluate up to 6 most recent observations (~30s buffer)
  elevatedThreshold: 0.50,       // Risk score >= 0.50 considered elevated
  risingSlopeThreshold: 0.04,    // Linear regression slope threshold for RISING trend
  fallingSlopeThreshold: -0.04,  // Linear regression slope threshold for FALLING trend
} as const;

/**
 * Spatial Correlation configuration.
 */
export const SPATIAL_CONFIG = {
  elevatedThreshold: 0.50,
  isolatedPenalty: 0.15,         // Max spatial score for single isolated node
  correlatedBonus: 0.50,         // Base spatial score when >=2 neighboring nodes abnormal
  clusterAdjacencyThreshold: 0.60, // Minimum cluster adjacency density for area escalation
} as const;

/**
 * Complete default A-POD Engine configuration.
 */
export const DEFAULT_APOD_CONFIG: APODConfig = {
  nodeRiskWeights: NODE_RISK_WEIGHTS,
  apodWeights: APOD_WEIGHTS,
  evidenceBands: EVIDENCE_BANDS,
  freshnessWeights: FRESHNESS_CONFIG,
  persistenceWindowSize: PERSISTENCE_CONFIG.windowSize,
  elevatedRiskThreshold: PERSISTENCE_CONFIG.elevatedThreshold,
  spatialClusterThreshold: SPATIAL_CONFIG.clusterAdjacencyThreshold,
};
