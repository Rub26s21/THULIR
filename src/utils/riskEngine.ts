// ============================================================
// THULIR - Centralized Risk Engine
// ============================================================
// Combines physical sensor safety thresholds with Random Forest ML inference.
// Guarantees: Critical physical threshold violations CANNOT be masked by ML.
// Uses centralized thresholds and mathematical tilt aggregation.

import { SENSOR_THRESHOLDS } from '../config/thresholds';
import type { SensorData, RiskState, RiskLevel, RiskReason, MLPrediction } from '../types';

/**
 * Evaluate an individual sensor value against its configured engineering thresholds.
 */
function evaluateSensor(
  sensorKey: string,
  value: number | null,
  name: string
): RiskReason | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;

  const threshold = SENSOR_THRESHOLDS[sensorKey];
  if (!threshold) return null;

  let compareValue = value;
  if (threshold.direction === 'absolute') {
    compareValue = Math.abs(value);
  }

  // Check critical threshold first
  if (threshold.direction === 'below') {
    if (compareValue <= threshold.critical) {
      return {
        sensor: name,
        message: `${name} breached critical threshold (${compareValue.toFixed(2)} ${threshold.unit} ≤ ${threshold.critical} ${threshold.unit})`,
        value,
        threshold: threshold.critical,
        severity: 'CRITICAL',
        source: 'RULE_BASED',
      };
    }
    if (compareValue <= threshold.watch) {
      return {
        sensor: name,
        message: `${name} entered watch threshold (${compareValue.toFixed(2)} ${threshold.unit} ≤ ${threshold.watch} ${threshold.unit})`,
        value,
        threshold: threshold.watch,
        severity: 'WATCH',
        source: 'RULE_BASED',
      };
    }
  } else {
    // 'above' or 'absolute'
    if (compareValue >= threshold.critical) {
      return {
        sensor: name,
        message: `${name} breached critical threshold (${compareValue.toFixed(2)} ${threshold.unit} ≥ ${threshold.critical} ${threshold.unit})`,
        value,
        threshold: threshold.critical,
        severity: 'CRITICAL',
        source: 'RULE_BASED',
      };
    }
    if (compareValue >= threshold.watch) {
      return {
        sensor: name,
        message: `${name} entered watch threshold (${compareValue.toFixed(2)} ${threshold.unit} ≥ ${threshold.watch} ${threshold.unit})`,
        value,
        threshold: threshold.watch,
        severity: 'WATCH',
        source: 'RULE_BASED',
      };
    }
  }

  return null;
}

/**
 * Central Risk Evaluation: Sensor Thresholds + ML Inference Fusion.
 * Implements deterministic safety precedence (CRITICAL > WATCH > NORMAL).
 */
