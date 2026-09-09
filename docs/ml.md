# THULIR AI — Machine Learning System & Random Forest Architecture

## Overview & Distributed Node-Level Intelligence

THULIR uses a distributed node-level intelligence architecture. Each available node's telemetry is independently converted into the canonical 9-feature vector and passed through the trained 100-tree Random Forest model (`thulir-risk-rf-v1.0`). The resulting `NodeRiskState` represents that node's local intelligence and is then provided to A-POD for multi-node evidence fusion.

The physical ESP8266 microcontroller firmware is responsible for physical sensor acquisition and transmission to Supabase, while the application ML runtime (`src/utils/mlEngine.ts`) independently executes node-level Random Forest inference across the 100-tree decision graph (`ml/models/model_weights.json`).

---

## Model Specifications

- **Model Type**: Random Forest Classifier (`RandomForestClassifier`)
- **Version**: `thulir-risk-rf-v1.0`
- **Estimators**: 100 Decision Trees (max depth 8)
- **Target Classes**: `LOW_RISK`, `MODERATE_RISK`, `HIGH_RISK`
- **Feature Vector**: 9 continuous sensor features
- **Random State**: 42

---

## 9 Continuous Input Features

1. `tilt_x`: MPU6050 inclination X (°)
2. `tilt_y`: MPU6050 inclination Y (°)
3. `tilt_magnitude`: $\sqrt{\text{tilt\_x}^2 + \text{tilt\_y}^2}$
4. `pressure`: BMP280 atmospheric pressure (hPa)
5. `gas_raw`: MQ-2 raw ADC analog reading
6. `temperature`: DHT22 temperature (°C)
7. `humidity`: DHT22 humidity (%)
8. `distance_cm`: HC-SR04 distance (cm)
9. `vib_rms`: ADXL345 50-sample RMS acceleration (m/s²)

---

## Model Evaluation Metrics

- **Training Samples**: 2,400
- **Test Samples**: 600
- **Test Accuracy**: 100.00%
- **Macro Precision**: 100.00%
- **Macro Recall**: 100.00%
- **Macro F1-Score**: 100.00%

*Disclaimer: Trained on synthetic development dataset derived from engineering thresholds. Not field disaster data.*

---

## Runtime Node-Level Inference & Safety Fallback

1. When telemetry arrives at the dashboard for any node, `runMLInference(data)` is executed independently for that node.
2. The 9 sensor features are extracted (`extractFeatures`) and imputed against model medians.
3. The 100 decision trees evaluate the feature vector and aggregate leaf class vote distributions into class probabilities $[P_{\text{low}}, P_{\text{mod}}, P_{\text{high}}]$.
4. The authoritative `NodeRiskState` is constructed and delivered to A-POD for multi-node evidence fusion.
5. If model weights are missing or uninitialized, the system automatically falls back to the deterministic safety rule engine and labels `RULE-BASED FALLBACK`.

