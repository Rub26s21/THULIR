// ============================================================
// THULIR - ML Model Interface & Contracts
// ============================================================
// Defines the contract for ML models with tree-ensemble and ML inference support.

import type { SensorData, MLPrediction } from '../src/types';

export const THULIR_FEATURE_NAMES = [
  'tilt_x',
  'tilt_y',
  'tilt_magnitude',
  'pressure',
  'gas_raw',
  'temperature',
  'humidity',
  'distance_cm',
  'vib_rms'
] as const;

export type ThulirFeature = typeof THULIR_FEATURE_NAMES[number];

/**
 * ML Model Interface.
 */
export interface IThulirModel {
  name: string;
  version: string;
  isTrainedModel: boolean;
  featureNames: string[];
  predict(data: SensorData): MLPrediction;
  load?(): Promise<boolean>;
}

/**
 * Exported Decision Tree structure for browser inference.
 */
export interface DecisionTreeNode {
  feature: number[];
  threshold: number[];
  children_left: number[];
  children_right: number[];
  values: number[][];
}

export interface RandomForestModelWeights {
  model_name: string;
  model_version: string;
  n_estimators: number;
  feature_names: string[];
  class_names: string[];
  feature_medians: Record<string, number>;
  trees: DecisionTreeNode[];
}
