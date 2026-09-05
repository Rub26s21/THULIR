// ============================================================
// THULIR - Mesh Network & Multi-Node Service
// ============================================================

import { getSupabase } from '../lib/supabase';
import type { NodeRecord, NodeLink, MeshPacket } from '../types';

/**
 * Fetch all registered nodes in the network registry.
 */
export async function getRegisteredNodes(): Promise<NodeRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .order('node_id', { ascending: true });

    if (error) {
      console.warn('[MESH] Error fetching registered nodes:', error.message);
      return [];
    }

    return (data || []) as NodeRecord[];
  } catch (err) {
    console.warn('[MESH] Exception fetching registered nodes:', err);
    return [];
  }
}

/**
 * Fetch all active node-to-node wireless mesh links.
 */
export async function getNodeLinks(): Promise<NodeLink[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('node_links')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('[MESH] Error fetching node links:', error.message);
      return [];
    }

    return (data || []) as NodeLink[];
  } catch (err) {
    console.warn('[MESH] Exception fetching node links:', err);
    return [];
  }
}

/**
 * Fetch recent mesh packets / routing telemetry.
 */
export async function getRecentMeshPackets(limit: number = 20): Promise<MeshPacket[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('mesh_packets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[MESH] Error fetching mesh packets:', error.message);
      return [];
    }

    return (data || []) as MeshPacket[];
  } catch (err) {
    console.warn('[MESH] Exception fetching mesh packets:', err);
    return [];
  }
}
