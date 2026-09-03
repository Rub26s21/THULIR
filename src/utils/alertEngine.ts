// ============================================================
// THULIR - Production Alert Engine
// ============================================================
// Generates, deduplicates, and auto-resolves structural & environmental alerts.
// Core rules:
// 1. Deduplication: Persistent conditions update active alerts rather than spamming.
// 2. Auto-Resolution: Resolved when sensor measurements return to safe range.
// 3. Acknowledgement: ACKNOWLEDGED !== RESOLVED (remains active until physical recovery).

import { SENSOR_THRESHOLDS, SENSOR_META, NODE_ID } from '../config/thresholds';
import type { SensorData, Alert, AlertSeverity, AlertStatus, MLPrediction } from '../types';

/**
 * Generate a deterministic deduplication key for alert tracking.
 */
export function getAlertDeduplicationKey(
  nodeId: string,
  sensor: string,
  severity: AlertSeverity,
  source: string = 'RULE_BASED'
): string {
  return `${nodeId}:${sensor}:${severity}:${source}`;
}

export interface EvaluateAlertsResult {
  updatedAlerts: Alert[];
  newAlertsCount: number;
  resolvedAlertsCount: number;
}

/**
 * Pure alert evaluation pipeline.
 * Takes current telemetry, ML prediction, and existing alert list.
 * Returns an updated, deduplicated, auto-resolved list of alerts.
 */
