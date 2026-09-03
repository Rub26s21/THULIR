# THULIR Architecture

## System Architecture

THULIR uses a direct IoT-to-cloud architecture.

ESP8266 NODE_01 collects telemetry from six physical sensors and transmits the measurements directly to Supabase using HTTPS/PostgREST.

Supabase PostgreSQL acts as the system's single source of truth.

The React + TypeScript + Vite dashboard connects directly to Supabase using the public client credential and receives data through Supabase Realtime/Postgres Changes, with polling used as a fallback when realtime connectivity is unavailable.

There is no Python backend or application proxy in the current architecture.

```
                 PHYSICAL SENSORS
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    MPU6050         BMP280            DHT22
   Tilt X/Y        Pressure       Temp/Humidity
       │               │                │
       ├───────────────┼────────────────┤
       │               │                │
      MQ-2          HC-SR04          ADXL345
    Gas Raw        Distance          Vibration
       │               │                │
       └───────────────┼────────────────┘
                       ▼
               ESP8266 NODE_01
                       │
                  Wi-Fi / HTTPS
                       │
                       ▼
                  SUPABASE
                       │
               ┌───────┴────────┐
               ▼                ▼
          PostgreSQL         Realtime
          sensor_data           │
               │                │
               └───────┬────────┘
                       ▼
             THULIR WEB DASHBOARD
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    Monitoring       Risk           Alerts
     & Charts        Engine         System
                       │
                       ▼
                ML / FALLBACK
```

### Core Architectural Principles

1. **Supabase as the Single Source of Truth**:
   - All physical telemetry is stored in the `sensor_data` table in Supabase PostgreSQL.
   - The frontend reads directly from Supabase using the JavaScript SDK with the public client key.
   - The ESP8266 posts directly via HTTPS to the Supabase PostgREST endpoint `/rest/v1/sensor_data`.

2. **Zero Intermediary Backend**:
   - No Python backend (FastAPI, Flask, Django, Uvicorn).
   - No Node/Express proxy.
   - No local mock JSON files (`data/state.json`) in the production flow.

3. **Realtime with Polling Fallback**:
   - The dashboard uses Supabase Realtime/Postgres Changes to react to new `sensor_data` records.
   - A 5-second polling fallback is used when the realtime subscription is unavailable.

4. **Honest ML Architecture**:
   - Modular `IThulirModel` interface that accepts standardized feature vectors.
   - Deterministic rule-based fallback when model weights are not loaded.
   - Explicit UI distinction between trained ML models and rule-based fallbacks.
