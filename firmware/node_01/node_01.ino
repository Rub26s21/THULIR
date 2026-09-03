// ============================================================
//              THULIR - NODE_01 FIRMWARE
//       ESP8266 NodeMCU IoT Sensor Node
// ============================================================
//
// Sensors:
//   MPU6050  (I2C) → Tilt X, Tilt Y
//   BMP280   (I2C) → Pressure
//   ADXL345  (I2C) → Vibration RMS
//   DHT22    (D7)  → Temperature, Humidity
//   MQ-2     (A0)  → Gas raw analog
//   HC-SR04  (D5/D6) → Distance
//
// Target: NodeMCU 1.0 (ESP-12E Module)
// Serial: 115200 baud
// Transmission: Every 5 seconds → Supabase REST API
//
// ============================================================

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_ADXL345_U.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============================================================
//              CONFIGURATION — MODIFY HERE
// ============================================================

// --- Wi-Fi ---
const char* WIFI_SSID     = "Rubss";
const char* WIFI_PASSWORD  = "1234567890";

// --- Supabase ---
// IMPORTANT: Use the anon/public key. NEVER use service-role key.
const char* SUPABASE_URL   = "https://cdsjgvpjvyewepgalset.supabase.co";
const char* SUPABASE_KEY   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2pndnBqdnlld2VwZ2Fsc2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODczMTEsImV4cCI6MjEwMzU2MzMxMX0._1rsBzlWEl5GcO701B-KMvhyLoNeMN69P5-woTFFtLc";

// --- Node ---
const char* NODE_ID = "NODE_01";

// --- Timing ---
const unsigned long TRANSMIT_INTERVAL_MS = 5000;

// --- Pin Configuration ---
// I2C (shared by MPU6050, BMP280, ADXL345)
#define SDA_PIN D2  // GPIO4
#define SCL_PIN D1  // GPIO5

// DHT22
#define DHT_PIN D7  // GPIO13
#define DHT_TYPE DHT22

// MQ-2
#define MQ2_PIN A0

// HC-SR04
#define HCSR04_TRIG D5  // GPIO14
#define HCSR04_ECHO D6  // GPIO12
// NOTE: ECHO must be voltage-protected (voltage divider)
//       before connecting to ESP8266 GPIO12.

// --- Vibration RMS Config ---
#define VIB_SAMPLE_COUNT 50
#define VIB_SAMPLE_DELAY_MS 2

// ============================================================
//                    SENSOR OBJECTS
// ============================================================

Adafruit_MPU6050 mpu;
Adafruit_BMP280 bmp;
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
DHT dht(DHT_PIN, DHT_TYPE);

// ============================================================
//                    SENSOR FLAGS
// ============================================================

bool mpuReady   = false;
bool bmpReady   = false;
bool adxlReady  = false;
bool dhtReady   = false;

// ============================================================
//                    EVENT COUNTER
// ============================================================

unsigned long eventCounter = 0;

