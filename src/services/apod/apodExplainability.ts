// ============================================================
// THULIR AI — A-POD Explainability & Operator Guidance Module
// ============================================================
// Generates deterministic, human-interpretable natural language reasoning
// explaining WHY the aggregated network is in its current state.
//
// Invariants:
// 1. Strictly deterministic logic (NO LLM, zero hallucinations).
// 2. Clear distinctions between LOCALIZED and AREA events.
// 3. Clear distinction between ML Risk and Physical Safety Alerts.
// 4. Safe, non-evacuation operator recommendations.

import type {
  APODNetworkState,
  APODEventScope,
  APODRiskTrend,
} from './apodTypes.ts';

export interface ExplainabilityContext {
  networkState: APODNetworkState;
  evidenceScore: number | null;
  networkRisk: number | null;
  eventScope: APODEventScope;
  eventType: string;
  spatialScore: number;
  temporalScore: number;
  sensorAgreementScore: number;
  confidence: number;
  riskTrend: APODRiskTrend;
  highRiskNodes: string[];
  moderateRiskNodes: string[];
  normalNodes: string[];
  unknownNodes: string[];
  hasConflict: boolean;
  conflictReason?: string;
  hasPhysicalCriticalOverride: boolean;
  missingSignalCount: number;
}

/**
 * Synthesizes a deterministic natural-language explanation of current evidence.
 */
export function generateAPODExplanation(ctx: ExplainabilityContext): string {
  if (ctx.networkState === 'UNKNOWN' || ctx.evidenceScore === null) {
    if (ctx.unknownNodes.length > 0) {
      return `Telemetry unavailable or stale for active nodes (${ctx.unknownNodes.join(', ')}). Insufficient continuous data to compute reliable network evidence.`;
    }
    return 'No active telemetry frames available. Network state is indeterminate.';
  }

  const parts: string[] = [];

  // 1. Critical Physical Safety Override
  if (ctx.hasPhysicalCriticalOverride) {
    parts.push(
      'CRITICAL PHYSICAL ALERT: A deterministic sensor threshold violation was triggered in mine strata telemetry, elevating network priority independent of ML classifier consensus.'
    );
  }

  // 2. Spatial Scope & Node distribution
  if (ctx.eventScope === 'AREA') {
    parts.push(
      `Area-wide elevated risk detected across multiple adjacent nodes (${ctx.highRiskNodes.concat(ctx.moderateRiskNodes).join(', ')}). Spatial correlation score is high (${(ctx.spatialScore * 100).toFixed(0)}%).`
    );
  } else if (ctx.eventScope === 'LOCALIZED') {
    if (ctx.highRiskNodes.length === 1) {
      parts.push(
        `Abnormal condition is localized to ${ctx.highRiskNodes[0]}. Surrounding neighbor nodes remain nominal, bounding the spatial envelope.`
      );
    } else if (ctx.eventType === 'MULTIPLE_LOCALIZED_ANOMALIES') {
      parts.push(
        `Disjoint anomalies detected at ${ctx.highRiskNodes.join(' and ')}. Nodes are not adjacent, indicating separate localized occurrences rather than a unified area event.`
      );
    } else {
      parts.push(
        `Correlated localized anomaly developing between neighboring nodes (${ctx.highRiskNodes.concat(ctx.moderateRiskNodes).join(', ')}).`
      );
    }
  } else if (ctx.networkState === 'NORMAL') {
    parts.push(
      'All active nodes exhibit nominal strata behavior with low risk scores across inclinometer, barometric, acoustic, and gas channels.'
    );
  }

  // 3. Temporal Persistence & Trend
  if (ctx.riskTrend === 'RISING') {
    parts.push(
      `Risk trend is RISING with sustained temporal persistence (${(ctx.temporalScore * 100).toFixed(0)}%).`
    );
  } else if (ctx.riskTrend === 'FALLING') {
    parts.push('Risk trend is FALLING across recent telemetry windows.');
  } else if (ctx.temporalScore >= 0.70) {
    parts.push('Elevated risk pattern has persisted across consecutive observation cycles.');
  }

  // 4. Sensor Agreement & Conflicts
  if (ctx.hasConflict && ctx.conflictReason) {
    parts.push(`Sensor conflict noted: ${ctx.conflictReason}`);
  }

  if (ctx.missingSignalCount > 0) {
    parts.push(`${ctx.missingSignalCount} measurement channel(s) currently unavailable.`);
  }

  return parts.join(' ');
}

/**
 * Returns safe, calibrated operational guidance based on network state and scope.
 */
export function getRecommendedAction(
  networkState: APODNetworkState,
  eventScope: APODEventScope,
  hasPhysicalCriticalOverride: boolean
): string {
  if (hasPhysicalCriticalOverride || networkState === 'CRITICAL') {
    return 'Trigger the configured critical response procedure and perform immediate physical inspection of affected strata.';
  }

  if (networkState === 'HIGH') {
    if (eventScope === 'AREA') {
      return 'Perform operator verification of the affected sector and inspect neighboring sensor nodes for strata displacement.';
    }
    return 'Perform localized operator verification around the affected node and continue close trend monitoring.';
  }

  if (networkState === 'ELEVATED') {
    return 'Review affected node telemetry trends and cross-reference barometric and tilt stability.';
  }

  if (networkState === 'WATCH') {
    return 'Continue routine monitoring and observe subsequent 5-second telemetry cycles for trend persistence.';
  }

  if (networkState === 'NORMAL') {
    return 'Continue routine multi-node surveillance. All strata safety envelopes are nominal.';
  }

  return 'Restore node telemetry and verify wireless mesh connectivity before drawing risk conclusions.';
}
