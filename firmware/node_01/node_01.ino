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
// IMPORTANT:
//   - WiFi credentials are in the configuration section below
//   - Supabase URL and key must be configured
//   - HC-SR04 ECHO pin requires voltage divider protection
//   - MQ-2 gas_raw is uncalibrated — do NOT claim ppm
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
const char* SUPABASE_KEY   = "";  // <-- Paste your anon key here

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
// MQ-2 and HC-SR04 don't need initialization flags

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

  // --- MQ-2 ---
  pinMode(MQ2_PIN, INPUT);
  Serial.println("[MQ-2] Analog input ready on A0");

  // --- HC-SR04 ---
  pinMode(HCSR04_TRIG, OUTPUT);
  pinMode(HCSR04_ECHO, INPUT);
  Serial.println("[HC-SR04] Trig=D5, Echo=D6");

  // --- Wi-Fi ---
  Serial.println();
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("[WIFI] Connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[WIFI] Failed to connect — will retry in loop");
  }

  Serial.println();
  Serial.println("================================================");
  Serial.println("            INITIALIZATION COMPLETE");
  Serial.println("================================================");
  Serial.println();
}

// ============================================================
//                    SENSOR READING FUNCTIONS
// ============================================================

// --- Tilt from MPU6050 ---
bool readTilt(float &tiltX, float &tiltY) {
  if (!mpuReady) return false;

  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Tilt calculation from accelerometer
  // atan2 gives angle in radians, convert to degrees
  tiltX = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
  tiltY = atan2(-a.acceleration.x,
                sqrt(a.acceleration.y * a.acceleration.y +
                     a.acceleration.z * a.acceleration.z)) * 180.0 / PI;

  return true;
}

// --- Pressure from BMP280 ---
bool readPressure(float &pressure) {
  if (!bmpReady) return false;

  pressure = bmp.readPressure() / 100.0F;  // Pa to hPa
  if (isnan(pressure) || pressure < 300 || pressure > 1200) return false;

  return true;
}

// --- Temperature & Humidity from DHT22 ---
bool readDHT(float &temperature, float &humidity) {
  if (!dhtReady) return false;

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) return false;

  return true;
}

// --- Gas raw from MQ-2 ---
int readGasRaw() {
  return analogRead(MQ2_PIN);
}

// --- Distance from HC-SR04 ---
bool readDistance(float &distance) {
  digitalWrite(HCSR04_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(HCSR04_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(HCSR04_TRIG, LOW);

  long duration = pulseIn(HCSR04_ECHO, HIGH, 30000);  // 30ms timeout

  if (duration == 0) return false;  // Timeout — no echo

  distance = duration * 0.0343 / 2.0;  // cm

  if (distance < 2 || distance > 400) return false;  // Out of range

  return true;
}

// --- Vibration RMS from ADXL345 ---
bool readVibrationRMS(float &vibRms) {
  if (!adxlReady) return false;

  float sumSq = 0;
  int validSamples = 0;

  for (int i = 0; i < VIB_SAMPLE_COUNT; i++) {
    sensors_event_t event;
    accel.getEvent(&event);

    // RMS of the acceleration magnitude minus gravity
    float mag = sqrt(event.acceleration.x * event.acceleration.x +
                     event.acceleration.y * event.acceleration.y +
                     event.acceleration.z * event.acceleration.z);

    // Subtract approximate gravity (9.81 m/s²)
    float deviation = mag - 9.81;
    sumSq += deviation * deviation;
    validSamples++;

    delay(VIB_SAMPLE_DELAY_MS);
  }

  if (validSamples == 0) return false;

  vibRms = sqrt(sumSq / validSamples);
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

  String endpoint = String(SUPABASE_URL) + "/rest/v1/sensor_data";

  WiFiClientSecure client;
  // PROTOTYPE NOTE: Using setInsecure() for development.
  // For production, implement proper certificate validation.
  client.setInsecure();

  HTTPClient http;
  http.begin(client, endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  http.addHeader("Prefer", "return=minimal");

  Serial.println("[SUPABASE] Uploading...");

  int httpCode = http.POST(jsonPayload);

  Serial.print("[SUPABASE] HTTP Response : ");
  Serial.println(httpCode);

  if (httpCode == 201) {
    Serial.println("[SUPABASE] Database      : SUCCESS");
  } else {
    Serial.println("[SUPABASE] Database      : FAILED");
    String response = http.getString();
    if (response.length() > 0) {
      Serial.print("[SUPABASE] Error Body    : ");
      Serial.println(response);
    }
  }

  http.end();
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

  // --- Network status ---
  Serial.println("[NETWORK]");
  Serial.print("WiFi Status   : ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP            : ");
    Serial.println(WiFi.localIP());
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
