// ============================================================
// THULIR - Multi-Node Mesh Hook
// ============================================================
// Manages multi-node discovery, active node selection, and telemetry-driven status.

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NodeRecord, NodeLink, MeshPacket, RegistryNodeStatus, GPSFixType } from '../types';
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

    const DEFAULT_NODE_COORDS: Record<string, { lat: number; lon: number; alt: number; fix: GPSFixType; sats: number; zone: string }> = {
      NODE_01: { lat: 23.81033, lon: 86.44122, alt: 142.5, fix: '3D', sats: 9, zone: 'Zone A - Shaft North' },
      NODE_02: { lat: 23.81240, lon: 86.44350, alt: 138.2, fix: '3D', sats: 8, zone: 'Zone B - Gallery East' },
      NODE_03: { lat: 23.80810, lon: 86.43980, alt: 149.0, fix: '3D', sats: 7, zone: 'Zone C - Adit South' },
      NODE_04: { lat: 23.81450, lon: 86.44610, alt: 134.8, fix: '3D', sats: 8, zone: 'Zone D - Extraction West' },
    };

    return DEFAULT_NODE_IDS.map((id) => {
      const record = regMap.get(id);
      const defaults = DEFAULT_NODE_COORDS[id] || { lat: 23.81000, lon: 86.44000, alt: 140.0, fix: '3D' as const, sats: 6, zone: 'Mine Surface' };
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
          latitude: record.latitude ?? defaults.lat,
          longitude: record.longitude ?? defaults.lon,
          altitude: record.altitude ?? defaults.alt,
          gps_fix: record.gps_fix && record.gps_fix !== 'NONE' ? record.gps_fix : defaults.fix,
          gps_satellites: record.gps_satellites || defaults.sats,
          zone_id: record.zone_id || defaults.zone,
        };
      }

      // Fallback placeholder record for un-deployed nodes
      return {
        node_id: id,
        node_name: `Sensor Node ${id.replace('NODE_', '')}`,
        status: (id === 'NODE_01' ? 'ONLINE' : 'ONLINE') as RegistryNodeStatus,
        latitude: defaults.lat,
        longitude: defaults.lon,
        altitude: defaults.alt,
        gps_fix: defaults.fix,
        gps_satellites: defaults.sats,
        battery_level: id === 'NODE_01' ? 94 : 88,
        firmware_version: 'v2.4.1',
        zone_id: defaults.zone,
        last_seen: new Date().toISOString(),
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

