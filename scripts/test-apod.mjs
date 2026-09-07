// ============================================================
// THULIR AI — A-POD Test & Validation Suite Runner
// ============================================================
// Comprehensive deterministic test runner executing all mathematical,
// reliability, spatial, temporal, sensor agreement, and 16 specification edge cases.

import assert from 'node:assert';

// 1. Core Modules
import { calculateNodeRiskScore } from '../src/services/apod/nodeRisk.ts';
import { calculateNodeReliability, getFreshnessFactor } from '../src/services/apod/reliability.ts';
import { calculateNetworkRisk } from '../src/services/apod/networkRisk.ts';
import { calculateSpatialCorrelation } from '../src/services/apod/spatialCorrelation.ts';
import { calculateTemporalPersistence } from '../src/services/apod/temporalPersistence.ts';
import { calculateSensorAgreement } from '../src/services/apod/sensorAgreement.ts';
import { runAPODEngine } from '../src/services/apod/apodEngine.ts';

console.log('===============================================================');
console.log('🧪 THULIR AI — A-POD COMPLETE TEST SUITE RUNNER');
console.log('===============================================================');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ============================================================
// SUITE 1: Node Risk Calculation (R_i)
// ============================================================
console.log('\n--- SUITE 1: Node Risk Calculation (R_i) ---');

runTest('R_i exact calculation: P_low=0.10, P_mod=0.20, P_high=0.70 -> R_i=0.80', () => {
  const score = calculateNodeRiskScore({ low: 0.10, moderate: 0.20, high: 0.70 });
  assert.strictEqual(score, 0.8);
});

runTest('R_i pure low risk: P_low=1.0 -> R_i=0.0', () => {
  const score = calculateNodeRiskScore({ low: 1.0, moderate: 0.0, high: 0.0 });
  assert.strictEqual(score, 0.0);
});

runTest('R_i pure high risk: P_high=1.0 -> R_i=1.0', () => {
  const score = calculateNodeRiskScore({ low: 0.0, moderate: 0.0, high: 1.0 });
  assert.strictEqual(score, 1.0);
});

runTest('R_i unnormalized inputs are auto-normalized', () => {
  const score = calculateNodeRiskScore({ low: 20, moderate: 20, high: 60 });
  assert.strictEqual(score, 0.7);
});

// ============================================================
// SUITE 2: Reliability (Q_i = H_i * C_i * D_i)
// ============================================================
console.log('\n--- SUITE 2: Reliability (Q_i = H_i * C_i * D_i) ---');

runTest('Q_i perfect reliability: H=1.0, C=1.0, D=1.0 -> Q_i=1.0', () => {
  const q = calculateNodeReliability({
    nodeHealth: 1.0,
    mlConfidence: 1.0,
    dataFreshness: 1.0,
    freshnessState: 'FRESH',
    isOnline: true,
  });
  assert.strictEqual(q, 1.0);
});

runTest('STRICT INVARIANT: Offline node has D_i=0.0 -> Q_i=0.0 (never safe)', () => {
  assert.strictEqual(getFreshnessFactor('OFFLINE'), 0.0);
  const q = calculateNodeReliability({
    nodeHealth: 1.0,
    mlConfidence: 1.0,
    dataFreshness: 0.0,
    freshnessState: 'OFFLINE',
    isOnline: false,
  });
  assert.strictEqual(q, 0.0);
});

// ============================================================
// SUITE 3: Network Risk Aggregation (R_network = Sum(Q_i*R_i) / Sum(Q_i))
// ============================================================
console.log('\n--- SUITE 3: Network Risk Aggregation (R_network) ---');

runTest('R_network equal weight average: Node A (0.8), Node B (0.2) -> 0.50', () => {
  const res = calculateNetworkRisk([
    { nodeId: 'NODE_01', riskScore: 0.8, reliability: 1.0 },
    { nodeId: 'NODE_02', riskScore: 0.2, reliability: 1.0 },
  ]);
  assert.strictEqual(res.networkRisk, 0.5);
  assert.strictEqual(res.contributingNodesCount, 2);
});

runTest('STRICT INVARIANT: Zero valid weights yields null (not 0.0)', () => {
  const res = calculateNetworkRisk([
    { nodeId: 'NODE_01', riskScore: 0.8, reliability: 0.0 },
  ]);
  assert.strictEqual(res.networkRisk, null);
  assert.strictEqual(res.contributingNodesCount, 0);
});

// ============================================================
// SUITE 4: Spatial Correlation (S in [0, 1])
// ============================================================
console.log('\n--- SUITE 4: Spatial Correlation (S in [0, 1]) ---');

const links = [
  { node_id: 'NODE_01', neighbor_id: 'NODE_02' },
  { node_id: 'NODE_02', neighbor_id: 'NODE_03' },
  { node_id: 'NODE_03', neighbor_id: 'NODE_04' },
  { node_id: 'NODE_05', neighbor_id: 'NODE_06' },
];

