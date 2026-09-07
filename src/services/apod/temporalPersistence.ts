// ============================================================
// THULIR AI — A-POD Temporal Persistence & Trend Module
// ============================================================
// Tracks node-state history over a configurable sliding window to
// evaluate persistence T in [0, 1] and risk trends.
//
// Invariant: Single transient noise spikes do not escalate temporal
// evidence. Sustained elevated observations increase T.

import { PERSISTENCE_CONFIG } from './apodConfig.ts';
import type { APODRiskTrend, NodeHistoryRecord } from './apodTypes.ts';

export interface TemporalNodeHistoryMap {
  [nodeId: string]: NodeHistoryRecord[];
}

export interface TemporalPersistenceResult {
  temporalScore: number;           // T in [0, 1]
  riskTrend: APODRiskTrend;        // RISING | STABLE | FALLING | FLUCTUATING | UNKNOWN
  consecutiveElevatedCount: number;
  averageHistoricalRisk: number;
  rateOfChange: number;            // Linear slope per observation
  observationCount: number;
}

/**
 * Calculates linear regression slope for an array of numbers.
 */
function calculateSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0.0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0.0;

  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Evaluates temporal persistence score T in [0, 1] and risk trend
 * across the sliding window of recent network risk observations.
 */
export function calculateTemporalPersistence(
  recentRiskScores: number[],
  elevatedThreshold: number = PERSISTENCE_CONFIG.elevatedThreshold,
  windowSize: number = PERSISTENCE_CONFIG.windowSize
): TemporalPersistenceResult {
  if (!recentRiskScores || recentRiskScores.length === 0) {
    return {
      temporalScore: 0.0,
      riskTrend: 'UNKNOWN',
      consecutiveElevatedCount: 0,
      averageHistoricalRisk: 0.0,
      rateOfChange: 0.0,
      observationCount: 0,
    };
  }

  // Use the most recent 'windowSize' observations
  const series = recentRiskScores.slice(-windowSize);
  const n = series.length;

  // 1. Calculate consecutive elevated observations from the end
  let consecutiveElevated = 0;
  for (let i = n - 1; i >= 0; i--) {
    if (series[i] >= elevatedThreshold) {
      consecutiveElevated++;
    } else {
      break;
    }
  }

  // 2. Average risk across window
  const sum = series.reduce((acc, val) => acc + val, 0);
  const avgRisk = sum / n;

  // 3. Slope & Trend detection
  const slope = calculateSlope(series);

  let trend: APODRiskTrend = 'STABLE';
  if (n >= 2) {
    if (slope >= PERSISTENCE_CONFIG.risingSlopeThreshold) {
      trend = 'RISING';
    } else if (slope <= PERSISTENCE_CONFIG.fallingSlopeThreshold) {
      trend = 'FALLING';
    } else {
      // Check for fluctuations
      let directionChanges = 0;
      for (let i = 2; i < n; i++) {
        const d1 = series[i - 1] - series[i - 2];
        const d2 = series[i] - series[i - 1];
        if (d1 * d2 < -0.01) {
          directionChanges++;
        }
      }
      if (directionChanges >= 2) {
        trend = 'FLUCTUATING';
      } else {
        trend = 'STABLE';
      }
    }
  }

  // 4. Calculate continuous Persistence Score T in [0, 1]
  // Base persistence from the ratio of elevated points and streak length
  const elevatedRatio = series.filter((v) => v >= elevatedThreshold).length / n;
  const streakRatio = consecutiveElevated / Math.max(n, 1);

  let score = 0.5 * elevatedRatio + 0.5 * streakRatio;

  // Boost if rising and elevated
  if (trend === 'RISING') {
    score = Math.min(score + (consecutiveElevated >= 2 ? 0.20 : 0.10), 1.0);
  }

  // Dampen if falling
  if (trend === 'FALLING') {
    score = Math.max(score - 0.20, 0.0);
  }

  return {
    temporalScore: Math.min(Math.max(Number(score.toFixed(4)), 0.0), 1.0),
    riskTrend: trend,
    consecutiveElevatedCount: consecutiveElevated,
    averageHistoricalRisk: Number(avgRisk.toFixed(4)),
    rateOfChange: Number(slope.toFixed(4)),
    observationCount: n,
  };
}
