// ============================================================
// THULIR AI — A-POD Reactive React Hook (useAPOD)
// ============================================================
// Connects multi-node telemetry, node statuses, local ML predictions,
// topology links, and temporal history to the A-POD Fusion Engine.
//
// Invariant: React components strictly display the calculated APODResult.
// Mathematical aggregation is performed deterministically by the engine.

import { useState, useEffect, useMemo } from 'react';
import { runAPODEngine } from '../services/apod/apodEngine.ts';
import { calculateNodeRiskScore } from '../services/apod/nodeRisk.ts';
import { getFreshnessFactor } from '../services/apod/reliability.ts';
import { calculateFreshness } from '../services/nodeService';
import type {
  NodeRiskState,
  APODResult,
  APODRiskClass,
  APODFreshnessState,
} from '../services/apod/apodTypes.ts';
import type { NodeRecord, NodeLink, SensorData, MLPrediction, RiskState } from '../types';

interface UseAPODOptions {
  nodes: NodeRecord[];
  nodeLinks?: NodeLink[];
  selectedNodeId?: string;
  latestSensorData?: SensorData | null;
  activeMlPrediction?: MLPrediction | null;
  activeRisk?: RiskState | null;
}

export function useAPOD({
  nodes,
  nodeLinks = [],
  selectedNodeId = 'NODE_01',
  latestSensorData = null,
  activeMlPrediction = null,
  activeRisk = null,
}: UseAPODOptions): APODResult {
  // Maintain a buffer of recent network risk scores for temporal analysis (up to 12 items)
  const [riskHistory, setRiskHistory] = useState<number[]>([]);

  // Map application node records into normalized NodeRiskState contracts
  const nodeRiskStates: NodeRiskState[] = useMemo(() => {
    return nodes.map((node) => {
      const isSelected = node.node_id === selectedNodeId;
      const rawTimestamp = isSelected && latestSensorData ? latestSensorData.created_at : node.last_seen;
      const rawFreshness = calculateFreshness(rawTimestamp);

      let freshnessState: APODFreshnessState = 'OFFLINE';
      if (rawFreshness === 'LIVE') freshnessState = 'FRESH';
      else if (rawFreshness === 'RECENT') freshnessState = 'RECENT';
      else if (rawFreshness === 'STALE') freshnessState = 'STALE';
      else freshnessState = 'OFFLINE';

      const dataFreshness = getFreshnessFactor(freshnessState);
      const isOnline = (freshnessState === 'FRESH' || freshnessState === 'RECENT') && Boolean(rawTimestamp);
      const nodeHealth = isOnline ? (node.status === 'ONLINE' ? 1.0 : 0.65) : 0.0;

      let nodeState: 'REAL' | 'UNKNOWN' | 'OFFLINE' | 'STALE' = 'UNKNOWN';
      let probabilities = { low: 0, moderate: 0, high: 0 };
      let riskClass: APODRiskClass = 'LOW_RISK';
      let mlConfidence = 0.0;
      let hasPhysicalCriticalViolation = false;

      if (isSelected && latestSensorData && isOnline) {
        if (activeMlPrediction && activeMlPrediction.prediction !== 'INSUFFICIENT_DATA' && activeMlPrediction.probabilities) {
          nodeState = 'REAL';
          probabilities = {
            low: activeMlPrediction.probabilities.LOW_RISK ?? 0.0,
            moderate: activeMlPrediction.probabilities.MODERATE_RISK ?? 0.0,
            high: activeMlPrediction.probabilities.HIGH_RISK ?? 0.0,
          };
          riskClass = (activeMlPrediction.prediction as APODRiskClass) || 'LOW_RISK';
          mlConfidence = activeMlPrediction.confidence || 0.0;
        } else {
          nodeState = 'UNKNOWN';
        }

        if (activeRisk?.level === 'CRITICAL') {
          hasPhysicalCriticalViolation = true;
        }
      } else if (!isOnline) {
        nodeState = freshnessState === 'STALE' ? 'STALE' : 'OFFLINE';
      } else {
        nodeState = 'UNKNOWN';
      }

      const riskScore = nodeState === 'REAL' ? calculateNodeRiskScore(probabilities, riskClass) : 0.0;

      // 3. Neighbors from topology
      const neighbors = nodeLinks
        .filter((l) => l.node_id === node.node_id || l.neighbor_id === node.node_id)
        .map((l) => (l.node_id === node.node_id ? l.neighbor_id : l.node_id));

      return {
        nodeId: node.node_id,
        nodeState,
        timestamp: rawTimestamp || new Date().toISOString(),
        riskClass,
        probabilities,
        riskScore,
        mlConfidence,
        nodeHealth,
        sensorHealth: isOnline ? 1.0 : 0.0,
        dataFreshness,
        freshnessState,
        isOnline,
        hasPhysicalCriticalViolation,
        zoneId: node.zone_id || 'ZONE_A',
        latitude: node.latitude,
        longitude: node.longitude,
        altitude: node.altitude,
        neighborNodeIds: neighbors,
      };
    });
  }, [nodes, nodeLinks, selectedNodeId, latestSensorData, activeMlPrediction, activeRisk]);

  // Execute A-POD Fusion Engine deterministically
  const apodResult = useMemo(() => {
    const latestSensorMap: Record<string, SensorData | null> = {
      [selectedNodeId]: latestSensorData,
    };

    const linksInput = nodeLinks.map((l) => ({
      node_id: l.node_id,
      neighbor_id: l.neighbor_id,
      link_quality: l.link_quality,
    }));

    return runAPODEngine({
      podId: 'THULIR-A-POD-01',
      zoneId: 'MINE_SECTOR_MAIN',
      nodes: nodeRiskStates,
      links: linksInput,
      historicalNetworkRiskSeries: riskHistory,
      latestSensorDataByNode: latestSensorMap,
    });
  }, [nodeRiskStates, nodeLinks, selectedNodeId, latestSensorData, riskHistory]);

  // Record history point whenever network risk updates
  useEffect(() => {
    if (apodResult.networkRisk !== null) {
      const current = apodResult.networkRisk;
      setRiskHistory((prev) => [...prev.slice(-11), current]);
    }
  }, [apodResult.networkRisk]);

  return apodResult;
}
