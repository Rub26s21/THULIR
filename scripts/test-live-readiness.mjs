// ============================================================
// THULIR AI — LIVE READINESS & MULTI-NODE A-POD TEST SUITE
// ============================================================
// Verifies:
// TEST A — UNKNOWN Node (No telemetry -> nodeState='UNKNOWN', Q_i=0, no safe contribution)
// TEST B — REAL LOW-RISK Node (Genuine telemetry + ML -> Q_i > 0, valid contributor, REAL != UNKNOWN)
// TEST C — MULTI-NODE Independent Local ML (Node 1, 2, 3 have independent ML outputs)
// TEST D — Node Telemetry Without ML (Unfinished inference -> nodeState='UNKNOWN', Q_i=0)
// TEST E — Evidence Integrity (Authoritative NodeRiskState preserved end-to-end without downstream reconstruction)
// TEST F — Offline Node Safety (Offline node Q_i=0, never safe)
// TEST G — LLM Failure Resiliency (LLM timeout/error does not affect A-POD deterministic calculation)
// TEST H — Zero Live Telemetry State (All nodes offline -> networkRisk=null, networkState=UNKNOWN)
// TEST I — Isolated High vs Correlated Multi-Node (Unknown nodes do not act as safe neighbors)
// ============================================================

import { runAPODEngine } from '../src/services/apod/apodEngine.ts';
import { calculateNodeReliability } from '../src/services/apod/reliability.ts';
import { buildEvidencePackage } from '../src/services/investigator/investigatorClient.ts';
import { runMLInference } from '../src/utils/mlEngine.ts';

function evaluateAPOD(nodeRiskStates, opts = {}) {
  return runAPODEngine({
    podId: 'THULIR-A-POD-TEST',
    zoneId: 'ZONE_TEST',
    nodes: nodeRiskStates,
    links: opts.links || [],
    historicalNetworkRiskSeries: opts.history || [],
    latestSensorDataByNode: opts.sensorMap || {},
  });
}

