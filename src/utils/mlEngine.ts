// ============================================================
// THULIR - Real Machine Learning Engine (Random Forest)
// ============================================================
// Executes real ensemble inference using the trained Random Forest model.
// Falls back to deterministic threshold safety checks if weights are missing.

import { SENSOR_THRESHOLDS } from '../config/thresholds.ts';
import type { SensorData, MLPrediction } from '../types/index.ts';
import type { RandomForestModelWeights } from '../../ml/model.ts';
import { THULIR_FEATURE_NAMES } from '../../ml/model.ts';
import embeddedModelWeights from '../../ml/models/model_weights.json' with { type: 'json' };

// Embedded synchronously available trained weights artifact
let activeModelWeights: RandomForestModelWeights = embeddedModelWeights as unknown as RandomForestModelWeights;
let isModelLoaded = true;
let loadPromise: Promise<boolean> | null = null;

export const ML_METADATA = {
  modelName: 'Random Forest Classifier',
  modelVersion: 'thulir-risk-rf-v1.0',
  algorithm: 'Ensemble Decision Trees (100 Estimators, Max Depth 8)',
  dataset: 'thulir_sensor_dataset.csv (Development / Prototype)',
  disclaimer: 'Trained on synthetic development dataset derived from engineering safety thresholds.',
  featuresCount: 9,
  targetClasses: ['LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK'],
};

/**
 * Feature engineering from raw sensor data.
 * Produces the standardized 9-dimensional feature dictionary.
 */
export function extractFeatures(data: SensorData): Record<string, number | null> {
  const tiltMagnitude =
    data.tilt_x !== null && data.tilt_y !== null
      ? Math.sqrt(data.tilt_x ** 2 + data.tilt_y ** 2)
      : null;

  return {
    tilt_x: data.tilt_x,
    tilt_y: data.tilt_y,
    tilt_magnitude: tiltMagnitude,
    pressure: data.pressure,
    gas_raw: data.gas_raw,
    temperature: data.temperature,
    humidity: data.humidity,
    distance_cm: data.distance_cm,
    vib_rms: data.vib_rms,
  };
}

/**
 * Load model weights from public/models/model_weights.json (if dynamic reloading is required).
 */