// ============================================================
//                    SETUP
// ============================================================

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("================================================");
  Serial.println("              THULIR - NODE_01");
  Serial.println("================================================");
  Serial.print("[SYSTEM] Reset reason: ");
  Serial.println(ESP.getResetReason());
  Serial.print("[MEMORY] Free heap at boot: ");
  Serial.println(ESP.getFreeHeap());
  Serial.println();

  // --- I2C ---
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("[I2C] Initialized on SDA=D2, SCL=D1");

  // --- MPU6050 ---
  if (mpu.begin()) {
    mpuReady = true;
    mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
    mpu.setGyroRange(MPU6050_RANGE_250_DEG);
    Serial.println("[MPU6050] Initialized OK");
  } else {
    Serial.println("[SENSOR ERROR] MPU6050 not found");
  }

  // --- BMP280 ---
  if (bmp.begin(0x76)) {
    bmpReady = true;
    Serial.println("[BMP280] Initialized OK");
  } else if (bmp.begin(0x77)) {
    bmpReady = true;
    Serial.println("[BMP280] Initialized OK (addr 0x77)");
  } else {
    Serial.println("[SENSOR ERROR] BMP280 not found");
  }

  // --- ADXL345 ---
  if (accel.begin()) {
    adxlReady = true;
    accel.setRange(ADXL345_RANGE_2_G);
    Serial.println("[ADXL345] Initialized OK");
  } else {
    Serial.println("[SENSOR ERROR] ADXL345 not found");
  }

  // --- DHT22 ---
  dht.begin();
  dhtReady = true;
  Serial.println("[DHT22] Initialized OK");

  // --- HC-SR04 ---
  pinMode(HCSR04_TRIG, OUTPUT);
  pinMode(HCSR04_ECHO, INPUT);
  digitalWrite(HCSR04_TRIG, LOW);
  Serial.println("[HC-SR04] Initialized OK (TRIG=D5, ECHO=D6)");

  // --- MQ-2 ---
  pinMode(MQ2_PIN, INPUT);
  Serial.println("[MQ-2] Analog input configured on A0");

  Serial.println();
  Serial.println("================================================");
  Serial.println("Connecting to Wi-Fi...");
  Serial.print("SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("[WIFI] Connected successfully!");
    Serial.print("[WIFI] IP Address : ");
    Serial.println(WiFi.localIP());
    Serial.print("[WIFI] RSSI       : ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("[WIFI ERROR] Failed to connect — will retry in loop");
  }

  Serial.println("================================================");
  Serial.println("Sensor node initialization complete.");
  Serial.print("[MEMORY] Free heap after setup: ");
  Serial.println(ESP.getFreeHeap());
  Serial.println("Starting transmission cycle (every 5s)...");
  Serial.println();
}

// ============================================================
//                    SENSOR READING FUNCTIONS
// ============================================================

// --- MPU6050: Tilt X & Tilt Y (degrees) ---
bool readTilt(float &tiltX, float &tiltY) {
  if (!mpuReady) return false;

  sensors_event_t a, g, temp;
  if (!mpu.getEvent(&a, &g, &temp)) return false;

  float ax = a.acceleration.x;
  float ay = a.acceleration.y;
  float az = a.acceleration.z;

  float norm = sqrt(ax * ax + ay * ay + az * az);
  if (norm < 0.001) return false;

  tiltX = atan2(ay, sqrt(ax * ax + az * az)) * 180.0 / PI;
  tiltY = atan2(-ax, sqrt(ay * ay + az * az)) * 180.0 / PI;

  if (isnan(tiltX) || isnan(tiltY)) return false;
  return true;
}

// --- BMP280: Pressure (hPa) ---
bool readPressure(float &pressure) {
  if (!bmpReady) return false;

  pressure = bmp.readPressure() / 100.0F; // Pa → hPa

  if (isnan(pressure) || pressure < 300.0 || pressure > 1100.0) {
    return false;
  }
  return true;
}

// --- ADXL345: Vibration RMS (m/s²) ---
bool readVibrationRMS(float &vibRms) {
  if (!adxlReady) return false;

  float sumSq = 0;
  int validSamples = 0;

  for (int i = 0; i < VIB_SAMPLE_COUNT; i++) {
    sensors_event_t event;
    if (accel.getEvent(&event)) {
      float ax = event.acceleration.x;
      float ay = event.acceleration.y;
      float az = event.acceleration.z - 9.81; // Subtract 1g gravity

      float mag = sqrt(ax * ax + ay * ay + az * az);
      sumSq += mag * mag;
      validSamples++;
    }
    delay(VIB_SAMPLE_DELAY_MS);
  }

  if (validSamples < VIB_SAMPLE_COUNT / 2) return false;

  vibRms = sqrt(sumSq / validSamples);
  if (isnan(vibRms)) return false;
  return true;
}

// --- DHT22: Temperature (°C) & Humidity (%) ---
bool readDHT(float &temperature, float &humidity) {
  if (!dhtReady) return false;

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    return false;
  }
  return true;
}

// --- MQ-2: Raw ADC value (0-1023) ---
int readGasRaw() {
  return analogRead(MQ2_PIN);
}

