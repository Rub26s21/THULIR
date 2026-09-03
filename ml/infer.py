"""
THULIR - Standalone Python Inference Module
==========================================
Loads the trained .pkl model artifact and runs inference on arbitrary sensor payloads.
"""

import os
import sys
import joblib
import numpy as np
from typing import Dict, Any, Optional

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from preprocessing.preprocessor import ThulirPreprocessor

MODEL_PATH = os.path.join(current_dir, 'models', 'thulir-risk-rf-v1.0.pkl')

class ThulirRiskPredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at: {model_path}")

        data = joblib.load(model_path)
        self.model = data['model']
        self.preprocessor = data['preprocessor']
        self.feature_names = data['feature_names']
        self.classes = list(data['classes'])
        self.version = data.get('version', 'thulir-risk-rf-v1.0')

    def predict(self, sensor_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run inference on a single sensor record dictionary.
        Returns prediction, confidence (max class probability), and probability distribution.
        """
        X = self.preprocessor.transform_single(sensor_record)
        probs = self.model.predict_proba(X)[0]
        pred_idx = np.argmax(probs)
        pred_class = self.classes[pred_idx]
        confidence = float(probs[pred_idx])

        probabilities = {
            self.classes[i]: round(float(probs[i]), 4)
            for i in range(len(self.classes))
        }

        return {
            'prediction': pred_class,
            'confidence': round(confidence, 4),
            'probabilities': probabilities,
            'model_version': self.version,
            'model_type': 'RandomForestClassifier'
        }

if __name__ == '__main__':
    predictor = ThulirRiskPredictor()
    print("Loaded model version:", predictor.version)

    # Test Sample 1: Nominal
    sample_low = {
        'tilt_x': 0.5, 'tilt_y': -0.2, 'pressure': 1012.5,
        'gas_raw': 120, 'temperature': 24.5, 'humidity': 55.0,
        'distance_cm': 48.0, 'vib_rms': 0.04
    }
    print("\nTest 1 (Normal):", predictor.predict(sample_low))

    # Test Sample 2: Critical Tilt & Vibration
    sample_high = {
        'tilt_x': 25.0, 'tilt_y': 18.0, 'pressure': 930.0,
        'gas_raw': 850, 'temperature': 58.0, 'humidity': 94.0,
        'distance_cm': 3.2, 'vib_rms': 2.85
    }
    print("\nTest 2 (Critical):", predictor.predict(sample_high))
