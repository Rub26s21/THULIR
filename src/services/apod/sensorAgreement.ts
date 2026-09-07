// ============================================================
// THULIR AI — A-POD Sensor Agreement & Conflict Module
// ============================================================
// Analyzes physical telemetry channels across nodes to evaluate
// multi-sensor agreement M in [0, 1] and detect physical signal conflicts.
//
// Rules:
// 1. Missing data (null/undefined) is UNKNOWN / UNAVAILABLE, never NORMAL or 0.
// 2. Classifies physical channels as SUPPORTING, CONTRADICTING, or MISSING.
// 3. Flags SENSOR_CONFLICT when elevated environmental/vibrational signals
//    occur without structural deformation agreement.

import { SENSOR_THRESHOLDS } from '../../config/thresholds.ts';
import type { SensorData } from '../../types/index.ts';
import type { SignalDetail, APODRiskClass } from './apodTypes.ts';

export interface SensorAgreementResult {
  agreementScore: number;            // M in [0, 1]
  hasConflict: boolean;
  conflictReason?: string;
  supportingSignals: SignalDetail[];
  contradictingSignals: SignalDetail[];
  missingSignals: SignalDetail[];
  availableChannelRatio: number;
}

/**
 * Checks whether an individual sensor channel is elevated above watch/critical thresholds.
 */
function checkChannelElevated(key: string, value: number | null): { isElevated: boolean; isCritical: boolean } {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { isElevated: false, isCritical: false };
  }

  const threshold = SENSOR_THRESHOLDS[key];
  if (!threshold) return { isElevated: false, isCritical: false };

  const val = threshold.direction === 'absolute' ? Math.abs(value) : value;

  if (threshold.direction === 'below') {
    return {
      isElevated: val <= threshold.watch,
      isCritical: val <= threshold.critical,
    };
  } else {
    return {
      isElevated: val >= threshold.watch,
      isCritical: val >= threshold.critical,
    };
  }
}

/**
 * Evaluates sensor agreement score M in [0, 1], categorizing supporting,
 * contradicting, and missing telemetry channels for a given node.
 */
export function calculateSensorAgreement(
  telemetry: SensorData | null,
  predictedRiskClass: APODRiskClass
): SensorAgreementResult {
  if (!telemetry) {
    return {
      agreementScore: 0.5,
      hasConflict: false,
      supportingSignals: [],
      contradictingSignals: [],
      missingSignals: [
        { sensor: 'ALL', type: 'MISSING', message: 'No telemetry frame received', value: null },
      ],
      availableChannelRatio: 0.0,
    };
  }

  const supporting: SignalDetail[] = [];
  const contradicting: SignalDetail[] = [];
  const missing: SignalDetail[] = [];

  const channels: { key: keyof SensorData; label: string; unit: string }[] = [
    { key: 'tilt_x', label: 'Tilt X Inclinometer', unit: '°' },
    { key: 'tilt_y', label: 'Tilt Y Pitch', unit: '°' },
    { key: 'vib_rms', label: '3D Seismic RMS Vibration', unit: 'm/s²' },
    { key: 'gas_raw', label: 'Toxic & Flammable Gas', unit: 'raw' },
    { key: 'distance_cm', label: 'Roof Subsidence Sonar Distance', unit: 'cm' },
    { key: 'pressure', label: 'Barometric Cavity Pressure', unit: 'hPa' },
    { key: 'temperature', label: 'Mine Ambient Temperature', unit: '°C' },
    { key: 'humidity', label: 'Relative Strata Humidity', unit: '%' },
  ];

  let availableCount = 0;
  let elevatedPhysicalCount = 0;
  let deformationElevated = false;
  let disturbanceElevated = false;

  for (const ch of channels) {
    const val = telemetry[ch.key];
    const numVal = typeof val === 'number' && Number.isFinite(val) ? val : null;

    if (numVal === null) {
      missing.push({
        sensor: ch.label,
        type: 'MISSING',
        message: `${ch.label} channel unavailable (telemetry missing)`,
        value: null,
      });
      continue;
    }

    availableCount++;
    const { isElevated } = checkChannelElevated(ch.key as string, numVal);

    if (isElevated) {
      elevatedPhysicalCount++;
      if (ch.key === 'tilt_x' || ch.key === 'tilt_y' || ch.key === 'distance_cm') {
        deformationElevated = true;
      }
      if (ch.key === 'vib_rms' || ch.key === 'gas_raw') {
        disturbanceElevated = true;
      }
    }

    const formattedVal = Number.isInteger(numVal) ? numVal : Number(numVal.toFixed(2));

    // Correlate with ML prediction
    if (predictedRiskClass === 'HIGH_RISK' || predictedRiskClass === 'MODERATE_RISK') {
      if (isElevated) {
        supporting.push({
          sensor: ch.label,
          type: 'SUPPORTING',
          message: `${ch.label} elevated (${formattedVal} ${ch.unit}) supporting ${predictedRiskClass}`,
          value: numVal,
        });
      } else {
        contradicting.push({
          sensor: ch.label,
          type: 'CONTRADICTING',
          message: `${ch.label} nominal (${formattedVal} ${ch.unit}) while ML predicted ${predictedRiskClass}`,
          value: numVal,
        });
      }
    } else {
      // predictedRiskClass === 'LOW_RISK'
      if (!isElevated) {
        supporting.push({
          sensor: ch.label,
          type: 'SUPPORTING',
          message: `${ch.label} nominal (${formattedVal} ${ch.unit}) supporting LOW_RISK`,
          value: numVal,
        });
      } else {
        contradicting.push({
          sensor: ch.label,
          type: 'CONTRADICTING',
          message: `${ch.label} elevated (${formattedVal} ${ch.unit}) contradicting ML LOW_RISK`,
          value: numVal,
        });
      }
    }
  }

  const availableRatio = availableCount / channels.length;

  // Conflict detection: elevated vibration or gas without deformation signals
  let hasConflict = false;
  let conflictReason: string | undefined;

  if (disturbanceElevated && !deformationElevated && (predictedRiskClass === 'HIGH_RISK' || predictedRiskClass === 'MODERATE_RISK')) {
    hasConflict = true;
    conflictReason = 'Elevated vibration and/or gas present without structural strata deformation confirmation.';
  }

  // Calculate continuous M score
  // Agreement ratio of supporting vs total available
  let agreementRatio = availableCount > 0 ? supporting.length / availableCount : 0.5;

  // Reduce agreement score if physical conflict is detected
  if (hasConflict) {
    agreementRatio = Math.max(agreementRatio * 0.70, 0.25);
  }

  // Factor in missing channel penalty
  const finalScore = agreementRatio * (0.60 + 0.40 * availableRatio);

  return {
    agreementScore: Math.min(Math.max(Number(finalScore.toFixed(4)), 0.0), 1.0),
    hasConflict,
    conflictReason,
    supportingSignals: supporting,
    contradictingSignals: contradicting,
    missingSignals: missing,
    availableChannelRatio: Number(availableRatio.toFixed(4)),
  };
}
