// ============================================================
// THULIR - Local Storage & Offline Telemetry Buffer Service
// ============================================================
// Provides a local fallback ring-buffer contract when field connectivity
// is degraded, ensuring no sensor readings are lost before gateway backhaul.

import type { OfflineSyncContract, SensorData } from '../types';

const OFFLINE_BUFFER_KEY = 'thulir_offline_telemetry_queue';
const MAX_LOCAL_QUEUE_ITEMS = 500;

export function getOfflineBufferState(): OfflineSyncContract {
  try {
    const raw = localStorage.getItem(OFFLINE_BUFFER_KEY);
    const queue: SensorData[] = raw ? JSON.parse(raw) : [];
    const usedBytes = new Blob([raw || '']).size;

    return {
      localQueueLength: queue.length,
      lastSyncedAt: queue.length > 0 ? null : new Date().toISOString(),
      isBuffering: queue.length > 0,
      storageQuotaBytes: 5 * 1024 * 1024, // 5MB standard localStorage
      usedBytes,
    };
  } catch {
    return {
      localQueueLength: 0,
      lastSyncedAt: new Date().toISOString(),
      isBuffering: false,
      storageQuotaBytes: 5 * 1024 * 1024,
      usedBytes: 0,
    };
  }
}

export function queueReadingLocally(reading: SensorData): void {
  try {
    const raw = localStorage.getItem(OFFLINE_BUFFER_KEY);
    const queue: SensorData[] = raw ? JSON.parse(raw) : [];
    if (queue.length >= MAX_LOCAL_QUEUE_ITEMS) {
      queue.shift(); // Evict oldest
    }
    queue.push(reading);
    localStorage.setItem(OFFLINE_BUFFER_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[OFFLINE_SYNC] Could not buffer reading locally:', err);
  }
}

export function clearOfflineBuffer(): void {
  try {
    localStorage.removeItem(OFFLINE_BUFFER_KEY);
  } catch (err) {
    console.warn('[OFFLINE_SYNC] Could not clear buffer:', err);
  }
}