// --- HC-SR04: Distance (cm) ---
bool readDistance(float &distanceCm) {
  digitalWrite(HCSR04_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(HCSR04_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(HCSR04_TRIG, LOW);

  long duration = pulseIn(HCSR04_ECHO, HIGH, 30000); // 30ms timeout (~5m)

  if (duration == 0) return false;

  distanceCm = (duration * 0.0343) / 2.0;

  if (distanceCm < 2.0 || distanceCm > 400.0) {
    return false;
  }
  return true;
}

// ============================================================
//                    GENERATE EVENT ID
// ============================================================

String generateEventId() {
  eventCounter++;
  return String(NODE_ID) + "-" + String(millis()) + "-" + String(eventCounter);
}

// ============================================================
//                    SUPABASE UPLOAD
// ============================================================

void uploadToSupabase(String jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[SUPABASE] WiFi not connected — skipping upload");
    return;
  }

  if (strlen(SUPABASE_KEY) == 0) {
    Serial.println("[SUPABASE] API key not configured — skipping upload");
    return;
  }

  // --- Network Pre-POST Diagnostics ---
  Serial.print("[NETWORK] WiFi Status   : ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");
  Serial.print("[NETWORK] Local IP      : ");
  Serial.println(WiFi.localIP());
  Serial.print("[NETWORK] RSSI          : ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");

  String endpoint = String(SUPABASE_URL) + "/rest/v1/sensor_data";

  Serial.println("[SUPABASE] Uploading telemetry...");
  Serial.print("[SUPABASE] Endpoint: ");
  Serial.println(endpoint);
  Serial.println("[SUPABASE] JSON:");
  Serial.println(jsonPayload);

  // Diagnostic heap inspection before creating secure client
  Serial.print("[MEMORY] Free heap BEFORE TLS client: ");
  Serial.println(ESP.getFreeHeap());

  Serial.println("[HTTPS] Creating WiFiClientSecure...");
  WiFiClientSecure client;
  Serial.println("[HTTPS] Client created.");

  client.setInsecure();
  Serial.println("[HTTPS] setInsecure OK.");

  client.setTimeout(10000);
  Serial.println("[HTTPS] setTimeout OK.");

  client.setBufferSizes(512, 512);
  Serial.println("[HTTPS] setBufferSizes OK.");

  Serial.println("[HTTPS] Creating HTTPClient...");
  HTTPClient https;
  Serial.println("[HTTPS] HTTPClient created.");

  Serial.println("[HTTPS] Calling https.begin()...");
  if (!https.begin(client, endpoint)) {
    Serial.println("[SUPABASE] HTTP POST FAILED: Unable to begin HTTPS connection to endpoint");
    return;
  }
  Serial.println("[HTTPS] https.begin() OK.");

  https.setTimeout(10000);

  https.addHeader("Content-Type", "application/json");
  https.addHeader("apikey", SUPABASE_KEY);
  https.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  https.addHeader("Prefer", "return=minimal");

  Serial.print("[MEMORY] Free heap BEFORE POST: ");
  Serial.println(ESP.getFreeHeap());

  Serial.println("[SUPABASE] Starting HTTPS POST...");
  int httpCode = https.POST(jsonPayload);
  Serial.println("[SUPABASE] HTTPS POST returned.");

  if (httpCode == 201) {
    Serial.println("[SUPABASE] HTTP STATUS: 201 (SUCCESS)");
    Serial.println("[SUPABASE] Database      : SUCCESS");
  } else if (httpCode > 0) {
    Serial.print("[SUPABASE] HTTP STATUS: ");
    Serial.println(httpCode);
    Serial.print("[SUPABASE] HTTP POST FAILED: Server returned HTTP ");
    Serial.println(httpCode);
    String response = https.getString();
    if (response.length() > 0) {
      Serial.print("[SUPABASE] Error Body    : ");
      Serial.println(response);
    }
  } else {
    Serial.print("[SUPABASE] HTTP STATUS: ");
    Serial.println(httpCode);
    Serial.print("[SUPABASE] HTTP POST FAILED: ");
    Serial.println(https.errorToString(httpCode));
  }

  https.end();
}

// ============================================================
//                    WIFI RECONNECT
// ============================================================

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("[WIFI] Reconnecting...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("[WIFI] Reconnected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[WIFI] Reconnect failed — will retry next cycle");
  }
}

// ============================================================
//                    MAIN LOOP
// ============================================================

