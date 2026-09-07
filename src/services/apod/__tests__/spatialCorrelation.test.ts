import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSpatialCorrelation } from '../spatialCorrelation.ts';

describe('A-POD: Spatial Correlation (S in [0, 1])', () => {
  const links = [
    { node_id: 'NODE_01', neighbor_id: 'NODE_02' },
    { node_id: 'NODE_02', neighbor_id: 'NODE_03' },
    { node_id: 'NODE_03', neighbor_id: 'NODE_04' },
    { node_id: 'NODE_05', neighbor_id: 'NODE_06' }, // Disjoint cluster
  ];

  it('Scenario 1: All nodes normal -> S = 0.0, eventScope = NODE', () => {
    const nodes = [
      { nodeId: 'NODE_01', riskScore: 0.1, isOnline: true },
      { nodeId: 'NODE_02', riskScore: 0.15, isOnline: true },
      { nodeId: 'NODE_03', riskScore: 0.05, isOnline: true },
    ];
    const res = calculateSpatialCorrelation(nodes, links);
    assert.strictEqual(res.spatialScore, 0.0);
    assert.strictEqual(res.eventScope, 'NODE');
    assert.strictEqual(res.eventType, 'ALL_NODES_NOMINAL');
  });

  it('Scenario 2: Single isolated abnormal node -> LOCALIZED anomaly (never area critical)', () => {
    const nodes = [
      { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true }, // High risk
      { nodeId: 'NODE_02', riskScore: 0.10, isOnline: true }, // Normal neighbor
      { nodeId: 'NODE_03', riskScore: 0.10, isOnline: true }, // Normal neighbor
    ];
    const res = calculateSpatialCorrelation(nodes, links);
    assert.strictEqual(res.eventScope, 'LOCALIZED');
    assert.strictEqual(res.eventType, 'ISOLATED_NODE_ANOMALY');
    assert.strictEqual(res.spatialScore, 0.15); // Isolated penalty
  });

  it('Scenario 3: 2 neighboring abnormal nodes -> CORRELATED_LOCAL_EVENT', () => {
    const nodes = [
      { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
      { nodeId: 'NODE_02', riskScore: 0.75, isOnline: true }, // Neighbor of 01!
      { nodeId: 'NODE_03', riskScore: 0.10, isOnline: true },
    ];
    const res = calculateSpatialCorrelation(nodes, links);
    assert.strictEqual(res.eventScope, 'LOCALIZED');
    assert.strictEqual(res.eventType, 'CORRELATED_LOCAL_EVENT');
    assert.strictEqual(res.isMultiNodeCorrelated, true);
    assert.strictEqual(res.spatialScore, 0.50);
  });

  it('Scenario 4: 3 neighboring abnormal nodes -> DEVELOPING_AREA_EVENT (Area-level escalation)', () => {
    const nodes = [
      { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
      { nodeId: 'NODE_02', riskScore: 0.80, isOnline: true },
      { nodeId: 'NODE_03', riskScore: 0.78, isOnline: true }, // Connected 01-02-03!
      { nodeId: 'NODE_04', riskScore: 0.20, isOnline: true },
    ];
    const res = calculateSpatialCorrelation(nodes, links);
    assert.strictEqual(res.eventScope, 'AREA');
    assert.strictEqual(res.eventType, 'DEVELOPING_AREA_EVENT');
    assert.strictEqual(res.isMultiNodeCorrelated, true);
    assert.ok(res.spatialScore >= 0.80);
  });

  it('Scenario 5: Multiple abnormal nodes that are NOT neighbors -> MULTIPLE_LOCALIZED_ANOMALIES', () => {
    const nodes = [
      { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
      { nodeId: 'NODE_02', riskScore: 0.10, isOnline: true },
      { nodeId: 'NODE_05', riskScore: 0.90, isOnline: true }, // Node 05 is NOT neighbor of 01!
    ];
    const res = calculateSpatialCorrelation(nodes, links);
    assert.strictEqual(res.eventScope, 'LOCALIZED');
    assert.strictEqual(res.eventType, 'MULTIPLE_LOCALIZED_ANOMALIES');
    assert.strictEqual(res.isMultiNodeCorrelated, false);
  });
});
