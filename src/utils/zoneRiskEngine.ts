// ============================================================
// THULIR - Prototype Zone Risk Aggregation Engine
// ============================================================
// Aggregates individual sensor node risk states across mine zones
// (Longwall panels, haulage drifts, return airways) for spatial awareness.

import type { RiskLevel, RiskState, ZoneRiskState, NodeRecord } from '../types';
import { KNOWN_ZONES } from '../config/thresholds';

export function calculateZoneRisk(
  zoneId: string,
  nodes: NodeRecord[],
  nodeRiskMap: Record<string, RiskState | null>
): ZoneRiskState {
  const zoneConfig = KNOWN_ZONES.find((z) => z.id === zoneId) || {
    id: zoneId,
    name: `Zone ${zoneId}`,
  };

  const zoneNodes = nodes.filter((n) => (n.zone_id || 'ZONE_A') === zoneId);
  const contributingNodes: { node_id: string; level: RiskLevel; score: number }[] = [];

  let maxScore = 0;
  let hasCritical = false;
  let hasWatch = false;
  let onlineCount = 0;

  for (const node of zoneNodes) {
    const risk = nodeRiskMap[node.node_id];
    if (node.status === 'ONLINE') {
      onlineCount++;
    }

    if (risk) {
      contributingNodes.push({
        node_id: node.node_id,
        level: risk.level,
        score: risk.score,
      });

      if (risk.score > maxScore) {
        maxScore = risk.score;
      }
      if (risk.level === 'CRITICAL') {
        hasCritical = true;
      } else if (risk.level === 'WATCH') {
        hasWatch = true;
      }
    } else {
      contributingNodes.push({
        node_id: node.node_id,
        level: 'NORMAL',
        score: 0,
      });
    }
  }

  let aggregatedRisk: RiskLevel = 'NORMAL';
  if (hasCritical) {
    aggregatedRisk = 'CRITICAL';
  } else if (hasWatch) {
    aggregatedRisk = 'WATCH';
  }

  let summary = `Zone nominal across ${zoneNodes.length} node(s)`;
  if (zoneNodes.length === 0) {
    summary = 'No nodes assigned to this mine sector';
  } else if (onlineCount === 0) {
    summary = `Sector telemetry inactive (${zoneNodes.length} node(s) offline)`;
  } else if (hasCritical) {
    summary = `CRITICAL anomaly detected in sector! Evacuation protocol advised.`;
  } else if (hasWatch) {
    summary = `Elevated convergence / tilt trend detected in sector. Inspection advised.`;
  }

  return {
    zone_id: zoneId,
    zone_name: zoneConfig.name,
    aggregatedRisk,
    maxScore,
    nodeCount: zoneNodes.length,
    onlineNodeCount: onlineCount,
    contributingNodes,
    summary,
    isPrototype: true,
  };
}
