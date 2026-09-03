// ============================================================
// THULIR - Node Service
// ============================================================

import { getLatestReading } from './sensorService';
import { FRESHNESS_THRESHOLDS, SENSOR_META, NODE_ID } from '../config/thresholds';
import { safeDate } from '../utils/timeUtils';
import type { NodeStatus, FreshnessState, SensorHealthMap, SensorHealthState, SensorData } from '../types';

/**
 * Calculate data freshness based on the last reading timestamp.
 */
export function calculateFreshness(lastTimestamp: string | null): FreshnessState {
  if (!lastTimestamp) return 'OFFLINE';

  const d = safeDate(lastTimestamp);
  if (!d) return 'OFFLINE';

  // Protect against negative age from slight client/server clock skew
  const ageSeconds = Math.max(0, (Date.now() - d.getTime()) / 1000);

  if (ageSeconds < FRESHNESS_THRESHOLDS.live) return 'LIVE';
  if (ageSeconds < FRESHNESS_THRESHOLDS.recent) return 'RECENT';
  if (ageSeconds < FRESHNESS_THRESHOLDS.stale) return 'STALE';
  return 'OFFLINE';
}

/**
 * Calculate data age in seconds from a timestamp.
 */
export function calculateDataAge(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const d = safeDate(timestamp);
  if (!d) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
}

/**
 * Determine health state for an individual sensor value.
 */
export function getSensorHealthState(value: number | null): SensorHealthState {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'NO_DATA';
  return 'OK';
}

/**
 * Build sensor health map from a sensor data reading.
 */
export function buildSensorHealthMap(data: SensorData | null): SensorHealthMap {
  const map: SensorHealthMap = {};

  for (const meta of SENSOR_META) {
    const value = data ? (data[meta.key] as number | null) : null;
    map[meta.hardware] = {
      name: meta.name,
      state: getSensorHealthState(value),
      lastValue: value,
      lastUpdate: data?.created_at || null,
    };
  }

  return map;
}

/**
 * Get full node status including health, freshness, and sensor status.
 */
export async function getNodeStatus(nodeId: string = NODE_ID): Promise<NodeStatus> {
  const latest = await getLatestReading(nodeId);

  const lastSeen = latest?.created_at || null;
  const freshness = calculateFreshness(lastSeen);
  const dataAge = calculateDataAge(lastSeen);
  const sensorHealth = buildSensorHealthMap(latest);

  return {
    node_id: nodeId,
    online: freshness === 'LIVE' || freshness === 'RECENT',
    freshness,
    lastSeen,
    dataAge,
    sensorHealth,
  };
}

/**
 * Get freshness state from existing data (no new query).
 */
export function getNodeStatusFromData(data: SensorData | null, nodeId: string = NODE_ID): NodeStatus {
  const lastSeen = data?.created_at || null;
  const freshness = calculateFreshness(lastSeen);
  const dataAge = calculateDataAge(lastSeen);
  const sensorHealth = buildSensorHealthMap(data);

  return {
    node_id: nodeId,
    online: freshness === 'LIVE' || freshness === 'RECENT',
    freshness,
    lastSeen,
    dataAge,
    sensorHealth,
  };
}
