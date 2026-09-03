# Machine Learning System & Random Forest Architecture

## Overview

The THULIR Machine Learning layer features a real, trained **Random Forest Classifier** (`thulir-risk-rf-v1.0`) trained with scikit-learn on multi-sensor structural and environmental parameters, with an automatic deterministic safety fallback.

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

## Runtime Inference & Safety Fallback

1. When telemetry arrives at the dashboard, `runMLInference(data)` is executed.
2. The 9 sensor features are extracted and imputed against model medians.
3. The 100 decision trees evaluate the feature vector and aggregate leaf class vote distributions.
4. If model weights are missing or uninitialized, the system automatically falls back to the deterministic safety rule engine and labels `RULE-BASED FALLBACK`.