export function evaluateRisk(
  data: SensorData | null,
  mlPrediction?: MLPrediction | null
): RiskState {
  const defaultState: RiskState = {
    level: 'NORMAL',
    score: 0,
    source: 'RULE_BASED',
    confidence: 1.0,
    reasons: [],
    triggeredSensors: [],
    mlPrediction: mlPrediction || null,
    timestamp: new Date().toISOString(),
  };

  if (!data) return defaultState;

  const reasons: RiskReason[] = [];
  const triggeredSensors = new Set<string>();

  // 1. Evaluate Individual Physical Sensors
  const sensorChecks: [string, number | null, string][] = [
    ['tilt_x', data.tilt_x, 'Tilt X'],
    ['tilt_y', data.tilt_y, 'Tilt Y'],
    ['pressure', data.pressure, 'Pressure'],
    ['gas_raw', data.gas_raw, 'Gas'],
    ['temperature', data.temperature, 'Temperature'],
    ['humidity', data.humidity, 'Humidity'],
    ['distance_cm', data.distance_cm, 'Distance'],
    ['vib_rms', data.vib_rms, 'Vibration'],
  ];

  for (const [key, value, name] of sensorChecks) {
    const reason = evaluateSensor(key, value, name);
    if (reason) {
      reasons.push(reason);
      triggeredSensors.add(name);
    }
  }

  // 2. Evaluate Combined Tilt Magnitude (sqrt(tilt_x^2 + tilt_y^2))
  if (data.tilt_x !== null && data.tilt_y !== null && Number.isFinite(data.tilt_x) && Number.isFinite(data.tilt_y)) {
    const tiltMag = Math.sqrt(data.tilt_x ** 2 + data.tilt_y ** 2);
    // Combined tilt thresholds: watch = 7.07°, critical = 21.2°
    if (tiltMag >= 21.2) {
      reasons.push({
        sensor: 'Tilt Magnitude',
        message: `Combined tilt vector breached critical threshold (${tiltMag.toFixed(2)}° ≥ 21.20°)`,
        value: tiltMag,
        threshold: 21.2,
        severity: 'CRITICAL',
        source: 'RULE_BASED',
      });
      triggeredSensors.add('Tilt Magnitude');
    } else if (tiltMag >= 7.07) {
      reasons.push({
        sensor: 'Tilt Magnitude',
        message: `Combined tilt vector reached watch threshold (${tiltMag.toFixed(2)}° ≥ 7.07°)`,
        value: tiltMag,
        threshold: 7.07,
        severity: 'WATCH',
        source: 'RULE_BASED',
      });
      triggeredSensors.add('Tilt Magnitude');
    }
  }

  // 3. Evaluate Machine Learning Classifier Input
  let mlLevel: RiskLevel = 'NORMAL';
  if (mlPrediction && mlPrediction.prediction !== 'INSUFFICIENT_DATA') {
    if (mlPrediction.prediction === 'HIGH_RISK') {
      mlLevel = 'CRITICAL';
      reasons.push({
        sensor: 'AI Ensemble',
        message: `Random Forest model (${mlPrediction.model_version}) predicted HIGH_RISK with ${(mlPrediction.confidence * 100).toFixed(1)}% confidence`,
        value: mlPrediction.confidence,
        threshold: 0.5,
        severity: 'CRITICAL',
        source: 'ML',
      });
      triggeredSensors.add('ML Ensemble');
    } else if (mlPrediction.prediction === 'MODERATE_RISK') {
      mlLevel = 'WATCH';
      reasons.push({
        sensor: 'AI Ensemble',
        message: `Random Forest model (${mlPrediction.model_version}) predicted MODERATE_RISK with ${(mlPrediction.confidence * 100).toFixed(1)}% confidence`,
        value: mlPrediction.confidence,
        threshold: 0.5,
        severity: 'WATCH',
        source: 'ML',
      });
      triggeredSensors.add('ML Ensemble');
    }
  }

  // 4. Combine Severity with Precedence: CRITICAL > WATCH > NORMAL
  const hasCriticalRule = reasons.some(r => r.severity === 'CRITICAL' && r.source === 'RULE_BASED');
  const hasWatchRule = reasons.some(r => r.severity === 'WATCH' && r.source === 'RULE_BASED');

  let finalLevel: RiskLevel = 'NORMAL';
  let source: 'ML' | 'RULE_BASED' | 'COMBINED' = 'RULE_BASED';

  if (hasCriticalRule || mlLevel === 'CRITICAL') {
    finalLevel = 'CRITICAL';
    source = hasCriticalRule && mlLevel === 'CRITICAL' ? 'COMBINED' : hasCriticalRule ? 'RULE_BASED' : 'ML';
  } else if (hasWatchRule || mlLevel === 'WATCH') {
    finalLevel = 'WATCH';
    source = hasWatchRule && mlLevel === 'WATCH' ? 'COMBINED' : hasWatchRule ? 'RULE_BASED' : 'ML';
  }

  // 5. Calculate Consolidated Risk Score (0 - 100)
  let score = 0;
  for (const r of reasons) {
    if (r.severity === 'CRITICAL') score += 40;
    else if (r.severity === 'WATCH') score += 18;
  }
  if (mlPrediction?.prediction === 'HIGH_RISK') score += 20;
  else if (mlPrediction?.prediction === 'MODERATE_RISK') score += 10;
  score = Math.min(Math.max(score, finalLevel === 'CRITICAL' ? 75 : finalLevel === 'WATCH' ? 35 : 0), 100);

  const confidence = mlPrediction ? mlPrediction.confidence : 1.0;

  return {
    level: finalLevel,
    score,
    source,
    confidence,
    reasons,
    triggeredSensors: Array.from(triggeredSensors),
    mlPrediction: mlPrediction || null,
    timestamp: data.created_at || new Date().toISOString(),
  };
}