export async function loadModelWeights(): Promise<boolean> {
  if (isModelLoaded && activeModelWeights) return true;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch('/models/model_weights.json');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} loading model weights`);
      }
      const data: RandomForestModelWeights = await res.json();
      if (data && data.trees && data.trees.length > 0) {
        activeModelWeights = data;
        isModelLoaded = true;
        return true;
      }
      return true; // Embedded weights active
    } catch {
      // Retain synchronous embedded weights
      activeModelWeights = embeddedModelWeights as unknown as RandomForestModelWeights;
      isModelLoaded = true;
      return true;
    }
  })();

  return loadPromise;
}

// Kick off async load immediately in browser
if (typeof window !== 'undefined') {
  loadModelWeights().catch(() => {});
}

/**
 * Rule-based fallback safety evaluation
 */
function runRuleBasedFallback(data: SensorData, start: number): MLPrediction {
  const features = extractFeatures(data);
  let riskScore = 0;
  let maxSeverity = 0;
  let validChecks = 0;

  const checks: [string, number | null][] = [
    ['tilt_x', features.tilt_x],
    ['tilt_y', features.tilt_y],
    ['pressure', features.pressure],
    ['gas_raw', features.gas_raw],
    ['temperature', features.temperature],
    ['humidity', features.humidity],
    ['distance_cm', features.distance_cm],
    ['vib_rms', features.vib_rms],
  ];

  for (const [key, value] of checks) {
    if (value === null || !Number.isFinite(value)) continue;
    validChecks++;

    const threshold = SENSOR_THRESHOLDS[key];
    if (!threshold) continue;

    let compareValue = value;
    if (threshold.direction === 'absolute') compareValue = Math.abs(value);

    let sensorSeverity = 0;
    if (threshold.direction === 'below') {
      if (compareValue <= threshold.critical) sensorSeverity = 2;
      else if (compareValue <= threshold.watch) sensorSeverity = 1;
    } else {
      if (compareValue >= threshold.critical) sensorSeverity = 2;
      else if (compareValue >= threshold.watch) sensorSeverity = 1;
    }

    riskScore += sensorSeverity;
    maxSeverity = Math.max(maxSeverity, sensorSeverity);
  }

  let prediction = 'LOW_RISK';
  let confidence = 0.6;

  if (validChecks === 0) {
    prediction = 'INSUFFICIENT_DATA';
    confidence = 0;
  } else if (maxSeverity >= 2 || riskScore >= 4) {
    prediction = 'HIGH_RISK';
    confidence = Math.min(0.6 + (riskScore / (validChecks * 2)) * 0.35, 0.95);
  } else if (maxSeverity >= 1 || riskScore >= 2) {
    prediction = 'MODERATE_RISK';
    confidence = Math.min(0.5 + (riskScore / (validChecks * 2)) * 0.3, 0.85);
  }

  const inferenceTime = performance.now() - start;

  return {
    node_id: data.node_id,
    event_id: data.event_id,
    prediction,
    confidence: Math.round(confidence * 1000) / 1000,
    model_name: 'Rule-Based Safety Classifier',
    model_version: 'fallback-v1.0',
    model_type: 'RULE_BASED_FALLBACK',
    features_used: THULIR_FEATURE_NAMES as unknown as string[],
    sensor_timestamp: data.created_at,
    inference_timestamp: new Date().toISOString(),
    inference_time_ms: Math.round(inferenceTime * 100) / 100,
  };
}

/**
 * Execute real Random Forest ensemble inference on incoming sensor telemetry.
 */
export function runMLInference(data: SensorData): MLPrediction {
  const start = performance.now();

  // If model is not loaded, use safety fallback
  if (!isModelLoaded || !activeModelWeights) {
    return runRuleBasedFallback(data, start);
  }

  try {
    const rawFeatures = extractFeatures(data);
    const medians = activeModelWeights.feature_medians;
    const classNames = activeModelWeights.class_names;
    const numClasses = classNames.length;

    // Vectorize & impute missing values with model medians
    const xVector: number[] = [];
    const featureValuesMap: Record<string, number> = {};
    let hasAnyValid = false;

    // Ordered 9-feature vector: [tilt_x, tilt_y, tilt_magnitude, pressure, gas_raw, temperature, humidity, distance_cm, vib_rms]
    for (const feat of activeModelWeights.feature_names) {
      let val = rawFeatures[feat];
      if (val === null || val === undefined || !Number.isFinite(val)) {
        val = medians[feat] ?? 0.0;
      } else {
        hasAnyValid = true;
      }
      xVector.push(val);
      featureValuesMap[feat] = val;
    }

    if (!hasAnyValid) {
      return runRuleBasedFallback(data, start);
    }

    // Accumulate class vote distribution across all decision trees
    const classVotes = new Array<number>(numClasses).fill(0);
    const trees = activeModelWeights.trees;

    for (let t = 0; t < trees.length; t++) {
      const tree = trees[t];
      let nodeIdx = 0;

      // Traverse binary tree until leaf
      while (tree.children_left[nodeIdx] !== -1) {
        const splitFeat = tree.feature[nodeIdx];
        const splitThresh = tree.threshold[nodeIdx];

        if (xVector[splitFeat] <= splitThresh) {
          nodeIdx = tree.children_left[nodeIdx];
        } else {
          nodeIdx = tree.children_right[nodeIdx];
        }
      }

      // Leaf distribution
      const leafVals = tree.values[nodeIdx];
      let leafSum = 0;
      for (let c = 0; c < numClasses; c++) {
        leafSum += leafVals[c];
      }

      if (leafSum > 0) {
        for (let c = 0; c < numClasses; c++) {
          classVotes[c] += leafVals[c] / leafSum;
        }
      }
    }

    // Average probabilities across all trees
    const probabilities: Record<string, number> = {};
    let bestClassIdx = 0;
    let maxProb = -1;

    for (let c = 0; c < numClasses; c++) {
      const prob = classVotes[c] / trees.length;
      const cName = classNames[c];
      probabilities[cName] = Math.round(prob * 10000) / 10000;

      if (prob > maxProb) {
        maxProb = prob;
        bestClassIdx = c;
      }
    }

    const inferenceTime = performance.now() - start;

    return {
      node_id: data.node_id,
      event_id: data.event_id,
      prediction: classNames[bestClassIdx],
      confidence: Math.round(maxProb * 1000) / 1000,
      probabilities,
      model_name: activeModelWeights.model_name,
      model_version: activeModelWeights.model_version,
      model_type: 'TRAINED',
      features_used: activeModelWeights.feature_names,
      features_values: featureValuesMap,
      sensor_timestamp: data.created_at,
      inference_timestamp: new Date().toISOString(),
      inference_time_ms: Math.round(inferenceTime * 100) / 100,
    };
  } catch (err) {
    console.error('[ML] Exception during model inference, falling back:', err);
    return runRuleBasedFallback(data, start);
  }
}
