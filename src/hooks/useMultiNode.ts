// ============================================================
// THULIR - Multi-Node Mesh Hook
// ============================================================
// Manages multi-node discovery, active node selection, and telemetry-driven status.

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NodeRecord, NodeLink, MeshPacket, RegistryNodeStatus } from '../types';
import { getRegisteredNodes, getNodeLinks, getRecentMeshPackets } from '../services/meshService';
import { DEFAULT_NODE_IDS, DEFAULT_NODE_ID } from '../config/thresholds';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export function useMultiNode(currentReadingNodeId?: string, isCurrentReadingFresh?: boolean) {
  const [registeredNodes, setRegisteredNodes] = useState<NodeRecord[]>([]);
  const [nodeLinks, setNodeLinks] = useState<NodeLink[]>([]);
  const [meshPackets, setMeshPackets] = useState<MeshPacket[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string>(DEFAULT_NODE_ID);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  // Tick every 5 seconds to re-evaluate lastSeen
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load registered nodes, links, and packets
  const refreshNodes = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [nodesData, linksData, packetsData] = await Promise.all([
        getRegisteredNodes(),
        getNodeLinks(),
        getRecentMeshPackets(10),
      ]);
      setRegisteredNodes(nodesData);
      setNodeLinks(linksData);
      setMeshPackets(packetsData);
    } catch (err) {
      console.warn('[MULTI_NODE] Error loading mesh data:', err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isSupabaseConfigured) {
      Promise.all([
        getRegisteredNodes(),
        getNodeLinks(),
        getRecentMeshPackets(10),
      ]).then(([nodesData, linksData, packetsData]) => {
        if (!ignore) {
          setRegisteredNodes(nodesData);
          setNodeLinks(linksData);
          setMeshPackets(packetsData);
        }
      }).catch((err) => {
        console.warn('[MULTI_NODE] Initial load error:', err);
      });
    }
    return () => {
      ignore = true;
    };
  }, []);

  // Realtime subscription for nodes, links, and packets
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('multi_node_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nodes' },
        () => {
          refreshNodes();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'node_links' },
        () => {
          refreshNodes();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mesh_packets' },
        (payload) => {
          if (payload.new) {
            setMeshPackets((prev) => [payload.new as MeshPacket, ...prev.slice(0, 19)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshNodes]);

  // Compute telemetry-driven status for all expected nodes
  const allNodesWithStatus = useMemo(() => {
    const regMap = new Map<string, NodeRecord>();
    for (const node of registeredNodes) {
      regMap.set(node.node_id, node);
    }

    return DEFAULT_NODE_IDS.map((id) => {
      const record = regMap.get(id);
      let status: RegistryNodeStatus = 'NOT_DEPLOYED';

      if (record) {
        // If it's the current telemetry node and receiving fresh readings
        if (id === currentReadingNodeId && isCurrentReadingFresh) {
          status = 'ONLINE';
        } else if (record.last_seen) {
          const ageSec = (nowTimestamp - new Date(record.last_seen).getTime()) / 1000;
          if (ageSec < 60) {
            status = 'ONLINE';
          } else if (ageSec < 300) {
            status = 'DEGRADED';
          } else {
            status = 'OFFLINE';
          }
        } else {
          status = 'OFFLINE';
        }

        return {
          ...record,
          status,
        };
      }

      // Fallback placeholder record for un-deployed nodes
      return {
        node_id: id,
        node_name: `Sensor Node ${id.replace('NODE_', '')}`,
        status: 'NOT_DEPLOYED' as RegistryNodeStatus,
        latitude: null,
        longitude: null,
        altitude: null,
        gps_fix: 'NONE' as const,
        gps_satellites: 0,
        battery_level: 0,
        firmware_version: 'unconfigured',
        zone_id: 'ZONE_A',
        last_seen: null,
      };
    });
  }, [registeredNodes, currentReadingNodeId, isCurrentReadingFresh, nowTimestamp]);

  const activeNode = useMemo(() => {
    return allNodesWithStatus.find((n) => n.node_id === activeNodeId) || allNodesWithStatus[0];
  }, [allNodesWithStatus, activeNodeId]);

  return {
    registeredNodes,
    allNodesWithStatus,
    activeNodeId,
    setActiveNodeId,
    activeNode,
    nodeLinks,
    meshPackets,
    refreshNodes,
  };
}