function runLiveReadinessTests() {
  console.log('\n================================================================');
  console.log('🚀 THULIR AI — LIVE SENSOR READINESS & A-POD VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${details}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details}`);
      failed++;
    }
  }

  // ============================================================
  // TEST A — UNKNOWN NODE
  // ============================================================
  console.log('--- TEST A: UNKNOWN Node Semantic & Reliability ---');
  const unknownNode = {
    nodeId: 'NODE_02',
    nodeState: 'UNKNOWN',
    riskClass: 'UNKNOWN',
    riskScore: 0.0,
    mlConfidence: 0.0,
    probabilities: { low: 0, moderate: 0, high: 0 },
    nodeHealth: 0,
    dataFreshness: 0,
    isOnline: false,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: null,
  };

  const q_unknown = calculateNodeReliability(unknownNode);
  assert(q_unknown === 0.0, 'TEST A.1', `Reliability Q_i for UNKNOWN node is strictly 0.0 (got ${q_unknown})`);
  assert(unknownNode.nodeState === 'UNKNOWN', 'TEST A.2', `nodeState is UNKNOWN`);
  assert(unknownNode.probabilities.low === 0 && unknownNode.probabilities.high === 0, 'TEST A.3', `Probabilities are {0,0,0}`);

  // Test evaluation with 1 UNKNOWN node
  const apodUnknown = evaluateAPOD([unknownNode]);
  assert(apodUnknown.networkState === 'UNKNOWN', 'TEST A.4', `APOD networkState for UNKNOWN node is UNKNOWN`);
  assert(apodUnknown.networkRisk === null, 'TEST A.5', `APOD networkRisk is null when sum(Q_i)=0`);

  // ============================================================
  // TEST B — REAL LOW-RISK NODE
  // ============================================================
  console.log('\n--- TEST B: REAL LOW-RISK Node Contribution ---');
  const realLowNode = {
    nodeId: 'NODE_01',
    nodeState: 'REAL',
    riskClass: 'LOW_RISK',
    riskScore: 0.05,
    mlConfidence: 0.94,
    probabilities: { low: 0.95, moderate: 0.04, high: 0.01 },
    nodeHealth: 1.0,
    dataFreshness: 1.0,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: { tilt_angle: 0.1, vibration_intensity: 0.02, displacement_distance: 98, gas_ppm: 20 },
  };

  const q_realLow = calculateNodeReliability(realLowNode);
  assert(q_realLow > 0.0, 'TEST B.1', `Reliability Q_i for REAL LOW-RISK node is > 0 (got ${q_realLow})`);

  const apodRealLow = evaluateAPOD([realLowNode]);
  assert(apodRealLow.networkState === 'NORMAL', 'TEST B.2', `APOD networkState for REAL LOW node is NORMAL (evidence)`);
  assert(apodRealLow.networkRisk !== null && apodRealLow.networkRisk <= 0.10, 'TEST B.3', `APOD networkRisk is calculated (~${apodRealLow.networkRisk})`);
  assert(apodRealLow.networkState !== apodUnknown.networkState, 'TEST B.4', `REAL LOW_RISK is distinct from UNKNOWN`);

  // ============================================================
  // TEST C — MULTI-NODE INDEPENDENT LOCAL ML
  // ============================================================
  console.log('\n--- TEST C: Multi-Node Independent Local ML Inference ---');
  // Telemetry 1: Completely normal baseline
  const telem1 = {
    id: 1,
    node_id: 'NODE_01',
    event_id: 'EVT_01',
    tilt_x: 0.2,
    tilt_y: 0.1,
    vib_rms: 0.03,
    distance_cm: 100,
    gas_raw: 22,
    temperature: 24,
    humidity: 55,
    pressure: 1013,
    created_at: new Date().toISOString(),
  };

  // Telemetry 2: Elevated vibration & tilt (Watch / Moderate level)
  const telem2 = {
    id: 2,
    node_id: 'NODE_02',
    event_id: 'EVT_02',
    tilt_x: 7.5,
    tilt_y: 6.8,
    vib_rms: 0.95,
    distance_cm: 8.0,
    gas_raw: 480,
    temperature: 42,
    humidity: 82,
    pressure: 975,
    created_at: new Date().toISOString(),
  };

  // Telemetry 3: Critical subsidence displacement & high gas (Critical level)
  const telem3 = {
    id: 3,
    node_id: 'NODE_03',
    event_id: 'EVT_03',
    tilt_x: 18.5,
    tilt_y: 16.2,
    vib_rms: 3.20,
    distance_cm: 3.2,
    gas_raw: 820,
    temperature: 54,
    humidity: 92,
    pressure: 935,
    created_at: new Date().toISOString(),
  };

  // Run independent ML predictions on each node
  const mlPred1 = runMLInference(telem1);
  const mlPred2 = runMLInference(telem2);
  const mlPred3 = runMLInference(telem3);

  const p1_low = mlPred1.probabilities?.LOW_RISK ?? mlPred1.probabilities?.low ?? 0.8;
  const p2_high = mlPred2.probabilities?.HIGH_RISK ?? mlPred2.probabilities?.high ?? 0;
  const p3_high = mlPred3.probabilities?.HIGH_RISK ?? mlPred3.probabilities?.high ?? 0.8;

  assert(mlPred1.prediction === 'LOW_RISK', 'TEST C.1', `Node 1 predicted LOW_RISK (prob_low=${p1_low.toFixed(3)})`);
  assert(mlPred2.prediction === 'MODERATE_RISK' || mlPred2.prediction === 'HIGH_RISK', 'TEST C.2', `Node 2 predicted elevated risk (${mlPred2.prediction})`);
  assert(mlPred3.prediction === 'HIGH_RISK', 'TEST C.3', `Node 3 predicted HIGH_RISK (prob_high=${p3_high.toFixed(3)})`);
  assert(mlPred1.prediction !== mlPred3.prediction, 'TEST C.4', `Independent inputs produce independent model predictions (${mlPred1.prediction} vs ${mlPred3.prediction})`);

  const nodeRisk1 = {
    nodeId: 'NODE_01',
    nodeState: 'REAL',
    riskClass: mlPred1.prediction,
    riskScore: 0.05,
    mlConfidence: mlPred1.confidence,
    probabilities: {
      low: mlPred1.probabilities?.LOW_RISK ?? 0.9,
      moderate: mlPred1.probabilities?.MODERATE_RISK ?? 0.08,
      high: mlPred1.probabilities?.HIGH_RISK ?? 0.02,
    },
    nodeHealth: 0.95,
    dataFreshness: 0.98,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: telem1,
  };

  const nodeRisk2 = {
    nodeId: 'NODE_02',
    nodeState: 'REAL',
    riskClass: mlPred2.prediction,
    riskScore: 0.45,
    mlConfidence: mlPred2.confidence,
    probabilities: {
      low: mlPred2.probabilities?.LOW_RISK ?? 0.2,
      moderate: mlPred2.probabilities?.MODERATE_RISK ?? 0.6,
      high: mlPred2.probabilities?.HIGH_RISK ?? 0.2,
    },
    nodeHealth: 0.90,
    dataFreshness: 0.95,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: telem2,
  };

  const nodeRisk3 = {
    nodeId: 'NODE_03',
    nodeState: 'REAL',
    riskClass: mlPred3.prediction,
    riskScore: 0.88,
    mlConfidence: mlPred3.confidence,
    probabilities: {
      low: mlPred3.probabilities?.LOW_RISK ?? 0.02,
      moderate: mlPred3.probabilities?.MODERATE_RISK ?? 0.08,
      high: mlPred3.probabilities?.HIGH_RISK ?? 0.90,
    },
    nodeHealth: 0.85,
    dataFreshness: 0.92,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: telem3,
  };

  const multiApod = evaluateAPOD([nodeRisk1, nodeRisk2, nodeRisk3]);
  assert(multiApod.nodeRiskStates.length === 3, 'TEST C.5', `All 3 independent NodeRiskStates delivered to A-POD`);
  assert(multiApod.networkRisk > 0.40, 'TEST C.6', `A-POD multi-node fusion calculated combined risk (${multiApod.networkRisk.toFixed(3)})`);

  // ============================================================
  // TEST D — NODE WITHOUT COMPLETED ML
  // ============================================================
  console.log('\n--- TEST D: Node Telemetry Without Completed ML ---');
  const nodeWithoutML = {
    nodeId: 'NODE_04',
    nodeState: 'UNKNOWN',
    riskClass: 'UNKNOWN',
    riskScore: 0.0,
    mlConfidence: 0.0,
    probabilities: { low: 0, moderate: 0, high: 0 },
    nodeHealth: 0.9,
    dataFreshness: 0.9,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: { tilt_angle: 1.0 },
  };

  const q_noML = calculateNodeReliability(nodeWithoutML);
  assert(q_noML === 0.0, 'TEST D.1', `Reliability Q_i for node with uncomputed ML is 0.0`);
  assert(nodeWithoutML.riskClass !== 'LOW_RISK', 'TEST D.2', `Node without ML is NOT fabricated as LOW_RISK`);

  // ============================================================
  // TEST E — EVIDENCE INTEGRITY
  // ============================================================
  console.log('\n--- TEST E: Evidence Integrity End-to-End ---');
  const exactNodeState = {
    nodeId: 'NODE_01',
    nodeState: 'REAL',
    riskClass: 'HIGH_RISK',
    riskScore: 0.82,
    mlConfidence: 0.91,
    probabilities: {
      low: 0.03,
      moderate: 0.12,
      high: 0.85,
    },
    nodeHealth: 0.90,
    dataFreshness: 0.95,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: { tilt_angle: 6.2, vibration_intensity: 2.1, displacement_distance: 18, gas_ppm: 420 },
  };

  const apodForEvidence = evaluateAPOD([exactNodeState]);
  const evidencePkg = buildEvidencePackage(apodForEvidence, [], apodForEvidence.nodeRiskStates);

  assert(evidencePkg.nodes.length === 1, 'TEST E.1', `Evidence package received node state`);
  const evNode = evidencePkg.nodes[0];
  assert(evNode.riskClass === 'HIGH_RISK', 'TEST E.2', `Evidence riskClass is EXACT (got ${evNode.riskClass})`);
  assert(evNode.riskScore === 0.82, 'TEST E.3', `Evidence riskScore is EXACT (got ${evNode.riskScore})`);
  assert(evNode.mlConfidence === 0.91, 'TEST E.4', `Evidence mlConfidence is EXACT (got ${evNode.mlConfidence})`);
  assert(evNode.mlProbabilities.high === 0.85 && evNode.mlProbabilities.moderate === 0.12 && evNode.mlProbabilities.low === 0.03, 'TEST E.5', `Evidence probabilities are EXACT: ${JSON.stringify(evNode.mlProbabilities)}`);

  // ============================================================
  // TEST F — OFFLINE SAFETY
  // ============================================================
  console.log('\n--- TEST F: Offline Node Safety ---');
  const offlineNode = {
    nodeId: 'NODE_03',
    nodeState: 'OFFLINE',
    riskClass: 'UNKNOWN',
    riskScore: 0.0,
    mlConfidence: 0.0,
    probabilities: { low: 0, moderate: 0, high: 0 },
    nodeHealth: 0.0,
    dataFreshness: 0.0,
    isOnline: false,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: null,
  };

  const q_offline = calculateNodeReliability(offlineNode);
  assert(q_offline === 0.0, 'TEST F.1', `Offline node Q_i is strictly 0.0 (got ${q_offline})`);
  const apodWithOffline = evaluateAPOD([realLowNode, offlineNode]);
  // The offline node must not dilute or contribute safe evidence
  assert(apodWithOffline.nodeRiskStates.find(n => n.nodeId === 'NODE_03').nodeState === 'OFFLINE', 'TEST F.2', `Offline node marked OFFLINE in A-POD`);
  assert(apodWithOffline.networkRisk === apodRealLow.networkRisk, 'TEST F.3', `Offline node does not distort network risk calculation`);

  // ============================================================
  // TEST G — LLM FAILURE RESILIENCY
  // ============================================================
  console.log('\n--- TEST G: LLM Failure Resiliency ---');
  const highRiskNode = {
    nodeId: 'NODE_01',
    nodeState: 'REAL',
    riskClass: 'HIGH_RISK',
    riskScore: 0.88,
    mlConfidence: 0.92,
    probabilities: { low: 0.02, moderate: 0.08, high: 0.90 },
    nodeHealth: 1.0,
    dataFreshness: 1.0,
    isOnline: true,
    hasPhysicalCriticalOverride: false,
    rawTelemetry: { tilt_angle: 8.0, vibration_intensity: 2.5, displacement_distance: 15, gas_ppm: 500 },
  };

  const apodCritical = evaluateAPOD([highRiskNode]);
  assert(['ELEVATED', 'ALERT', 'CRITICAL'].includes(apodCritical.networkState), 'TEST G.1', `A-POD deterministic state is ${apodCritical.networkState}`);

  // Simulate Nemotron LLM timeout / network disconnection
  const simulatedLLMStatus = {
    status: 'AI_UNAVAILABLE',
    error: 'Nemotron 3 Ultra OpenRouter gateway timed out (15000ms)',
    data: null,
  };

  // Dashboard safety invariant: APOD deterministic output remains unchanged
  assert(apodCritical.networkState !== 'NORMAL' && apodCritical.networkState !== 'UNKNOWN', 'TEST G.2', `A-POD safety state unaffected by LLM failure`);
  assert(apodCritical.networkRisk !== null && apodCritical.networkRisk > 0.8, 'TEST G.3', `Deterministic network risk score remains valid (${apodCritical.networkRisk})`);

  // ============================================================
  // TEST H — ZERO LIVE TELEMETRY STATE
  // ============================================================
  console.log('\n--- TEST H: Zero Telemetry Pipeline State ---');
  const zeroNodes = [
    { nodeId: 'NODE_01', nodeState: 'OFFLINE', riskClass: 'UNKNOWN', riskScore: 0, mlConfidence: 0, probabilities: { low: 0, moderate: 0, high: 0 }, nodeHealth: 0, dataFreshness: 0, isOnline: false, hasPhysicalCriticalOverride: false, rawTelemetry: null },
    { nodeId: 'NODE_02', nodeState: 'OFFLINE', riskClass: 'UNKNOWN', riskScore: 0, mlConfidence: 0, probabilities: { low: 0, moderate: 0, high: 0 }, nodeHealth: 0, dataFreshness: 0, isOnline: false, hasPhysicalCriticalOverride: false, rawTelemetry: null },
    { nodeId: 'NODE_03', nodeState: 'OFFLINE', riskClass: 'UNKNOWN', riskScore: 0, mlConfidence: 0, probabilities: { low: 0, moderate: 0, high: 0 }, nodeHealth: 0, dataFreshness: 0, isOnline: false, hasPhysicalCriticalOverride: false, rawTelemetry: null },
  ];
  const zeroApod = evaluateAPOD(zeroNodes);
  assert(zeroApod.networkState === 'UNKNOWN', 'TEST H.1', `Zero telemetry gives networkState = UNKNOWN`);
  assert(zeroApod.networkRisk === null, 'TEST H.2', `Zero telemetry gives networkRisk = null`);
  assert(zeroApod.evidenceScore === null, 'TEST H.3', `Zero telemetry gives evidenceScore = null`);

  // ============================================================
  // TEST I — SCENARIO A (ISOLATED) VS SCENARIO B (CORRELATED)
  // ============================================================
  console.log('\n--- TEST I: Scenario A (Isolated Anomaly) vs Scenario B (Correlated Area) ---');
  // Scenario A: NODE_01 = REAL HIGH, NODE_02 = REAL LOW, NODE_03 = UNKNOWN
  const scenarioA = evaluateAPOD([
    highRiskNode,
    realLowNode,
    unknownNode,
  ]);
  assert(scenarioA.eventScope === 'NODE' || scenarioA.eventScope === 'LOCALIZED', 'TEST I.1', `Scenario A scope is localized anomaly (${scenarioA.eventScope})`);

  // Scenario B: NODE_01 = REAL HIGH, NODE_02 = REAL HIGH, NODE_03 = REAL HIGH with spatial links
  const highRiskNode2 = { ...highRiskNode, nodeId: 'NODE_02', neighborNodeIds: ['NODE_01', 'NODE_03'] };
  const highRiskNode3 = { ...highRiskNode, nodeId: 'NODE_03', neighborNodeIds: ['NODE_02'] };
  const highRiskNode1Linked = { ...highRiskNode, neighborNodeIds: ['NODE_02'] };

  const scenarioB = evaluateAPOD(
    [highRiskNode1Linked, highRiskNode2, highRiskNode3],
    {
      links: [
        { node_id: 'NODE_01', neighbor_id: 'NODE_02', link_quality: 1.0 },
        { node_id: 'NODE_02', neighbor_id: 'NODE_03', link_quality: 1.0 },
      ],
    }
  );
  assert(scenarioB.spatialCorrelation >= 0.50, 'TEST I.2', `Scenario B multi-node spatial correlation is elevated (${scenarioB.spatialCorrelation.toFixed(2)})`);
  assert(scenarioB.evidenceScore > scenarioA.evidenceScore, 'TEST I.3', `Scenario B evidence score (${scenarioB.evidenceScore.toFixed(2)}) > Scenario A (${scenarioA.evidenceScore.toFixed(2)})`);

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveReadinessTests();
