"""
THULIR - ML Feature Preprocessor
===============================
Standardized preprocessing pipeline for THULIR sensor features.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union

FEATURE_NAMES = [
    'tilt_x',
    'tilt_y',
    'tilt_magnitude',
    'pressure',
    'gas_raw',
    'temperature',
    'humidity',
    'distance_cm',
    'vib_rms'
]

# Default median values for imputation if a sensor fails
DEFAULT_MEDIANS = {
    'tilt_x': 0.0,
    'tilt_y': 0.0,
    'tilt_magnitude': 0.0,
    'pressure': 1013.25,
    'gas_raw': 150.0,
    'temperature': 25.0,
    'humidity': 55.0,
    'distance_cm': 50.0,
    'vib_rms': 0.05
}

class ThulirPreprocessor:
    def __init__(self, feature_medians: Optional[Dict[str, float]] = None):
        self.feature_names = list(FEATURE_NAMES)
        self.feature_medians = feature_medians or dict(DEFAULT_MEDIANS)

    def fit(self, X: pd.DataFrame):
        """Compute feature medians from training dataset."""
        for feat in self.feature_names:
            if feat in X.columns:
                self.feature_medians[feat] = float(X[feat].median())
        return self

    def transform_single(self, sensor_dict: Dict[str, Optional[float]]) -> np.ndarray:
        """
        Transform a single sensor record dictionary into an aligned feature vector.
        Computes tilt_magnitude if missing and applies imputation.
        """
        # Ensure tilt magnitude
        tilt_x = sensor_dict.get('tilt_x')
        tilt_y = sensor_dict.get('tilt_y')
        tilt_mag = sensor_dict.get('tilt_magnitude')

        if tilt_mag is None:
            if tilt_x is not None and tilt_y is not None:
                tilt_mag = float(np.sqrt(tilt_x**2 + tilt_y**2))
            else:
                tilt_mag = self.feature_medians['tilt_magnitude']

        values = []
        for feat in self.feature_names:
            if feat == 'tilt_magnitude':
                val = tilt_mag
            else:
                val = sensor_dict.get(feat)

            if val is None or not np.isfinite(val):
                val = self.feature_medians.get(feat, 0.0)

            values.append(float(val))

        return np.array(values, dtype=np.float64).reshape(1, -1)

    def transform_df(self, df: pd.DataFrame) -> np.ndarray:
        """Transform a DataFrame of raw features."""
        X = df.copy()
        if 'tilt_magnitude' not in X.columns:
            X['tilt_magnitude'] = np.sqrt(X['tilt_x']**2 + X['tilt_y']**2)

        # Impute missing
        for feat in self.feature_names:
            if feat in X.columns:
                X[feat] = X[feat].fillna(self.feature_medians.get(feat, 0.0))
            else:
                X[feat] = self.feature_medians.get(feat, 0.0)

        return X[self.feature_names].values.astype(np.float64)
