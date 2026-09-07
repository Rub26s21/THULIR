// ============================================================
// THULIR AI — A-POD Network Risk Aggregation Module
// ============================================================
// Calculates the reliability-weighted network risk R_network.
// Formula: R_network = Sum(Q_i * R_i) / Sum(Q_i)
//
// Invariant: If Sum(Q_i) == 0 (no valid contributing nodes),
// R_network is null and networkState is UNKNOWN. Never default to 0.

export interface NodeRiskContribution {
  nodeId: string;
  riskScore: number;       // R_i in [0, 1]
  reliability: number;     // Q_i in [0, 1]
}

export interface NetworkRiskResult {
  networkRisk: number | null;
  totalWeight: number;
  contributingNodesCount: number;
  contributingNodeIds: string[];
}

/**
 * Calculates reliability-weighted network risk across all nodes:
 * R_network = Sum(Q_i * R_i) / Sum(Q_i)
 *
 * Guarantees:
 * - If total reliability weight is 0, returns networkRisk = null.
 * - Nodes with Q_i == 0 do not contribute to numerator or denominator.
 */
export function calculateNetworkRisk(nodes: NodeRiskContribution[]): NetworkRiskResult {
  if (!nodes || nodes.length === 0) {
    return {
      networkRisk: null,
      totalWeight: 0,
      contributingNodesCount: 0,
      contributingNodeIds: [],
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  const contributingNodeIds: string[] = [];

  for (const node of nodes) {
    const q = Number.isFinite(node.reliability) && node.reliability > 0 ? node.reliability : 0;
    const r = Number.isFinite(node.riskScore) ? Math.min(Math.max(node.riskScore, 0), 1) : 0;

    if (q > 0) {
      weightedSum += q * r;
      totalWeight += q;
      contributingNodeIds.push(node.nodeId);
    }
  }

  if (totalWeight <= 0) {
    return {
      networkRisk: null,
      totalWeight: 0,
      contributingNodesCount: 0,
      contributingNodeIds: [],
    };
  }

  const rawNetworkRisk = weightedSum / totalWeight;
  const networkRisk = Math.min(Math.max(Number(rawNetworkRisk.toFixed(4)), 0.0), 1.0);

  return {
    networkRisk,
    totalWeight: Number(totalWeight.toFixed(4)),
    contributingNodesCount: contributingNodeIds.length,
    contributingNodeIds,
  };
}
