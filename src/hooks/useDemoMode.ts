// ============================================================
// THULIR - Demo Mode Hook
// ============================================================
// Generates realistic simulated sensor data for testing/presentation.
// CLEARLY LABELED: demo data is never treated as real data.

import { useState, useEffect, useCallback, useRef } from 'react';
import { DEMO_UPDATE_INTERVAL_MS, DEMO_BASE_VALUES } from '../config/thresholds';
import type { SensorData } from '../types';

let demoCounter = 0;

function generateDemoReading(nodeId: string = 'NODE_01'): SensorData {
  demoCounter++;
  const noise = (range: number) => (Math.random() - 0.5) * range;
  const t = demoCounter * 0.1;

  // Simulate slow drift + noise
  const tiltX = DEMO_BASE_VALUES.tilt_x + Math.sin(t * 0.3) * 2 + noise(0.5);
  const tiltY = DEMO_BASE_VALUES.tilt_y + Math.cos(t * 0.2) * 1.5 + noise(0.5);
  const pressure = DEMO_BASE_VALUES.pressure + Math.sin(t * 0.05) * 5 + noise(1);
  const gasRaw = DEMO_BASE_VALUES.gas_raw + Math.sin(t * 0.1) * 50 + noise(20);
  const temperature = DEMO_BASE_VALUES.temperature + Math.sin(t * 0.08) * 3 + noise(0.3);
  const humidity = DEMO_BASE_VALUES.humidity + Math.cos(t * 0.06) * 5 + noise(1);
  const distance = DEMO_BASE_VALUES.distance_cm + Math.sin(t * 0.15) * 8 + noise(1);
  const vibRms = DEMO_BASE_VALUES.vib_rms + Math.abs(Math.sin(t * 0.4)) * 0.1 + noise(0.02);

  // Occasionally simulate threshold conditions (every ~60 readings)
  const anomaly = demoCounter % 60 > 55;

  return {
    id: demoCounter,
    node_id: nodeId,
    event_id: `demo-${Date.now()}-${demoCounter}`,
    tilt_x: Math.round((anomaly ? tiltX * 3 : tiltX) * 100) / 100,
    tilt_y: Math.round(tiltY * 100) / 100,
    pressure: Math.round(pressure * 100) / 100,
    gas_raw: Math.round(anomaly ? gasRaw + 300 : gasRaw),
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity * 10) / 10,
    distance_cm: Math.round(distance * 100) / 100,
    vib_rms: Math.round(Math.max(0, anomaly ? vibRms + 0.8 : vibRms) * 10000) / 10000,
    created_at: new Date().toISOString(),
  };
}

export function useDemoMode(enabled: boolean, selectedNodeId: string = 'NODE_01') {
  const [demoData, setDemoData] = useState<SensorData | null>(() => (enabled ? generateDemoReading(selectedNodeId) : null));
  const [demoHistory, setDemoHistory] = useState<SensorData[]>(() => (demoData ? [demoData] : []));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateReading = useCallback(() => {
    const reading = generateDemoReading(selectedNodeId);
    setDemoData(reading);
    setDemoHistory(prev => {
      const next = [...prev, reading];
      return next.length > 500 ? next.slice(-500) : next;
    });
  }, [selectedNodeId]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(generateReading, DEMO_UPDATE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, generateReading]);

  return { demoData, demoHistory };
}
