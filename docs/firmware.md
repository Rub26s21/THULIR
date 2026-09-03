# ESP8266 Firmware & Upload Manual

The complete Arduino C++ firmware is located at [`firmware/node_01/node_01.ino`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/firmware/node_01/node_01.ino).

---

## Step-by-Step Upload Instructions

1. **Install Arduino IDE**: Download and install the latest Arduino IDE (2.x or 1.8.x).
2. **Add ESP8266 Board Package**:
   - Open **File → Preferences**.
   - In *Additional Board Manager URLs*, add: `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
   - Open **Tools → Board → Boards Manager**, search for `esp8266`, and click **Install**.
3. **Install Required Libraries**:
   - `Adafruit MPU6050`
   - `Adafruit BMP280 Library`
   - `Adafruit ADXL345`
   - `Adafruit Unified Sensor`
   - `DHT sensor library` (Adafruit)
   - `ArduinoJson` (v6.x)
4. **Configure Wi-Fi & Supabase Key**:
   In `firmware/node_01/node_01.ino`:
   ```cpp
   const char* WIFI_SSID     = "Rubss";
   const char* WIFI_PASSWORD  = "1234567890";
   const char* SUPABASE_KEY   = "YOUR_ANON_PUBLIC_KEY";
   ```
5. **Select Board & Port**:
   - Board: `NodeMCU 1.0 (ESP-12E Module)`
   - Port: Select the active COM port (e.g., `COM5`)
   - Upload Speed: `115200`
6. **Upload Firmware**: Click the Upload button.
7. **Verify Serial Output**:
   Open the Serial Monitor at **115200 baud**.
   You should see structured outputs:
   ```text
   ================================================
                 THULIR - NODE_01
   ================================================
   [MPU6050 - TILT]
   Tilt X        : 0.42 deg
   Tilt Y        : -0.31 deg

   [BMP280 - PRESSURE]
   Pressure      : 1008.42 hPa

   [MQ-2 - GAS]
   Gas Raw       : 280

   [DHT22 - ENVIRONMENT]
   Temperature   : 28.50 C
   Humidity      : 62.00 %

   [HC-SR04 - DISTANCE]
   Distance      : 42.10 cm

   [ADXL345 - VIBRATION]
   Vibration RMS : 0.0820 m/s2

   [NETWORK]
   WiFi Status   : CONNECTED
   IP            : 192.168.1.50

   [SUPABASE]
   Uploading...
   HTTP Response : 201
   Database      : SUCCESS
   ================================================
   ```
