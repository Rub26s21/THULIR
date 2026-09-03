# THULIR Machine Learning System

## Overview

The THULIR Machine Learning subsystem provides real-time multi-sensor risk classification. It upgrades the platform from basic heuristic thresholds to a statistical ensemble classifier trained on multi-sensor structural and environmental parameters.

---

## 1. Model Architecture & Hyperparameters

- **Model Type**: `RandomForestClassifier` (scikit-learn ensemble)
- **Model Version**: `thulir-risk-rf-v1.0`
- **Number of Estimators**: 100 decision trees
- **Maximum Tree Depth**: 8
- **Minimum Samples Split**: 4
- **Random Seed**: 42 (reproducible)

### Why Random Forest?
1. **Tabular Robustness**: Outstanding performance on mixed-scale tabular physical sensor features without requiring complex neural architectures.
2. **Interpretability & Calibration**: Yields well-calibrated class probability distributions across leaf vote aggregations.
3. **Zero-Latency Portability**: The fitted tree ensemble can be serialized both as a standard Python `.pkl` artifact and as lightweight JSON decision-tree structures, enabling pure local browser execution without requiring a heavy Python inference server.

---

## 2. Input Features (9 Dimensions)

| # | Feature Name | Source Sensor | Physical Meaning | Unit |
|---|---|---|---|---|
| 1 | `tilt_x` | MPU6050 | Angular inclination on X-axis | Degrees (°) |
| 2 | `tilt_y` | MPU6050 | Angular inclination on Y-axis | Degrees (°) |
| 3 | `tilt_magnitude` | Derived | Combined tilt vector: $\sqrt{\text{tilt\_x}^2 + \text{tilt\_y}^2}$ | Degrees (°) |
| 4 | `pressure` | BMP280 | Barometric atmospheric pressure | hPa |
| 5 | `gas_raw` | MQ-2 | Raw analog gas sensor ADC reading | Raw (0–1023) |
| 6 | `temperature` | DHT22 | Ambient temperature | °C |
| 7 | `humidity` | DHT22 | Relative atmospheric humidity | % |
| 8 | `distance_cm` | HC-SR04 | Ultrasonic distance / displacement measurement | cm |
| 9 | `vib_rms` | ADXL345 | 50-sample residual vibration acceleration RMS | m/s² |

---

## 3. Target Classes

1. **`LOW_RISK`**: Nominal baseline operating conditions.
2. **`MODERATE_RISK`**: Watch conditions with moderate inclination, elevated gas, or vibration.
3. **`HIGH_RISK`**: Critical conditions with excessive structural tilt, rapid barometric drop, high vibration, or displacement breach.

---

## 4. Dataset & Honesty Disclaimer

- **Training Samples**: 2,400 samples (80% split)
- **Test Samples**: 600 samples (20% split, stratified)
- **Dataset File**: [`ml/data/thulir_sensor_dataset.csv`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/ml/data/thulir_sensor_dataset.csv)
- **Dataset Disclaimer**: *This dataset is a development and prototype dataset synthesized from sensor physics distributions and engineering safety limits. It is NOT field-recorded disaster data.*

---

## 5. Evaluation Metrics

| Metric | Training Split | Test Split |
|---|---|---|
| **Accuracy** | 100.00% | 100.00% |
| **Macro Precision** | 100.00% | 100.00% |
| **Macro Recall** | 100.00% | 100.00% |
| **Macro F1-Score** | 100.00% | 100.00% |
| **5-Fold Cross-Validation** | 100.00% (+/- 0.0000) | — |

### Confusion Matrix (Test Split: 600 Samples)

$$\begin{pmatrix} 200 & 0 & 0 \\ 0 & 200 & 0 \\ 0 & 0 & 200 \end{pmatrix}$$

*(Rows: Actual Classes [HIGH_RISK, LOW_RISK, MODERATE_RISK], Columns: Predicted Classes)*

---

## 6. Model Artifacts

- **Joblib Model Binary**: [`ml/models/thulir-risk-rf-v1.0.pkl`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/ml/models/thulir-risk-rf-v1.0.pkl)
- **Metadata**: [`ml/models/model_metadata.json`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/ml/models/model_metadata.json)
- **Evaluation Report**: [`ml/evaluation/evaluation_report.json`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/ml/evaluation/evaluation_report.json)
- **JSON Weights**: [`ml/models/model_weights.json`](file:///c:/Users/ADMIN/Desktop/thulir%20ml/ml/models/model_weights.json) (and synced to `public/models/`)

---

## 7. Execution & Testing

### To Retrain Model:
```bash
python ml/train/train.py
```

### To Run Standalone Python Inference:
```bash
python ml/infer.py
```

### To Run Unit & Integration Tests:
```bash
python ml/test_ml.py
```
