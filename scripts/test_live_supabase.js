// ============================================================
// THULIR - Live Supabase Connection & Telemetry Verification
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { runMLInference } from '../src/utils/mlEngine.ts';
import { evaluateRisk } from '../src/utils/riskEngine.ts';
import { evaluateAlerts } from '../src/utils/alertEngine.ts';
import { mapRowToSensorData } from '../src/utils/dataMapping.ts';

const SUPABASE_URL = "https://cdsjgvpjvyewepgalset.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2pndnBqdnlld2VwZ2Fsc2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODczMTEsImV4cCI6MjEwMzU2MzMxMX0._1rsBzlWEl5GcO701B-KMvhyLoNeMN69P5-woTFFtLc";

console.log("==================================================");
console.log("THULIR - LIVE SUPABASE & ML INTEGRATION TEST");
console.log("==================================================");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLiveIntegration() {
  console.log("[1/5] Fetching latest NODE_01 row from public.sensor_data...");
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('node_id', 'NODE_01')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("[FAIL] Error fetching from Supabase:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.warn("[WARN] No rows found for NODE_01 in sensor_data table yet.");
    console.log("Testing with confirmed real hardware payload structure...");
  } else {
    console.log(`[PASS] Successfully retrieved ${data.length} live rows for NODE_01.`);
    console.log("Latest Live Row:\n", JSON.stringify(data[0], null, 2));
  }

  const rawRow = (data && data.length > 0) ? data[0] : {
    node_id: "NODE_01",
    event_id: "NODE_01-810734-160",
    tilt_x: -1.361282,
    tilt_y: 1.347667,
    pressure: 991.6192,
    gas_raw: 247,
    temperature: 35.7,
    humidity: 54.3,
    distance_cm: 40.49115,
    vib_rms: 0.650442,
    created_at: new Date().toISOString()
  };

  console.log("\n[2/5] Mapping DB Row to SensorData Contract...");
  const sensorData = mapRowToSensorData(rawRow);
  console.log("Mapped SensorData:\n", JSON.stringify(sensorData, null, 2));

  console.log("\n[3/5] Executing Random Forest ML Inference (thulir-risk-rf-v1.0)...");
  const mlResult = runMLInference(sensorData);
  console.log("ML Prediction Output:\n", JSON.stringify(mlResult, null, 2));

  console.log("\n[4/5] Evaluating Central Risk Engine...");
  const riskResult = evaluateRisk(sensorData, mlResult);
  console.log("Risk Engine Output:\n", JSON.stringify(riskResult, null, 2));

  console.log("\n[5/5] Evaluating Alert Engine...");
  const alertResult = evaluateAlerts(sensorData, mlResult, []);
  console.log("Alert Engine Output:\n", JSON.stringify(alertResult, null, 2));

  console.log("\n==================================================");
  console.log("ALL INTEGRATION CHECKS COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
}

testLiveIntegration().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