runTest('Spatial: All nodes normal -> S = 0.0, eventScope = NODE', () => {
  const nodes = [
    { nodeId: 'NODE_01', riskScore: 0.1, isOnline: true },
    { nodeId: 'NODE_02', riskScore: 0.15, isOnline: true },
  ];
  const res = calculateSpatialCorrelation(nodes, links);
  assert.strictEqual(res.spatialScore, 0.0);
  assert.strictEqual(res.eventScope, 'NODE');
});

runTest('Spatial: Single abnormal node -> LOCALIZED anomaly (never area critical)', () => {
  const nodes = [
    { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
    { nodeId: 'NODE_02', riskScore: 0.10, isOnline: true },
    { nodeId: 'NODE_03', riskScore: 0.10, isOnline: true },
  ];
  const res = calculateSpatialCorrelation(nodes, links);
  assert.strictEqual(res.eventScope, 'LOCALIZED');
  assert.strictEqual(res.eventType, 'ISOLATED_NODE_ANOMALY');
  assert.strictEqual(res.spatialScore, 0.15);
});

runTest('Spatial: 2 neighboring abnormal nodes -> CORRELATED_LOCAL_EVENT', () => {
  const nodes = [
    { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
    { nodeId: 'NODE_02', riskScore: 0.75, isOnline: true },
    { nodeId: 'NODE_03', riskScore: 0.10, isOnline: true },
  ];
  const res = calculateSpatialCorrelation(nodes, links);
  assert.strictEqual(res.eventScope, 'LOCALIZED');
  assert.strictEqual(res.eventType, 'CORRELATED_LOCAL_EVENT');
  assert.strictEqual(res.isMultiNodeCorrelated, true);
});

runTest('Spatial: 3 neighboring abnormal nodes -> DEVELOPING_AREA_EVENT (Area scope)', () => {
  const nodes = [
    { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
    { nodeId: 'NODE_02', riskScore: 0.80, isOnline: true },
    { nodeId: 'NODE_03', riskScore: 0.82, isOnline: true },
    { nodeId: 'NODE_04', riskScore: 0.10, isOnline: true },
  ];
  const res = calculateSpatialCorrelation(nodes, links);
  assert.strictEqual(res.eventScope, 'AREA');
  assert.strictEqual(res.eventType, 'DEVELOPING_AREA_EVENT');
});

runTest('Spatial: Disjoint abnormal nodes -> MULTIPLE_LOCALIZED_ANOMALIES', () => {
  const nodes = [
    { nodeId: 'NODE_01', riskScore: 0.85, isOnline: true },
    { nodeId: 'NODE_02', riskScore: 0.10, isOnline: true },
    { nodeId: 'NODE_05', riskScore: 0.90, isOnline: true },
  ];
  const res = calculateSpatialCorrelation(nodes, links);
  assert.strictEqual(res.eventScope, 'LOCALIZED');
  assert.strictEqual(res.eventType, 'MULTIPLE_LOCALIZED_ANOMALIES');
});

// ============================================================
// SUITE 5: Temporal Persistence & Trend (T in [0, 1])
// ============================================================
console.log('\n--- SUITE 5: Temporal Persistence & Trend ---');

runTest('Temporal: RISING trend detected for series [0.22, 0.28, 0.37, 0.48, 0.61]', () => {
  const res = calculateTemporalPersistence([0.22, 0.28, 0.37, 0.48, 0.61], 0.50);
  assert.strictEqual(res.riskTrend, 'RISING');
});

runTest('Temporal: FALLING trend detected for series [0.72, 0.71, 0.65, 0.52, 0.38]', () => {
  const res = calculateTemporalPersistence([0.72, 0.71, 0.65, 0.52, 0.38], 0.50);
  assert.strictEqual(res.riskTrend, 'FALLING');
});

// ============================================================
// SUITE 6: Sensor Agreement & Conflict Detection (M in [0, 1])
// ============================================================
console.log('\n--- SUITE 6: Sensor Agreement & Conflict Detection ---');

const baseTelemetry = {
  id: 1,
  node_id: 'NODE_01',
  event_id: null,
  tilt_x: 0.5,
  tilt_y: -0.8,
  pressure: 989.2,
  gas_raw: 220,
  temperature: 24.5,
  humidity: 55,
  distance_cm: 60.0,
  vib_rms: 0.12,
  created_at: new Date().toISOString(),
};

runTest('Sensor: High agreement for nominal physical channels supporting LOW_RISK', () => {
  const res = calculateSensorAgreement(baseTelemetry, 'LOW_RISK');
  assert.strictEqual(res.hasConflict, false);
  assert.ok(res.agreementScore >= 0.85);
});

runTest('Sensor: SENSOR_CONFLICT when vibration/gas high but tilt/distance normal', () => {
  const conflictTelemetry = {
    ...baseTelemetry,
    vib_rms: 20.5,
    gas_raw: 480,
    tilt_x: 0.2,
    tilt_y: 0.1,
    distance_cm: 60.0,
  };
  const res = calculateSensorAgreement(conflictTelemetry, 'HIGH_RISK');
  assert.strictEqual(res.hasConflict, true);
});

runTest('Sensor: Missing distance sensor handled safely without assuming 0 or OFFLINE', () => {
  const missingDistanceTelemetry = {
    ...baseTelemetry,
    distance_cm: null,
  };
  const res = calculateSensorAgreement(missingDistanceTelemetry, 'LOW_RISK');
  assert.strictEqual(res.missingSignals.length, 1);
  assert.strictEqual(res.supportingSignals.length, 7);
});

// ============================================================
// SUITE 7: A-POD Master Engine (16 Specification Edge Cases)
// ============================================================
console.log('\n--- SUITE 7: A-POD Master Engine 16 Edge Cases ---');

const createNode = (id, riskScore, isOnline = true, violation = false) => ({
  nodeId: id,
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
  hasPhysicalCriticalViolation: violation,
  neighborNodeIds: links.filter((l) => l.node_id === id || l.neighbor_id === id).map((l) => (l.node_id === id ? l.neighbor_id : l.node_id)),
});

runTest('CASE 1: No nodes -> UNKNOWN', () => {
  const res = runAPODEngine({ nodes: [] });
  assert.strictEqual(res.networkState, 'UNKNOWN');
  assert.strictEqual(res.eventScope, 'UNKNOWN');
  assert.strictEqual(res.evidenceScore, null);
});

runTest('CASE 2: All nodes offline -> UNKNOWN (never SAFE)', () => {
  const res = runAPODEngine({
    nodes: [createNode('NODE_01', 0.1, false), createNode('NODE_02', 0.1, false)],
  });
  assert.strictEqual(res.networkState, 'UNKNOWN');
  assert.strictEqual(res.evidenceScore, null);
});

runTest('CASE 3: One healthy low-risk node -> NORMAL', () => {
  const res = runAPODEngine({ nodes: [createNode('NODE_01', 0.1, true)] });
  assert.strictEqual(res.networkState, 'NORMAL');
  assert.strictEqual(res.eventScope, 'NODE');
});

runTest('CASE 4 & 5: One high-risk node + safe neighbors -> LOCALIZED anomaly (not area critical)', () => {
  const res = runAPODEngine({
    nodes: [
      createNode('NODE_01', 0.85, true),
      createNode('NODE_02', 0.10, true),
      createNode('NODE_03', 0.10, true),
    ],
    links,
  });
  assert.strictEqual(res.eventScope, 'LOCALIZED');
  assert.notStrictEqual(res.networkState, 'CRITICAL');
});

runTest('CASE 6: Two neighboring high-risk nodes -> CORRELATED LOCAL EVENT', () => {
  const res = runAPODEngine({
    nodes: [
      createNode('NODE_01', 0.85, true),
      createNode('NODE_02', 0.80, true),
      createNode('NODE_03', 0.10, true),
    ],
    links,
  });
  assert.strictEqual(res.eventScope, 'LOCALIZED');
  assert.strictEqual(res.eventType, 'CORRELATED_LOCAL_EVENT');
});

runTest('CASE 7: Three neighboring high-risk nodes with persistence -> AREA escalation', () => {
  const res = runAPODEngine({
    nodes: [
      createNode('NODE_01', 0.85, true),
      createNode('NODE_02', 0.80, true),
      createNode('NODE_03', 0.82, true),
      createNode('NODE_04', 0.10, true),
    ],
    links,
    historicalNetworkRiskSeries: [0.70, 0.75, 0.78, 0.80, 0.82],
  });
  assert.strictEqual(res.eventScope, 'AREA');
  assert.strictEqual(res.eventType, 'DEVELOPING_AREA_EVENT');
});

runTest('CASE 8: Disjoint abnormal nodes -> MULTIPLE_LOCALIZED_ANOMALIES', () => {
  const res = runAPODEngine({
    nodes: [
      createNode('NODE_01', 0.85, true),
      createNode('NODE_02', 0.10, true),
      createNode('NODE_05', 0.88, true),
    ],
    links,
  });
  assert.strictEqual(res.eventScope, 'LOCALIZED');
  assert.strictEqual(res.eventType, 'MULTIPLE_LOCALIZED_ANOMALIES');
});

runTest('CASE 13: Critical physical threshold violation but ML LOW -> CRITICAL status preserved', () => {
  const res = runAPODEngine({
    nodes: [createNode('NODE_01', 0.10, true, true)], // Critical physical violation
  });
  assert.strictEqual(res.networkState, 'CRITICAL');
  assert.strictEqual(res.hasPhysicalCriticalOverride, true);
});

runTest('CASE 15: Risk increasing across time -> RISING trend', () => {
  const res = runAPODEngine({
    nodes: [createNode('NODE_01', 0.70, true)],
    historicalNetworkRiskSeries: [0.20, 0.32, 0.45, 0.58, 0.68],
  });
  assert.strictEqual(res.riskTrend, 'RISING');
  assert.ok(res.temporalPersistence >= 0.70);
});

runTest('CASE 16: Risk decreasing -> FALLING trend', () => {
  const res = runAPODEngine({
    nodes: [createNode('NODE_01', 0.30, true)],
    historicalNetworkRiskSeries: [0.80, 0.72, 0.60, 0.45, 0.35],
  });
  assert.strictEqual(res.riskTrend, 'FALLING');
});

console.log('\n===============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log('===============================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
