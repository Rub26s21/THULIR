# THULIR AI System Architecture

## Distributed Node-Level Intelligence & Multi-Node Evidence Fusion

THULIR uses a distributed node-level intelligence architecture combined with multi-node evidence fusion and higher-level AI investigation.

```text
NODE 01
Sensors (MPU6050, BMP280, ADXL345, DHT22, MQ-2, HC-SR04)
  ↓
ESP8266 Telemetry Transmission (HTTPS / PostgREST)
  ↓
Supabase sensor_data
  ↓
Node-level feature extraction (9 features)
  ↓
Node-level Random Forest inference (100 Decision Trees)
  ↓
Node 01 NodeRiskState (Risk Class, Probabilities, Health, Freshness)

NODE 02 ... NODE N
Sensors
  ↓
Telemetry
  ↓
Node-level feature extraction
  ↓
Node-level Random Forest inference
  ↓
Node N NodeRiskState

                    ↓
                  A-POD
  (Adaptive Physical-Observation Distillation Engine)
  THULIR's Multi-Node Evidence Fusion Engine
                    │
                    ├── 1. Node Reliability: Q_i = H_i × C_i × D_i
                    ├── 2. Network Risk: R_network = Σ(Q_i × R_i) / ΣQ_i
                    ├── 3. Spatial Correlation: S (Mesh Adjacency & Clustering)
                    ├── 4. Temporal Persistence: T (Linear Regression Trend Slope)
                    └── 5. Sensor Agreement: M (Physical Cross-Channel Verification)
                    │
                    ▼
  Master Evidence Fusion: E = 0.40 R_network + 0.20 S + 0.20 T + 0.20 M
                    ↓
                APODResult
  (Categorical State: NORMAL | WATCH | ELEVATED | HIGH | CRITICAL)
                    │
                    ├─────────────────────────────────────────┐
                    ▼                                         ▼
        Frontend Dashboard UI                   Ground Event Investigator
  (SmartMineControlDesk, APODPanel,                           │
   MLPanel, SensorCards, Charts)                              ▼
                                                    NVIDIA Nemotron 3 Ultra
                                                    (via OpenRouter)
                                                              │
                                                              ▼
                                                 Human Operator Verification
```

---

## Core Architectural Principles

1. **Distributed Node-Level Intelligence**:
   - The ESP8266 IoT firmware (`firmware/node_01/node_01.ino`) acquires physical measurements from 6 hardware sensors, packages the readings, and transmits them to Supabase PostgreSQL.
   - The application ML runtime (`src/utils/mlEngine.ts`) independently converts each available node's telemetry into a standardized 9-dimensional feature vector and executes inference through the trained 100-tree Random Forest classifier (`ml/models/model_weights.json`).
   - The resulting `NodeRiskState` encapsulates that node's local intelligence (risk classification, class probabilities, health, data freshness, and physical threshold status).

2. **A-POD Multi-Node Evidence Fusion Engine**:
   - **A-POD** stands for **Adaptive Physical-Observation Distillation Engine**.
   - It acts as THULIR's authoritative multi-node evidence fusion engine.
   - A-POD receives processed `NodeRiskState[]` inputs from all registered nodes and deterministically computes:
     - **Node Reliability ($Q_i$)**: $Q_i = H_i \cdot C_i \cdot D_i$, strictly guaranteeing offline/unknown nodes have $Q_i = 0$ and never contribute false "safe" signals.
     - **Network Risk ($R_{\text{network}}$)**: $R_{\text{network}} = \frac{\sum Q_i R_i}{\sum Q_i}$.
     - **Spatial Correlation ($S$)**: Graph analysis on mesh neighbor adjacency to differentiate isolated sensor noise from multi-node ground movement.
     - **Temporal Persistence ($T$)**: Linear regression trend analysis across a sliding historical window.
     - **Sensor Agreement ($M$)**: Physical cross-validation between structural (tilt, vibration, displacement) and environmental (gas, pressure) channels.
     - **Master Evidence Score ($E$)**: $E = 0.40 R_{\text{network}} + 0.20 S + 0.20 T + 0.20 M$.

3. **Ground Event Investigator (NVIDIA Nemotron 3 Ultra)**:
   - The LLM integration is strictly downstream of A-POD.
   - It does **not** replace the Random Forest, A-POD mathematical fusion, or physical safety thresholds.
   - It acts as an interpretive geotechnical assistant that analyzes the structured A-POD evidence package, synthesizes the mechanical hypothesis, verifies signal consistency, and provides human operators with targeted verification steps.

4. **Zero Fabrication & Deterministic Safety**:
   - Unknown or offline nodes are never fabricated as `LOW_RISK`.
   - If telemetry is unavailable or the LLM fails/times out, the deterministic safety engine, A-POD state, and physical threshold alert system remain 100% operational.

