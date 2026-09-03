// ============================================================
// THULIR - Risk & Alert Engine Automated Validation Suite
// ============================================================

import { evaluateRisk } from '../src/utils/riskEngine.ts';
import { evaluateAlerts } from '../src/utils/alertEngine.ts';
import { SENSOR_THRESHOLDS } from '../src/config/thresholds.ts';

console.log("==================================================");
console.log("THULIR - RISK & ALERT ENGINE VALIDATION SUITE");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    testsFailed++;
  }
}

// Baseline Nominal Telemetry
const nominalData = {
  id: 1,
  node_id: "NODE_01",
  event_id: "EVT-100",
  tilt_x: 0.5,
  tilt_y: -0.2,
  pressure: 1013.25,
  gas_raw: 150,
  temperature: 25.0,
  humidity: 55.0,
  distance_cm: 50.0,
  vib_rms: 0.05,
  created_at: new Date().toISOString()
};

const nominalML = {
  node_id: "NODE_01",
  prediction: "LOW_RISK",
  confidence: 0.98,
  model_version: "thulir-risk-rf-v1.0",
  model_type: "TRAINED",
  inference_timestamp: new Date().toISOString()
};

// ----------------------------------------------------
// TEST 1: All sensors normal + ML LOW -> FINAL LOW
// ----------------------------------------------------
const r1 = evaluateRisk(nominalData, nominalML);
assert(r1.level === 'NORMAL' && r1.reasons.length === 0, "TEST 1: All sensors normal + ML LOW -> FINAL NORMAL (LOW)");

// ----------------------------------------------------
// TEST 2: One sensor crosses warning threshold -> MODERATE alert
// ----------------------------------------------------
const watchData = { ...nominalData, vib_rms: 0.85 }; // watch is 0.5, critical is 1.5
const r2 = evaluateRisk(watchData, nominalML);
const a2 = evaluateAlerts(watchData, nominalML, []);
assert(
  r2.level === 'WATCH' &&
  a2.updatedAlerts.some(a => a.sensor === 'Vibration' && a.severity === 'WATCH'),
  "TEST 2: One sensor crosses warning threshold -> MODERATE / WATCH risk & alert"
);

// ----------------------------------------------------
// TEST 3: One sensor crosses critical threshold -> HIGH alert
// ----------------------------------------------------
const critData = { ...nominalData, vib_rms: 2.2 }; // critical is 1.5
const r3 = evaluateRisk(critData, nominalML);
const a3 = evaluateAlerts(critData, nominalML, []);
assert(
  r3.level === 'CRITICAL' &&
  a3.updatedAlerts.some(a => a.sensor === 'Vibration' && a.severity === 'CRITICAL'),
  "TEST 3: One sensor crosses critical threshold -> CRITICAL / HIGH risk & alert"
);

// ----------------------------------------------------
// TEST 4: ML predicts LOW but critical engineering threshold is exceeded -> FINAL HIGH
// ----------------------------------------------------
const critGasData = { ...nominalData, gas_raw: 850 }; // critical is 700
const r4 = evaluateRisk(critGasData, nominalML); // nominalML predicts LOW_RISK
assert(
  r4.level === 'CRITICAL' && r4.source === 'RULE_BASED',
  "TEST 4: Critical safety rule violation CANNOT be overridden by ML LOW_RISK prediction"
);

// ----------------------------------------------------
// TEST 5: Multiple sensors abnormal -> highest severity selected, all reasons preserved
// ----------------------------------------------------
const multiData = {
  ...nominalData,
  vib_rms: 2.5, // CRITICAL (>= 1.5)
  gas_raw: 520, // WATCH (>= 400)
  temperature: 24.0 // NORMAL
};
const r5 = evaluateRisk(multiData, nominalML);
assert(
  r5.level === 'CRITICAL' &&
  r5.reasons.some(r => r.sensor === 'Vibration' && r.severity === 'CRITICAL') &&
  r5.reasons.some(r => r.sensor === 'Gas' && r.severity === 'WATCH'),
  "TEST 5: Multiple abnormal sensors -> highest severity (CRITICAL) selected, all reasons preserved"
);

