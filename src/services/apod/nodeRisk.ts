// ============================================================
// THULIR AI — A-POD Node Risk Score Module
// ============================================================
// Converts independent node ML class probability distribution into
// a normalized continuous risk score R_i in [0, 1].

import { NODE_RISK_WEIGHTS } from './apodConfig.ts';
import type { APODRiskClass } from './apodTypes.ts';

export interface NodeProbabilityInput {
  low: number;
  moderate: number;
  high: number;
}

/**
 * Calculate the normalized node risk score R_i from ML probability outputs:
 * R_i = 0.0 * P_low + 0.5 * P_moderate + 1.0 * P_high
 *
 * Guarantees:
 * - R_i is strictly clamped to [0, 1].
 * - Handles non-normalized or missing inputs gracefully by normalizing probabilities.
 * - This is an evidence/risk score, NOT a probability of subsidence.
 */
export function calculateNodeRiskScore(
  probabilities?: Partial<NodeProbabilityInput> | null,
  fallbackRiskClass?: APODRiskClass
): number {
  if (!probabilities) {
    if (fallbackRiskClass === 'HIGH_RISK') return 0.85;
    if (fallbackRiskClass === 'MODERATE_RISK') return 0.50;
    if (fallbackRiskClass === 'LOW_RISK') return 0.10;
    return 0.0;
  }

  let pLow = Number(probabilities.low ?? 0);
  let pMod = Number(probabilities.moderate ?? 0);
  let pHigh = Number(probabilities.high ?? 0);

  // Guard against negative numbers or NaNs
  pLow = Number.isFinite(pLow) && pLow >= 0 ? pLow : 0;
  pMod = Number.isFinite(pMod) && pMod >= 0 ? pMod : 0;
  pHigh = Number.isFinite(pHigh) && pHigh >= 0 ? pHigh : 0;

  const sum = pLow + pMod + pHigh;

  // Normalize if sum is positive and deviates from 1.0
  if (sum > 0 && Math.abs(sum - 1.0) > 0.001) {
    pLow /= sum;
    pMod /= sum;
    pHigh /= sum;
  } else if (sum === 0) {
    if (fallbackRiskClass === 'HIGH_RISK') return 0.85;
    if (fallbackRiskClass === 'MODERATE_RISK') return 0.50;
    return 0.10;
  }

  const score =
    NODE_RISK_WEIGHTS.low * pLow +
    NODE_RISK_WEIGHTS.moderate * pMod +
    NODE_RISK_WEIGHTS.high * pHigh;

  return Math.min(Math.max(Number(score.toFixed(4)), 0.0), 1.0);
}
