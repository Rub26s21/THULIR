import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runAPODEngine } from '../apodEngine.ts';
import type { NodeRiskState } from '../apodTypes.ts';

describe('A-POD: Master Evidence Fusion Engine (16 Specification Edge Cases)', () => {
  const links = [
    { node_id: 'NODE_01', neighbor_id: 'NODE_02' },
    { node_id: 'NODE_02', neighbor_id: 'NODE_03' },
    { node_id: 'NODE_03', neighbor_id: 'NODE_04' },
    { node_id: 'NODE_05', neighbor_id: 'NODE_06' },
  ];

  const createBaseNode = (id: string, riskScore: number, isOnline = true): NodeRiskState => ({
    nodeId: id,
    nodeState: isOnline ? 'REAL' : 'OFFLINE',
    timestamp: new Date().toISOString(),
    riskClass: riskScore >= 0.70 ? 'HIGH_RISK' : riskScore >= 0.35 ? 'MODERATE_RISK' : 'LOW_RISK',
    probabilities: {
      low: Math.max(1 - riskScore, 0),
      moderate: 0,
      high: riskScore,
    },
    riskScore,
    mlConfidence: 0.90,
    nodeHealth: 1.0,
    sensorHealth: 1.0,
    dataFreshness: isOnline ? 1.0 : 0.0,
    freshnessState: isOnline ? 'FRESH' : 'OFFLINE',
    isOnline,
    neighborNodeIds: links.filter((l) => l.node_id === id || l.neighbor_id === id).map((l) => (l.node_id === id ? l.neighbor_id : l.node_id)),
  });

  // CASE 1: No nodes -> UNKNOWN
  it('CASE 1: No nodes -> UNKNOWN', () => {
    const res = runAPODEngine({ nodes: [] });
    assert.strictEqual(res.networkState, 'UNKNOWN');
    assert.strictEqual(res.eventScope, 'UNKNOWN');
    assert.strictEqual(res.evidenceScore, null);
  });

  // CASE 2: All nodes offline -> UNKNOWN
  it('CASE 2: All nodes offline -> UNKNOWN (never SAFE)', () => {
    const nodes = [createBaseNode('NODE_01', 0.1, false), createBaseNode('NODE_02', 0.1, false)];
    const res = runAPODEngine({ nodes });
    assert.strictEqual(res.networkState, 'UNKNOWN');
    assert.strictEqual(res.eventScope, 'UNKNOWN');
    assert.strictEqual(res.evidenceScore, null);
  });

  // CASE 3: One healthy low-risk node -> NORMAL
  it('CASE 3: One healthy low-risk node -> NORMAL', () => {
    const nodes = [createBaseNode('NODE_01', 0.1, true)];
    const res = runAPODEngine({ nodes });
    assert.strictEqual(res.networkState, 'NORMAL');
    assert.strictEqual(res.eventScope, 'NODE');
  });

  // CASE 4 & 5: One high-risk node + safe neighbors -> LOCALIZED anomaly, NOT area critical
  it('CASE 4 & 5: One high-risk node + safe neighbors -> LOCALIZED anomaly (never area critical)', () => {
    const nodes = [
      createBaseNode('NODE_01', 0.85, true), // High risk
      createBaseNode('NODE_02', 0.10, true), // Safe neighbor
      createBaseNode('NODE_03', 0.10, true), // Safe neighbor
    ];
    const res = runAPODEngine({ nodes, links });
    assert.strictEqual(res.eventScope, 'LOCALIZED');
    assert.notStrictEqual(res.networkState, 'CRITICAL');
    assert.ok(res.explanation.includes('localized to NODE_01'));
  });

  // CASE 6: Two neighboring high-risk nodes -> CORRELATED LOCAL EVENT
  it('CASE 6: Two neighboring high-risk nodes -> CORRELATED LOCAL EVENT', () => {
    const nodes = [
      createBaseNode('NODE_01', 0.85, true),
      createBaseNode('NODE_02', 0.80, true), // Neighbor!
      createBaseNode('NODE_03', 0.10, true),
    ];
    const res = runAPODEngine({ nodes, links });
    assert.strictEqual(res.eventScope, 'LOCALIZED');
    assert.strictEqual(res.eventType, 'CORRELATED_LOCAL_EVENT');
    assert.ok(res.spatialCorrelation >= 0.50);
  });

  // CASE 7: Three neighboring high-risk nodes with persistence -> AREA-level escalation
  it('CASE 7: Three neighboring high-risk nodes with persistence -> AREA-level escalation', () => {
    const nodes = [
      createBaseNode('NODE_01', 0.85, true),
      createBaseNode('NODE_02', 0.80, true),
      createBaseNode('NODE_03', 0.82, true),
      createBaseNode('NODE_04', 0.10, true),
    ];
    const res = runAPODEngine({
      nodes,
      links,
      historicalNetworkRiskSeries: [0.70, 0.75, 0.78, 0.80, 0.82],
    });
    assert.strictEqual(res.eventScope, 'AREA');
    assert.strictEqual(res.eventType, 'DEVELOPING_AREA_EVENT');
    assert.ok(res.evidenceScore !== null && res.evidenceScore >= 0.70);
  });

  // CASE 8: Multiple non-neighboring high-risk nodes -> MULTIPLE_LOCALIZED_ANOMALIES
  it('CASE 8: Multiple non-neighboring high-risk nodes -> MULTIPLE_LOCALIZED_ANOMALIES', () => {
    const nodes = [
      createBaseNode('NODE_01', 0.85, true),
      createBaseNode('NODE_02', 0.10, true),
      createBaseNode('NODE_05', 0.88, true), // Node 05 is NOT neighbor of 01!
    ];
    const res = runAPODEngine({ nodes, links });
    assert.strictEqual(res.eventScope, 'LOCALIZED');
    assert.strictEqual(res.eventType, 'MULTIPLE_LOCALIZED_ANOMALIES');
  });

  // CASE 13: Critical physical threshold override but ML LOW -> CRITICAL Physical Condition
  it('CASE 13: Critical physical threshold violation but ML LOW -> CRITICAL status preserved', () => {
    const node = createBaseNode('NODE_01', 0.10, true);
    node.hasPhysicalCriticalViolation = true; // Physical safety rule breached

    const res = runAPODEngine({ nodes: [node] });
    assert.strictEqual(res.networkState, 'CRITICAL');
    assert.strictEqual(res.hasPhysicalCriticalOverride, true);
    assert.ok(res.explanation.includes('CRITICAL PHYSICAL ALERT'));
  });

  // CASE 15: Risk increasing across time -> RISING trend
  it('CASE 15: Risk increasing across time -> RISING trend + increased temporal score', () => {
    const nodes = [createBaseNode('NODE_01', 0.70, true)];
    const res = runAPODEngine({
      nodes,
      historicalNetworkRiskSeries: [0.20, 0.32, 0.45, 0.58, 0.68],
    });
    assert.strictEqual(res.riskTrend, 'RISING');
    assert.ok(res.temporalPersistence >= 0.70);
  });

  // CASE 16: Risk decreasing -> FALLING trend
  it('CASE 16: Risk decreasing -> FALLING trend', () => {
    const nodes = [createBaseNode('NODE_01', 0.30, true)];
    const res = runAPODEngine({
      nodes,
      historicalNetworkRiskSeries: [0.80, 0.72, 0.60, 0.45, 0.35],
    });
    assert.strictEqual(res.riskTrend, 'FALLING');
  });
});