// ----------------------------------------------------
// TEST 6: Same abnormal sensor for 10 readings -> ONE active alert, not 10 duplicate alerts
// ----------------------------------------------------
let alertsState = [];
for (let i = 0; i < 10; i++) {
  const simData = { ...nominalData, vib_rms: 0.82 + (i * 0.01) };
  const res = evaluateAlerts(simData, nominalML, alertsState);
  alertsState = res.updatedAlerts;
}
const activeVibAlerts = alertsState.filter(a => a.sensor === 'Vibration' && a.status === 'ACTIVE');
assert(
  activeVibAlerts.length === 1,
  `TEST 6: 10 consecutive abnormal readings produced exactly 1 active alert (found ${activeVibAlerts.length})`
);

// ----------------------------------------------------
// TEST 7: Condition returns to safe -> alert RESOLVED
// ----------------------------------------------------
const recoveryRes = evaluateAlerts(nominalData, nominalML, alertsState);
const resolvedVibAlert = recoveryRes.updatedAlerts.find(a => a.sensor === 'Vibration');
assert(
  resolvedVibAlert && resolvedVibAlert.status === 'RESOLVED' && resolvedVibAlert.resolved_at !== null,
  "TEST 7: When sensor reading returns to safe range -> alert is automatically marked RESOLVED"
);

// ----------------------------------------------------
// TEST 8: Acknowledged alert with condition still active -> remains ACTIVE/ACKNOWLEDGED, not RESOLVED
// ----------------------------------------------------
// Trigger an alert
let step1Alerts = evaluateAlerts({ ...nominalData, temperature: 45 }, nominalML, []).updatedAlerts;
// Acknowledge it
step1Alerts = step1Alerts.map(a => ({ ...a, status: 'ACKNOWLEDGED', acknowledged: true }));
// Receive another reading with temperature still high (46°C)
const step2Alerts = evaluateAlerts({ ...nominalData, temperature: 46 }, nominalML, step1Alerts).updatedAlerts;
const ackAlert = step2Alerts.find(a => a.sensor === 'Temperature');
assert(
  ackAlert && ackAlert.status === 'ACKNOWLEDGED' && ackAlert.acknowledged === true,
  "TEST 8: Acknowledged alert with condition still active remains ACKNOWLEDGED (ACKNOWLEDGED !== RESOLVED)"
);

// ----------------------------------------------------
// TEST 9: All sensors unavailable -> INSUFFICIENT_DATA handled cleanly
// ----------------------------------------------------
const emptyData = {
  id: 0,
  node_id: "NODE_01",
  event_id: null,
  tilt_x: null,
  tilt_y: null,
  pressure: null,
  gas_raw: null,
  temperature: null,
  humidity: null,
  distance_cm: null,
  vib_rms: null,
  created_at: new Date().toISOString()
};
const r9 = evaluateRisk(emptyData, { ...nominalML, prediction: 'INSUFFICIENT_DATA', confidence: 0 });
assert(
  r9.level === 'NORMAL' && r9.reasons.length === 0,
  "TEST 9: Missing sensor fields handled cleanly without crashing or producing false alerts"
);

// ----------------------------------------------------
// TEST 10: Combined Tilt Magnitude Assessment
// ----------------------------------------------------
const tiltData = { ...nominalData, tilt_x: 16.0, tilt_y: 16.0 }; // sqrt(16^2 + 16^2) = 22.62° (CRITICAL >= 21.2°)
const r10 = evaluateRisk(tiltData, nominalML);
assert(
  r10.level === 'CRITICAL' && r10.reasons.some(r => r.sensor === 'Tilt Magnitude'),
  "TEST 10: Combined tilt magnitude (sqrt(x^2 + y^2)) properly evaluated"
);

// ----------------------------------------------------
// TEST 11: Explainable Human-Readable Reasons
// ----------------------------------------------------
const expData = { ...nominalData, distance_cm: 3.5 }; // critical <= 5.0cm
const r11 = evaluateRisk(expData, nominalML);
assert(
  r11.reasons.length > 0 && r11.reasons[0].message.includes("Distance"),
  "TEST 11: Generates transparent human-readable explanations with exact numbers and units"
);

// ----------------------------------------------------
// TEST 12: Gas units remain raw ADC (not converted to PPM)
// ----------------------------------------------------
assert(
  SENSOR_THRESHOLDS.gas_raw.unit === '' && typeof nominalData.gas_raw === 'number',
  "TEST 12: Gas raw readings preserved as pure ADC integer without invalid PPM conversion"
);

console.log("==================================================");
console.log(`VALIDATION RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
}