export function evaluateAlerts(
  data: SensorData | null,
  mlPrediction: MLPrediction | null | undefined,
  existingAlerts: Alert[]
): EvaluateAlertsResult {
  if (!data) {
    return {
      updatedAlerts: existingAlerts,
      newAlertsCount: 0,
      resolvedAlertsCount: 0,
    };
  }

  const currentViolations = new Map<string, {
    sensor: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    value: number | null;
    threshold: number;
    source: 'RULE_BASED' | 'ML' | 'COMBINED';
  }>();

  // 1. Evaluate Individual Physical Sensor Thresholds
  for (const meta of SENSOR_META) {
    const key = meta.key as string;
    const value = data[meta.key] as number | null;
    if (value === null || value === undefined || !Number.isFinite(value)) continue;

    const threshold = SENSOR_THRESHOLDS[key];
    if (!threshold) continue;

    let compareValue = value;
    if (threshold.direction === 'absolute') {
      compareValue = Math.abs(value);
    }

    let severity: AlertSeverity | null = null;
    let thresholdVal = 0;
    let title = '';
    let message = '';

    if (threshold.direction === 'below') {
      if (compareValue <= threshold.critical) {
        severity = 'CRITICAL';
        thresholdVal = threshold.critical;
        title = `Critical Low ${meta.name}`;
        message = `${meta.name} dropped below critical limit (${compareValue.toFixed(2)} ${threshold.unit} ≤ ${threshold.critical} ${threshold.unit})`;
      } else if (compareValue <= threshold.watch) {
        severity = 'WATCH';
        thresholdVal = threshold.watch;
        title = `Watch Advisory: Low ${meta.name}`;
        message = `${meta.name} below watch threshold (${compareValue.toFixed(2)} ${threshold.unit} ≤ ${threshold.watch} ${threshold.unit})`;
      }
    } else {
      if (compareValue >= threshold.critical) {
        severity = 'CRITICAL';
        thresholdVal = threshold.critical;
        title = `Critical ${meta.name} Breach`;
        message = `${meta.name} exceeded critical threshold (${compareValue.toFixed(2)} ${threshold.unit} ≥ ${threshold.critical} ${threshold.unit})`;
      } else if (compareValue >= threshold.watch) {
        severity = 'WATCH';
        thresholdVal = threshold.watch;
        title = `Elevated ${meta.name}`;
        message = `${meta.name} entered watch threshold (${compareValue.toFixed(2)} ${threshold.unit} ≥ ${threshold.watch} ${threshold.unit})`;
      }
    }

    if (severity) {
      const dedupKey = getAlertDeduplicationKey(data.node_id || NODE_ID, meta.name, severity, 'RULE_BASED');
      currentViolations.set(dedupKey, {
        sensor: meta.name,
        severity,
        title,
        message,
        value,
        threshold: thresholdVal,
        source: 'RULE_BASED',
      });
    }
  }

  // 2. Evaluate Combined Tilt Magnitude Threshold
  if (data.tilt_x !== null && data.tilt_y !== null && Number.isFinite(data.tilt_x) && Number.isFinite(data.tilt_y)) {
    const tiltMag = Math.sqrt(data.tilt_x ** 2 + data.tilt_y ** 2);
    if (tiltMag >= 21.2) {
      const dedupKey = getAlertDeduplicationKey(data.node_id || NODE_ID, 'Tilt Vector', 'CRITICAL', 'RULE_BASED');
      currentViolations.set(dedupKey, {
        sensor: 'Tilt Vector',
        severity: 'CRITICAL',
        title: 'Critical Structural Angular Displacement',
        message: `Combined tilt vector exceeded critical tolerance (${tiltMag.toFixed(2)}° ≥ 21.20°)`,
        value: tiltMag,
        threshold: 21.2,
        source: 'RULE_BASED',
      });
    } else if (tiltMag >= 7.07) {
      const dedupKey = getAlertDeduplicationKey(data.node_id || NODE_ID, 'Tilt Vector', 'WATCH', 'RULE_BASED');
      currentViolations.set(dedupKey, {
        sensor: 'Tilt Vector',
        severity: 'WATCH',
        title: 'Elevated Tilt Vector',
        message: `Combined tilt vector entered advisory range (${tiltMag.toFixed(2)}° ≥ 7.07°)`,
        value: tiltMag,
        threshold: 7.07,
        source: 'RULE_BASED',
      });
    }
  }

  // 3. Evaluate Machine Learning Elevated Risk
  if (mlPrediction && mlPrediction.prediction !== 'INSUFFICIENT_DATA') {
    if (mlPrediction.prediction === 'HIGH_RISK') {
      const dedupKey = getAlertDeduplicationKey(data.node_id || NODE_ID, 'ML Ensemble', 'CRITICAL', 'ML');
      currentViolations.set(dedupKey, {
        sensor: 'ML Ensemble',
        severity: 'CRITICAL',
        title: 'AI Multi-Sensor Structural Anomaly',
        message: `Random Forest (${mlPrediction.model_version}) detected high multi-sensor risk with ${(mlPrediction.confidence * 100).toFixed(1)}% confidence`,
        value: mlPrediction.confidence,
        threshold: 0.5,
        source: 'ML',
      });
    } else if (mlPrediction.prediction === 'MODERATE_RISK' && mlPrediction.confidence >= 0.70) {
      const dedupKey = getAlertDeduplicationKey(data.node_id || NODE_ID, 'ML Ensemble', 'WATCH', 'ML');
      currentViolations.set(dedupKey, {
        sensor: 'ML Ensemble',
        severity: 'WATCH',
        title: 'AI Advisory Anomaly Warning',
        message: `Random Forest (${mlPrediction.model_version}) detected moderate risk condition with ${(mlPrediction.confidence * 100).toFixed(1)}% confidence`,
        value: mlPrediction.confidence,
        threshold: 0.5,
        source: 'ML',
      });
    }
  }

  // 4. Update / Deduplicate / Resolve Alerts
  let newAlertsCount = 0;
  let resolvedAlertsCount = 0;
  const processedKeys = new Set<string>();

  // Clone existing alerts
  const nextAlerts: Alert[] = existingAlerts.map(alert => {
    if (alert.status === 'RESOLVED') return alert;

    const key = getAlertDeduplicationKey(alert.node_id, alert.sensor, alert.severity, alert.source);
    processedKeys.add(key);

    const activeViolation = currentViolations.get(key);

    if (activeViolation) {
      // Condition is STILL ACTIVE: Update current value and retain status (ACTIVE or ACKNOWLEDGED)
      return {
        ...alert,
        value: activeViolation.value,
        message: activeViolation.message,
      };
    } else {
      // Condition has NORMALIZED: Auto-resolve alert
      resolvedAlertsCount++;
      return {
        ...alert,
        status: 'RESOLVED' as AlertStatus,
        resolved_at: new Date().toISOString(),
      };
    }
  });

  // 5. Create New Alerts for Unseen Violations
  for (const [key, violation] of currentViolations.entries()) {
    if (!processedKeys.has(key)) {
      newAlertsCount++;
      nextAlerts.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        node_id: data.node_id || NODE_ID,
        event_id: data.event_id || null,
        sensor: violation.sensor,
        severity: violation.severity,
        title: violation.title,
        message: violation.message,
        value: violation.value,
        threshold: violation.threshold,
        status: 'ACTIVE',
        source: violation.source,
        acknowledged: false,
        created_at: data.created_at || new Date().toISOString(),
        resolved_at: null,
      });
    }
  }

  return {
    updatedAlerts: nextAlerts,
    newAlertsCount,
    resolvedAlertsCount,
  };
}
