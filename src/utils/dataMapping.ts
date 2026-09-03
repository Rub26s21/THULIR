// ============================================================
// THULIR - Data Mapping Layer
// ============================================================
// Maps between Supabase DB column names and canonical app fields.
// If the DB schema uses different names, update ONLY this file.

import type { SensorData, RawSensorRow } from '../types';
import { safeDate } from './timeUtils';

/**
 * DB column → App field mapping.
 * Key = DB column name, Value = SensorData field name.
 * Only include mappings where names differ.
 */
const DB_TO_APP_MAP: Record<string, keyof SensorData> = {
  // Configured dynamically if column names differ:
  // temp: 'temperature',
  // hum: 'humidity',
  // gas: 'gas_raw',
  // disp_mm: 'distance_cm',
};

/** Fields that exist in canonical SensorData */
const CANONICAL_FIELDS: (keyof SensorData)[] = [
  'id', 'node_id', 'event_id',
  'tilt_x', 'tilt_y', 'pressure', 'gas_raw',
  'temperature', 'humidity', 'distance_cm', 'vib_rms',
  'created_at',
];

/**
 * Map a raw DB row to a canonical SensorData object.
 * Handles column name differences, missing fields, non-finite numbers, and type coercion.
 */
export function mapRowToSensorData(row: RawSensorRow | null | undefined): SensorData {
  if (!row || typeof row !== 'object') {
    return {
      id: 0,
      node_id: 'NODE_01',
      event_id: null,
      tilt_x: null,
      tilt_y: null,
      pressure: null,
      gas_raw: null,
      temperature: null,
      humidity: null,
      distance_cm: null,
      vib_rms: null,
      created_at: new Date().toISOString(),
    };
  }

  const mapped: Record<string, unknown> = {};

  // 1. Direct mappings for matching field names
  for (const field of CANONICAL_FIELDS) {
    if (field in row) {
      mapped[field] = row[field];
    }
  }

  // 2. Custom mappings for different column names
  for (const [dbCol, appField] of Object.entries(DB_TO_APP_MAP)) {
    if (dbCol in row && !(appField in mapped)) {
      mapped[appField] = row[dbCol];
    }
  }

  // 3. Ensure numeric fields are properly sanitized (reject NaN, Infinity, non-numeric strings)
  const numericFields: (keyof SensorData)[] = [
    'tilt_x', 'tilt_y', 'pressure', 'gas_raw',
    'temperature', 'humidity', 'distance_cm', 'vib_rms',
  ];

  for (const field of numericFields) {
    const val = mapped[field];
    if (val === undefined || val === null || val === '') {
      mapped[field] = null;
    } else {
      const num = Number(val);
      mapped[field] = Number.isFinite(num) ? num : null;
    }
  }

  // 4. Validate timestamp
  const rawCreatedAt = mapped.created_at ? String(mapped.created_at) : null;
  const validCreatedAt = safeDate(rawCreatedAt)?.toISOString() || new Date().toISOString();

  return {
    id: Number(mapped.id) || 0,
    node_id: String(mapped.node_id || 'NODE_01'),
    event_id: mapped.event_id ? String(mapped.event_id) : null,
    tilt_x: mapped.tilt_x as number | null,
    tilt_y: mapped.tilt_y as number | null,
    pressure: mapped.pressure as number | null,
    gas_raw: mapped.gas_raw !== null ? Math.round(Number(mapped.gas_raw)) : null,
    temperature: mapped.temperature as number | null,
    humidity: mapped.humidity as number | null,
    distance_cm: mapped.distance_cm as number | null,
    vib_rms: mapped.vib_rms as number | null,
    created_at: validCreatedAt,
  };
}

/**
 * Map a canonical SensorData object back to DB column names.
 * Used when constructing queries with DB-specific column names.
 */
export function getDbColumnName(appField: keyof SensorData): string {
  for (const [dbCol, field] of Object.entries(DB_TO_APP_MAP)) {
    if (field === appField) return dbCol;
  }
  return appField;
}
