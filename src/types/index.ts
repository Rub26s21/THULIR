// ============================================================
// THULIR - Core Type Definitions
// ============================================================

// --- Sensor Data ---

export interface SensorData {
  id: number;
  node_id: string;
  event_id: string | null;
  tilt_x: number | null;
  tilt_y: number | null;
  pressure: number | null;
  gas_raw: number | null;
  temperature: number | null;
  humidity: number | null;
  distance_cm: number | null;
  vib_rms: number | null;
  created_at: string;
}

/** Raw DB row — if Supabase schema uses different column names, map here */
export interface RawSensorRow {
  [key: string]: unknown;
}

// --- Risk & Status ---

export type RiskLevel = 'NORMAL' | 'WATCH' | 'CRITICAL';

export interface RiskReason {
  sensor: string;
  message: string;
  value: number | null;
  threshold: number;
  severity: RiskLevel;
  source?: 'RULE_BASED' | 'ML' | 'COMBINED';
}

export interface RiskState {
  level: RiskLevel;
  score: number;
  source: 'ML' | 'RULE_BASED' | 'COMBINED';
  confidence: number;
  reasons: RiskReason[];
  triggeredSensors: string[];
  mlPrediction?: MLPrediction | null;
  timestamp: string;
}

// --- Alerts ---

export type AlertSeverity = 'INFO' | 'WATCH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: number;
  node_id: string;
  event_id?: string | null;
  sensor: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  value: number | null;
  threshold: number;
  status: AlertStatus;
  source: 'RULE_BASED' | 'ML' | 'COMBINED';
  acknowledged: boolean;
  created_at: string;
  resolved_at: string | null;
}

// --- Node Status ---

export type FreshnessState = 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE';

export interface NodeStatus {
  node_id: string;
  online: boolean;
  freshness: FreshnessState;
  lastSeen: string | null;
  dataAge: number | null; // seconds
  sensorHealth: SensorHealthMap;
}

export type SensorHealthState = 'OK' | 'WARNING' | 'ERROR' | 'NO_DATA';

export interface SensorHealth {
  name: string;
  state: SensorHealthState;
  lastValue: number | null;
  lastUpdate: string | null;
}

export type SensorHealthMap = Record<string, SensorHealth>;

// --- ML ---

export interface MLPrediction {
  id?: number;
  node_id: string;
  event_id?: string | null;
  prediction: string;
  confidence: number;
  probabilities?: Record<string, number>;
  model_name?: string;
  model_version: string;
  model_type: 'TRAINED' | 'RULE_BASED_FALLBACK';
  features_used?: string[];
  features_values?: Record<string, number>;
  sensor_timestamp?: string;
  inference_timestamp: string;
  inference_time_ms?: number;
  created_at?: string;
}

// --- Connection ---

export type DataSource = 'LIVE' | 'DEMO' | 'NO_DATA' | 'ERROR';
export type ConnectionType = 'REALTIME' | 'POLLING' | 'DISCONNECTED';

export interface ConnectionState {
  dataSource: DataSource;
  connectionType: ConnectionType;
  supabaseConnected: boolean;
  lastUpdated: string | null;
  error: string | null;
}

// --- Chart ---

export type TimeRange = '1H' | '6H' | '24H' | '7D';

export interface ChartDataPoint {
  timestamp: string;
  value: number | null;
}

// --- Sensor Metadata ---

export interface SensorMeta {
  key: keyof Omit<SensorData, 'id' | 'node_id' | 'event_id' | 'created_at'>;
  name: string;
  unit: string;
  hardware: string;
  icon: string;
  precision: number;
}
