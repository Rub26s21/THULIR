// ============================================================
// THULIR AI — A-POD Node Reliability Module
// ============================================================
// Calculates the contribution weight Q_i for each node based on
// health, ML confidence, and telemetry data freshness.
// Formula: Q_i = H_i * C_i * D_i
//
// Invariant: An OFFLINE node has D_i = 0.0 -> Q_i = 0.0.
// An offline node NEVER contributes a LOW_RISK / SAFE signal.

import { FRESHNESS_CONFIG } from './apodConfig.ts';
import type { APODFreshnessState } from './apodTypes.ts';

export interface ReliabilityFactors {
  nodeHealth: number;       // H_i in [0, 1]
  mlConfidence: number;     // C_i in [0, 1]
  dataFreshness: number;    // D_i in [0, 1]
  freshnessState?: APODFreshnessState;
  isOnline?: boolean;
}

/**
 * Maps freshness state to freshness factor D_i in [0, 1].
 */
export function getFreshnessFactor(
  state: APODFreshnessState,
  customWeights = FRESHNESS_CONFIG
): number {
  switch (state) {
    case 'FRESH':
      return customWeights.fresh;
    case 'RECENT':
      return customWeights.recent;
    case 'STALE':
      return customWeights.stale;
    case 'OFFLINE':
    default:
      return customWeights.offline;
  }
}

/**
 * Calculates the node reliability factor Q_i:
 * Q_i = H_i * C_i * D_i in [0, 1]
 *
 * Rules:
 * - If isOnline is false or state is OFFLINE, Q_i is strictly 0.0.
 * - H_i, C_i, and D_i are clamped to [0, 1].
 */
export function calculateNodeReliability(factors: ReliabilityFactors): number {
  const isOnline = factors.isOnline !== undefined ? factors.isOnline : factors.freshnessState !== 'OFFLINE';

  if (!isOnline || factors.freshnessState === 'OFFLINE') {
    return 0.0;
  }

  const h = Math.min(Math.max(Number.isFinite(factors.nodeHealth) ? factors.nodeHealth : 0, 0), 1);
  const c = Math.min(Math.max(Number.isFinite(factors.mlConfidence) ? factors.mlConfidence : 0, 0), 1);
  const d = Math.min(Math.max(Number.isFinite(factors.dataFreshness) ? factors.dataFreshness : 0, 0), 1);

  const q = h * c * d;
  return Math.min(Math.max(Number(q.toFixed(4)), 0.0), 1.0);
}
