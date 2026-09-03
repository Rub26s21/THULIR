"""
THULIR - ML Test Suite
======================
Comprehensive unit and integration tests for the ML pipeline.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from preprocessing.preprocessor import ThulirPreprocessor, FEATURE_NAMES
from infer import ThulirRiskPredictor

def test_dataset_exists():
    path = os.path.join(current_dir, 'data', 'thulir_sensor_dataset.csv')
    assert os.path.exists(path), f"Dataset missing: {path}"
    df = pd.read_csv(path)
    assert len(df) >= 1000, "Dataset has insufficient rows"
    for feat in FEATURE_NAMES:
        assert feat in df.columns, f"Feature {feat} missing in dataset"
    assert 'risk_label' in df.columns, "Target risk_label missing"
    print("[PASS] Test Dataset Exists & Validated")

def test_preprocessor_imputation():
    preprocessor = ThulirPreprocessor()
    # Missing tilt_magnitude and missing distance_cm
    sample = {
        'tilt_x': 3.0,
        'tilt_y': 4.0,
        'pressure': 1010.0,
        'gas_raw': None,
        'temperature': 25.0,
        'humidity': None,
        'distance_cm': None,
        'vib_rms': 0.05
    }
    X = preprocessor.transform_single(sample)
    assert X.shape == (1, 9), f"Unexpected shape {X.shape}"
    # tilt_magnitude should be sqrt(3^2 + 4^2) = 5.0 (index 2)
    assert np.isclose(X[0, 2], 5.0), f"Expected tilt_magnitude 5.0, got {X[0, 2]}"
    # Missing gas_raw should be imputed with median (not NaN)
    assert np.isfinite(X[0, 4]), "Imputed gas_raw is not finite"
    print("[PASS] Test Preprocessor & Imputation")

def test_model_loading_and_inference():
    predictor = ThulirRiskPredictor()
    assert predictor.version == 'thulir-risk-rf-v1.0'
    assert len(predictor.classes) == 3

    # Normal sample
    res_low = predictor.predict({
        'tilt_x': 0.2, 'tilt_y': 0.1, 'pressure': 1013.0,
        'gas_raw': 100, 'temperature': 24.0, 'humidity': 50.0,
        'distance_cm': 50.0, 'vib_rms': 0.02
    })
    assert res_low['prediction'] == 'LOW_RISK'
    assert res_low['confidence'] > 0.5
    assert 'LOW_RISK' in res_low['probabilities']

    # Extreme sample
    res_high = predictor.predict({
        'tilt_x': 25.0, 'tilt_y': 20.0, 'pressure': 920.0,
        'gas_raw': 800, 'temperature': 60.0, 'humidity': 95.0,
        'distance_cm': 2.0, 'vib_rms': 3.5
    })
    assert res_high['prediction'] == 'HIGH_RISK'
    assert res_high['confidence'] > 0.5
    assert 'HIGH_RISK' in res_high['probabilities']

    print("[PASS] Test Model Loading & Real Inference")

def test_json_weights_parity():
    """Verify that JSON exported tree weights produce identical inference to joblib model."""
    weights_path = os.path.join(current_dir, 'models', 'model_weights.json')
    assert os.path.exists(weights_path), "model_weights.json not found"

    with open(weights_path, 'r') as f:
        weights = json.load(f)

    predictor = ThulirRiskPredictor()

    sample = {
        'tilt_x': 8.0, 'tilt_y': 6.0, 'pressure': 980.0,
        'gas_raw': 450, 'temperature': 42.0, 'humidity': 82.0,
        'distance_cm': 8.0, 'vib_rms': 0.85
    }

    # Python joblib prediction
    py_res = predictor.predict(sample)

    # Simulate JSON decision tree ensemble prediction
    preprocessor = ThulirPreprocessor(weights['feature_medians'])
    X = preprocessor.transform_single(sample)[0]

    tree_votes = np.zeros(len(weights['class_names']))
    for tree in weights['trees']:
        node = 0
        while tree['children_left'][node] != -1:
            feat_idx = tree['feature'][node]
            thresh = tree['threshold'][node]
            if X[feat_idx] <= thresh:
                node = tree['children_left'][node]
            else:
                node = tree['children_right'][node]

        # Leaf value
        leaf_vals = np.array(tree['values'][node])
        tree_probs = leaf_vals / np.sum(leaf_vals)
        tree_votes += tree_probs

    ensemble_probs = tree_votes / len(weights['trees'])
    json_pred = weights['class_names'][np.argmax(ensemble_probs)]

    assert py_res['prediction'] == json_pred, f"Mismatch: py={py_res['prediction']}, json={json_pred}"
    print(f"[PASS] Test JSON Tree Ensemble Parity (Prediction: {json_pred})")

if __name__ == '__main__':
    print("Running THULIR ML Test Suite...")
    test_dataset_exists()
    test_preprocessor_imputation()
    test_model_loading_and_inference()
    test_json_weights_parity()
    print("ALL ML TESTS PASSED SUCCESSFULLY!")
