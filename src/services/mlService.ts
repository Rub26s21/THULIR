// ============================================================
// THULIR - ML Service
// ============================================================

import { runMLInference, loadModelWeights, ML_METADATA } from '../utils/mlEngine';
import type { SensorData, MLPrediction } from '../types';

/**
 * Initialize / pre-load the ML model weights.
 */
export async function initializeMLModel(): Promise<boolean> {
  return loadModelWeights();
}

/**
 * Run ML inference on sensor data.
 */
export async function runInference(data: SensorData): Promise<MLPrediction> {
  return runMLInference(data);
}

/**
 * Get ML metadata.
 */
export function getMLMetadata() {
  return ML_METADATA;
}
