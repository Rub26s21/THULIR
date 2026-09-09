# THULIR AI — IoT Structural & Environmental Monitoring Platform

**THULIR** is a distributed IoT early-warning and continuous environmental/structural monitoring platform designed for real-time telemetry from physical sensor nodes (ESP8266 NodeMCU), node-level Random Forest machine learning inference, A-POD multi-node evidence fusion, and AI-driven Ground Event Investigation.

---

## Architecture Overview

THULIR uses a distributed node-level intelligence architecture combined with multi-node evidence fusion and higher-level AI investigation.

```text
NODE 01 (Sensors)       NODE 02 (Sensors)       NODE N (Sensors)
       │                       │                       │
       ▼                       ▼                       ▼
  ESP8266 Node            ESP8266 Node            ESP8266 Node
       │                       │                       │
       ▼ (HTTPS / PostgREST)   ▼ (HTTPS / PostgREST)   ▼ (HTTPS / PostgREST)
 [ Supabase sensor_data ] [ Supabase sensor_data ] [ Supabase sensor_data ]
       │                       │                       │
       ▼                       ▼                       ▼
Node-level Feature Ext.  Node-level Feature Ext.  Node-level Feature Ext.
       │                       │                       │
       ▼                       ▼                       ▼
Node-level Random Forest Node-level Random Forest Node-level Random Forest
       │                       │                       │
       ▼                       ▼                       ▼
Node 01 NodeRiskState    Node 02 NodeRiskState    Node N NodeRiskState
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                               ▼
                             A-POD
          (Adaptive Physical-Observation Distillation Engine)
              THULIR's Multi-Node Evidence Fusion Engine
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
           Spatial (S)   Temporal (T)    Sensors (M)
                │              │              │
                └──────────────┼──────────────┘
                               ▼
            Master Evidence Score (E) & Network State
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       THULIR WEB DASHBOARD        GROUND EVENT INVESTIGATOR
     (SmartMineControlDesk,                   │
      APODPanel, MLPanel)                     ▼
                                   NVIDIA Nemotron 3 Ultra
                                   (OpenRouter Geotechnical AI)
                                              │
                                              ▼
                                 Human Operator Verification
```

---

## Physical Hardware & Pin Assignment

### Controller
- **ESP8266 NodeMCU 1.0 (ESP-12E Module)** — Node ID: `NODE_01`

### 6 Physical Sensors & Responsibilities

| Sensor | Subsystem | Responsibility | Canonical Field | Pin Connection |
|---|---|---|---|---|
| **MPU6050** | I2C | Tilt X & Tilt Y (Inclination) | `tilt_x`, `tilt_y` | I2C: SDA → D2 (GPIO4), SCL → D1 (GPIO5) |
| **BMP280** | I2C | Atmospheric Pressure | `pressure` | I2C: SDA → D2 (GPIO4), SCL → D1 (GPIO5) |
| **ADXL345** | I2C | Vibration RMS (50-sample RMS) | `vib_rms` | I2C: SDA → D2 (GPIO4), SCL → D1 (GPIO5) |
| **DHT22** | Single-bus | Temperature & Humidity | `temperature`, `humidity` | DATA → D7 (GPIO13) |
| **MQ-2** | Analog | Raw Gas Analog Value | `gas_raw` | AO → A0 (Raw ADC reading) |
| **HC-SR04** | Ultrasonic | Distance Measurement | `distance_cm` | TRIG → D5 (GPIO14), ECHO → D6 (GPIO12)* |

*\*HC-SR04 ECHO is voltage-protected before connection to the ESP8266 GPIO input.*

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` based on `.env.example`:
```env
VITE_SUPABASE_URL=https://qwertyuiopasdfghjkl.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

### 3. Start Local Dashboard
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## Features

1. **Live Sensor Grid**: 8 cards (Tilt X, Tilt Y, Pressure, Gas, Temperature, Humidity, Distance, Vibration) with real-time status badges and units.
2. **Centralized Risk Engine**: Deterministic `NORMAL`, `WATCH`, and `CRITICAL` evaluation with explicit reason breakdown.
3. **Alert Management**: Client-side threshold crossing evaluation with manual acknowledgment and automatic resolution.
4. **Historical Trend Charts**: Interactive Recharts graphs with `1H`, `6H`, `24H`, and `7D` range selectors.
5. **Node Health & Freshness**: Calculates `LIVE` (<15s), `RECENT` (<60s), `STALE` (<300s), and `OFFLINE` states with individual hardware health.
6. **Network Topology**: Visual THULIR → Supabase → NODE_01 → 6 Sensors graph.
7. **Demo & No-Data Modes**: Realistic simulated telemetry mode with instant toggle for offline demonstrations.
8. **Firmware Included**: Complete Arduino C++ sketch in `firmware/node_01/node_01.ino`.

---

## Project Structure

```
thulir ml/
├── src/
│   ├── components/       # Header, SensorGrid, RiskPanel, AlertPanel, MLPanel, NodeHealth, NetworkTopology, HistoricalCharts, States
│   ├── hooks/            # useRealtimeData, useSensorData, useAlerts, useNodeHealth, useDemoMode
│   ├── services/         # sensorService, alertService, nodeService, mlService
│   ├── lib/              # supabase.ts client initialization
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # riskEngine, alertEngine, mlEngine, dataMapping
│   ├── config/           # thresholds.ts centralized thresholds & limits
│   ├── pages/            # Dashboard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css         # Dark engineering dashboard theme
├── firmware/
│   └── node_01/
│       └── node_01.ino   # Complete ESP8266 Arduino firmware
├── ml/
│   └── model.ts          # IThulirModel interface
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docs/                 # Full architecture, hardware, supabase, firmware, ml, alerts, dashboard, testing docs
├── .env.example
├── package.json
└── vite.config.ts
```

---

## Documentation Links

- [Architecture Guide](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/architecture.md)
- [Hardware & Wiring Manual](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/hardware.md)
- [Supabase & Database Setup](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/supabase.md)
- [Firmware Upload Guide](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/firmware.md)
- [ML & Fallback System](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/ml.md)
- [Alerts & Risk Engine](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/alerts.md)
- [Dashboard UX Guide](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/dashboard.md)
- [Testing & QA Report](file:///c:/Users/ADMIN/Desktop/thulir%20ml/docs/testing.md)
