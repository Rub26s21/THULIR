// ============================================================
// THULIR - Centralized Threshold Configuration
// ============================================================
// All thresholds in one place. Never scatter magic numbers.

import type { SensorData } from '../types';

// --- Sensor Thresholds ---

export interface ThresholdConfig {
  watch: number;
  critical: number;
  unit: string;
  direction: 'above' | 'below' | 'absolute'; // absolute = |value| compared
}

export const SENSOR_THRESHOLDS: Record<string, ThresholdConfig> = {
  tilt_x: { watch: 5, critical: 15, unit: '°', direction: 'absolute' },
  tilt_y: { watch: 5, critical: 15, unit: '°', direction: 'absolute' },
  pressure: { watch: 980, critical: 950, unit: 'hPa', direction: 'below' },
  gas_raw: { watch: 400, critical: 700, unit: '', direction: 'above' },
  temperature: { watch: 40, critical: 50, unit: '°C', direction: 'above' },
  humidity: { watch: 80, critical: 90, unit: '%', direction: 'above' },
  distance_cm: { watch: 10, critical: 5, unit: 'cm', direction: 'below' },
  vib_rms: { watch: 0.5, critical: 1.5, unit: 'm/s²', direction: 'above' },
};

// --- Data Freshness Thresholds (seconds) ---

export const FRESHNESS_THRESHOLDS = {
  live: 15,        // data < 15s old
  recent: 60,      // data < 60s old
  stale: 300,      // data < 5min old
  // anything older = OFFLINE
} as const;

// --- Polling & Realtime ---

export const POLLING_INTERVAL_MS = 5000;
export const REALTIME_CHANNEL = 'sensor_data_changes';

// --- Chart History Limits ---

export const HISTORY_LIMITS: Record<string, { hours: number; maxRows: number }> = {
  '1H': { hours: 1, maxRows: 720 },
  '6H': { hours: 6, maxRows: 1000 },
  '24H': { hours: 24, maxRows: 1500 },
  '7D': { hours: 168, maxRows: 2000 },
};

// --- Sensor Metadata ---

export const SENSOR_META = [
  { key: 'tilt_x' as keyof SensorData, name: 'Tilt X', unit: '°', hardware: 'MPU6050', icon: 'RotateCcw', precision: 2 },
  { key: 'tilt_y' as keyof SensorData, name: 'Tilt Y', unit: '°', hardware: 'MPU6050', icon: 'RotateCw', precision: 2 },
  { key: 'pressure' as keyof SensorData, name: 'Pressure', unit: 'hPa', hardware: 'BMP280', icon: 'Gauge', precision: 2 },
  { key: 'gas_raw' as keyof SensorData, name: 'Gas', unit: 'raw', hardware: 'MQ-2', icon: 'Wind', precision: 0 },
  { key: 'temperature' as keyof SensorData, name: 'Temperature', unit: '°C', hardware: 'DHT22', icon: 'Thermometer', precision: 1 },
  { key: 'humidity' as keyof SensorData, name: 'Humidity', unit: '%', hardware: 'DHT22', icon: 'Droplets', precision: 1 },
  { key: 'distance_cm' as keyof SensorData, name: 'Distance', unit: 'cm', hardware: 'HC-SR04', icon: 'Ruler', precision: 2 },
  { key: 'vib_rms' as keyof SensorData, name: 'Vibration', unit: 'm/s²', hardware: 'ADXL345', icon: 'Activity', precision: 4 },
] as const;

// --- Node & Multi-Node Mesh Config ---

export const DEFAULT_NODE_ID = 'NODE_01';
export const NODE_ID = 'NODE_01'; // Backward compatibility
export const DEFAULT_NODE_IDS = ['NODE_01', 'NODE_02', 'NODE_03', 'NODE_04'] as const;
export const TRANSMISSION_INTERVAL_S = 5;

export const REALTIME_NODES_CHANNEL = 'nodes_changes';
export const REALTIME_LINKS_CHANNEL = 'node_links_changes';
export const REALTIME_PACKETS_CHANNEL = 'mesh_packets_changes';

export const KNOWN_ZONES = [
  { id: 'ZONE_A', name: 'Zone Alpha — Longwall Panel 4', criticalThresholdCount: 1 },
  { id: 'ZONE_B', name: 'Zone Beta — Haulage Drift East', criticalThresholdCount: 1 },
  { id: 'ZONE_C', name: 'Zone Gamma — Return Airway North', criticalThresholdCount: 1 },
] as const;

// --- Demo Mode ---

export const DEMO_UPDATE_INTERVAL_MS = 5000;

export const DEMO_BASE_VALUES: Record<string, number> = {
  tilt_x: 1.2,
  tilt_y: -0.8,
  pressure: 1013.25,
  gas_raw: 280,
  temperature: 28.5,
  humidity: 62.0,
  distance_cm: 42.0,
  vib_rms: 0.08,
};

