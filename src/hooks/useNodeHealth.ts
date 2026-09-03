// ============================================================
// THULIR - Node Health Hook
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { getNodeStatusFromData } from '../services/nodeService';
import { NODE_ID } from '../config/thresholds';
import type { SensorData, NodeStatus } from '../types';

export function useNodeHealth(latestData: SensorData | null): NodeStatus {
  // Tick every second to update data freshness
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    return getNodeStatusFromData(latestData, NODE_ID);
  }, [latestData]);
}
