import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateNetworkRisk } from '../networkRisk.ts';

describe('A-POD: Network Risk Aggregation (R_network = Sum(Q_i * R_i) / Sum(Q_i))', () => {
  it('calculates equal weight average: Node A (R=0.8, Q=1.0), Node B (R=0.2, Q=1.0) -> R_network=0.50', () => {
    const result = calculateNetworkRisk([
      { nodeId: 'NODE_01', riskScore: 0.8, reliability: 1.0 },
      { nodeId: 'NODE_02', riskScore: 0.2, reliability: 1.0 },
    ]);
    assert.strictEqual(result.networkRisk, 0.5);
    assert.strictEqual(result.contributingNodesCount, 2);
  });

  it('weights higher reliability nodes more: Node A (R=0.9, Q=1.0), Node B (R=0.1, Q=0.25) -> R_network=(0.9 + 0.025)/1.25 = 0.74', () => {
    const result = calculateNetworkRisk([
      { nodeId: 'NODE_01', riskScore: 0.9, reliability: 1.0 },
      { nodeId: 'NODE_02', riskScore: 0.1, reliability: 0.25 },
    ]);
    assert.strictEqual(result.networkRisk, 0.74);
  });

  it('STRICT INVARIANT: nodes with Q_i = 0 do not contribute and zero total weight yields null', () => {
    const result = calculateNetworkRisk([
      { nodeId: 'NODE_01', riskScore: 0.8, reliability: 0.0 }, // Offline node
      { nodeId: 'NODE_02', riskScore: 0.9, reliability: 0.0 }, // Offline node
    ]);
    assert.strictEqual(result.networkRisk, null);
    assert.strictEqual(result.contributingNodesCount, 0);
  });

  it('handles empty node list by returning null', () => {
    const result = calculateNetworkRisk([]);
    assert.strictEqual(result.networkRisk, null);
  });
});