void loop() {
  Serial.println();
  Serial.println("================================================");
  Serial.println("              THULIR - NODE_01");
  Serial.println("================================================");

  // Ensure Wi-Fi
  ensureWiFi();

  // --- Read all sensors ---
  float tiltX = 0, tiltY = 0;
  bool tiltOk = readTilt(tiltX, tiltY);

  float pressure = 0;
  bool pressureOk = readPressure(pressure);

  float temperature = 0, humidity = 0;
  bool dhtOk = readDHT(temperature, humidity);

  int gasRaw = readGasRaw();

  float distance = 0;
  bool distanceOk = readDistance(distance);

  float vibRms = 0;
  bool vibOk = readVibrationRMS(vibRms);

  // --- Print readings ---
  Serial.println();

  if (tiltOk) {
    Serial.println("[MPU6050 - TILT]");
    Serial.print("Tilt X        : "); Serial.print(tiltX, 2); Serial.println(" deg");
    Serial.print("Tilt Y        : "); Serial.print(tiltY, 2); Serial.println(" deg");
  } else {
    Serial.println("[SENSOR ERROR] MPU6050 - Tilt unavailable");
  }
  Serial.println();

  if (pressureOk) {
    Serial.println("[BMP280 - PRESSURE]");
    Serial.print("Pressure      : "); Serial.print(pressure, 2); Serial.println(" hPa");
  } else {
    Serial.println("[SENSOR ERROR] BMP280 - Pressure unavailable");
  }
  Serial.println();

  Serial.println("[MQ-2 - GAS]");
  Serial.print("Gas Raw       : "); Serial.println(gasRaw);
  Serial.println();

  if (dhtOk) {
    Serial.println("[DHT22 - ENVIRONMENT]");
    Serial.print("Temperature   : "); Serial.print(temperature, 2); Serial.println(" C");
    Serial.print("Humidity      : "); Serial.print(humidity, 2); Serial.println(" %");
  } else {
    Serial.println("[SENSOR ERROR] DHT22 - Temperature/Humidity unavailable");
  }
  Serial.println();

  if (distanceOk) {
    Serial.println("[HC-SR04 - DISTANCE]");
    Serial.print("Distance      : "); Serial.print(distance, 2); Serial.println(" cm");
  } else {
    Serial.println("[SENSOR ERROR] HC-SR04 - Distance unavailable");
  }
  Serial.println();

  if (vibOk) {
    Serial.println("[ADXL345 - VIBRATION]");
    Serial.print("Vibration RMS : "); Serial.print(vibRms, 4); Serial.println(" m/s2");
  } else {
    Serial.println("[SENSOR ERROR] ADXL345 - Vibration unavailable");
  }
  Serial.println();

  // --- Build JSON payload ---
  StaticJsonDocument<512> doc;
  doc["node_id"] = NODE_ID;
  doc["event_id"] = generateEventId();

  if (tiltOk) {
    doc["tilt_x"] = round(tiltX * 100.0) / 100.0;
    doc["tilt_y"] = round(tiltY * 100.0) / 100.0;
  } else {
    doc["tilt_x"] = (char*)NULL;
    doc["tilt_y"] = (char*)NULL;
  }

  if (pressureOk) {
    doc["pressure"] = round(pressure * 100.0) / 100.0;
  } else {
    doc["pressure"] = (char*)NULL;
  }

  doc["gas_raw"] = gasRaw;

  if (dhtOk) {
    doc["temperature"] = round(temperature * 100.0) / 100.0;
    doc["humidity"] = round(humidity * 100.0) / 100.0;
  } else {
    doc["temperature"] = (char*)NULL;
    doc["humidity"] = (char*)NULL;
  }

  if (distanceOk) {
    doc["distance_cm"] = round(distance * 100.0) / 100.0;
  } else {
    doc["distance_cm"] = (char*)NULL;
  }

  if (vibOk) {
    doc["vib_rms"] = round(vibRms * 10000.0) / 10000.0;
  } else {
    doc["vib_rms"] = (char*)NULL;
  }

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // --- Upload ---
  Serial.println("[SUPABASE]");
  uploadToSupabase(jsonPayload);

  Serial.println();
  Serial.println("================================================");

  delay(TRANSMIT_INTERVAL_MS);
}
