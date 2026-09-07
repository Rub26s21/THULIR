// ============================================================
// THULIR AI — A-POD Spatial Correlation Module
// ============================================================
// Evaluates whether abnormal nodes are isolated vs. spatially clustered
// using the mesh topology / neighbor adjacency graph.
//
// Core principle: One abnormal node must NEVER trigger a whole-area
// critical event. Multiple connected neighbors escalate spatial evidence.

import { SPATIAL_CONFIG } from './apodConfig.ts';
import type { APODEventScope } from './apodTypes.ts';

export interface SpatialNodeInput {
  nodeId: string;
  riskScore: number;
  isOnline: boolean;
  neighborNodeIds?: string[];
  zoneId?: string;
}

export interface SpatialLinkInput {
  node_id: string;
  neighbor_id: string;
  link_quality?: number;
}

export interface SpatialCorrelationResult {
  spatialScore: number;             // S in [0, 1]
  eventScope: APODEventScope;       // NODE | LOCALIZED | AREA | UNKNOWN
  eventType: string;                // Descriptive classification string
  abnormalNodeIds: string[];        // Nodes with elevated risk >= threshold
  correlatedClusters: string[][];   // Groups of adjacent abnormal nodes
  isMultiNodeCorrelated: boolean;
  isolatedNodeCount: number;
}

/**
 * Builds an adjacency map from neighbor lists and explicit links.
 */
function buildAdjacencyMap(
  nodes: SpatialNodeInput[],
  links: SpatialLinkInput[] = []
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const n of nodes) {
    if (!map.has(n.nodeId)) map.set(n.nodeId, new Set<string>());
    if (n.neighborNodeIds) {
      for (const neighbor of n.neighborNodeIds) {
        if (neighbor !== n.nodeId) {
          map.get(n.nodeId)!.add(neighbor);
        }
      }
    }
  }

  for (const l of links) {
    if (!map.has(l.node_id)) map.set(l.node_id, new Set<string>());
    if (!map.has(l.neighbor_id)) map.set(l.neighbor_id, new Set<string>());
    map.get(l.node_id)!.add(l.neighbor_id);
    map.get(l.neighbor_id)!.add(l.node_id);
  }

  return map;
}

/**
 * Finds connected components among abnormal nodes using breadth-first search.
 */
function findAbnormalClusters(
  abnormalNodeIds: string[],
  adjMap: Map<string, Set<string>>
): string[][] {
  const abnormalSet = new Set(abnormalNodeIds);
  const visited = new Set<string>();
  const clusters: string[][] = [];

  for (const nodeId of abnormalNodeIds) {
    if (visited.has(nodeId)) continue;

    const cluster: string[] = [];
    const queue = [nodeId];
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);

      const neighbors = adjMap.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (abnormalSet.has(neighbor) && !visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Evaluates the spatial correlation score S in [0, 1] and event scope.
 */
export function calculateSpatialCorrelation(
  nodes: SpatialNodeInput[],
  links: SpatialLinkInput[] = [],
  elevatedThreshold: number = SPATIAL_CONFIG.elevatedThreshold
): SpatialCorrelationResult {
  const onlineNodes = nodes.filter((n) => n.isOnline);

  if (onlineNodes.length === 0) {
    return {
      spatialScore: 0.0,
      eventScope: 'UNKNOWN',
      eventType: 'NO_ACTIVE_NODES',
      abnormalNodeIds: [],
      correlatedClusters: [],
      isMultiNodeCorrelated: false,
      isolatedNodeCount: 0,
    };
  }

  const abnormalNodes = onlineNodes.filter((n) => n.riskScore >= elevatedThreshold);
  const abnormalNodeIds = abnormalNodes.map((n) => n.nodeId);

  // Case 1: Zero abnormal nodes
  if (abnormalNodeIds.length === 0) {
    return {
      spatialScore: 0.0,
      eventScope: 'NODE',
      eventType: 'ALL_NODES_NOMINAL',
      abnormalNodeIds: [],
      correlatedClusters: [],
      isMultiNodeCorrelated: false,
      isolatedNodeCount: 0,
    };
  }

  const adjMap = buildAdjacencyMap(onlineNodes, links);
  const clusters = findAbnormalClusters(abnormalNodeIds, adjMap);

  // Find max connected cluster size
  let maxClusterSize = 0;
  for (const c of clusters) {
    if (c.length > maxClusterSize) maxClusterSize = c.length;
  }

  // Case 2: Exactly 1 abnormal node -> strictly isolated/localized, NEVER area critical
  if (abnormalNodeIds.length === 1) {
    return {
      spatialScore: SPATIAL_CONFIG.isolatedPenalty, // e.g. 0.15
      eventScope: 'LOCALIZED',
      eventType: 'ISOLATED_NODE_ANOMALY',
      abnormalNodeIds,
      correlatedClusters: clusters,
      isMultiNodeCorrelated: false,
      isolatedNodeCount: 1,
    };
  }

  // Case 3: Multiple abnormal nodes
  // Check if they form connected clusters or disjoint anomalies
  const connectedClusters = clusters.filter((c) => c.length >= 2);
  const isolatedClusters = clusters.filter((c) => c.length === 1);

  if (connectedClusters.length === 0) {
    // Multiple abnormal nodes, but NONE are neighbors!
    return {
      spatialScore: 0.30,
      eventScope: 'LOCALIZED',
      eventType: 'MULTIPLE_LOCALIZED_ANOMALIES',
      abnormalNodeIds,
      correlatedClusters: clusters,
      isMultiNodeCorrelated: false,
      isolatedNodeCount: isolatedClusters.length,
    };
  }

  // At least one multi-node connected cluster exists
  if (maxClusterSize >= 3 && abnormalNodeIds.length >= 3) {
    // 3 or more neighboring connected abnormal nodes -> Area-level event
    const fractionOfOnline = abnormalNodeIds.length / onlineNodes.length;
    const score = Math.min(0.70 + fractionOfOnline * 0.30, 1.0);

    return {
      spatialScore: Number(score.toFixed(4)),
      eventScope: 'AREA',
      eventType: 'DEVELOPING_AREA_EVENT',
      abnormalNodeIds,
      correlatedClusters: clusters,
      isMultiNodeCorrelated: true,
      isolatedNodeCount: isolatedClusters.length,
    };
  }

  // Exactly 2 neighboring abnormal nodes -> Correlated localized event
  return {
    spatialScore: SPATIAL_CONFIG.correlatedBonus, // e.g. 0.50 to 0.65
    eventScope: 'LOCALIZED',
    eventType: 'CORRELATED_LOCAL_EVENT',
    abnormalNodeIds,
    correlatedClusters: clusters,
    isMultiNodeCorrelated: true,
    isolatedNodeCount: isolatedClusters.length,
  };
}
