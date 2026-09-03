"""
THULIR - Development & Prototype Dataset Generator
=================================================
Generates a structured development dataset for training the THULIR
Random Forest Risk Classification model.

DISCLAIMER:
This dataset is a DEVELOPMENT / PROTOTYPE dataset synthetically generated
based on physical sensor operational characteristics, physical failure modes
(tilt shifts, structural vibration, barometric pressure drop, abnormal gas levels),
and established engineering safety thresholds. It is NOT field-recorded disaster data.
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)

def generate_dataset(num_samples: int = 3000) -> pd.DataFrame:
    """
    Generate balanced dataset with 3 classes:
    - LOW_RISK (Nominal normal operational conditions)
    - MODERATE_RISK (Watch threshold crossings, minor anomalies, moderate vibration/tilt)
    - HIGH_RISK (Critical structural tilt, high vibration, extreme gas or rapid pressure drops)
    """
    samples_per_class = num_samples // 3

    # ==========================================
    # 1. LOW_RISK Samples (Normal baseline)
    # ==========================================
    tilt_x_low = np.random.normal(loc=0.0, scale=1.5, size=samples_per_class)
    tilt_y_low = np.random.normal(loc=0.0, scale=1.5, size=samples_per_class)
    pressure_low = np.random.normal(loc=1013.25, scale=8.0, size=samples_per_class)
    gas_raw_low = np.random.uniform(low=80, high=280, size=samples_per_class)
    temp_low = np.random.normal(loc=25.0, scale=4.0, size=samples_per_class)
    humidity_low = np.random.uniform(low=40.0, high=70.0, size=samples_per_class)
    dist_low = np.random.normal(loc=45.0, scale=5.0, size=samples_per_class)
    vib_low = np.random.exponential(scale=0.08, size=samples_per_class)

    low_df = pd.DataFrame({
        'tilt_x': tilt_x_low,
        'tilt_y': tilt_y_low,
        'pressure': pressure_low,
        'gas_raw': gas_raw_low,
        'temperature': temp_low,
        'humidity': humidity_low,
        'distance_cm': dist_low,
        'vib_rms': vib_low,
        'risk_label': 'LOW_RISK'
    })

    # ==========================================
    # 2. MODERATE_RISK Samples (Watch conditions)
    # ==========================================
    # Sub-modes: moderate tilt, moderate vibration, elevated gas, elevated temperature
    tilt_x_mod = np.random.choice([-1, 1], size=samples_per_class) * np.random.uniform(5.0, 14.0, size=samples_per_class)
    tilt_y_mod = np.random.normal(loc=2.0, scale=4.0, size=samples_per_class)
    pressure_mod = np.random.normal(loc=975.0, scale=10.0, size=samples_per_class)
    gas_raw_mod = np.random.uniform(low=380, high=650, size=samples_per_class)
    temp_mod = np.random.uniform(low=38.0, high=48.0, size=samples_per_class)
    humidity_mod = np.random.uniform(low=78.0, high=88.0, size=samples_per_class)
    dist_mod = np.random.uniform(low=5.5, high=12.0, size=samples_per_class)
    vib_mod = np.random.uniform(low=0.50, high=1.40, size=samples_per_class)

    mod_df = pd.DataFrame({
        'tilt_x': tilt_x_mod,
        'tilt_y': tilt_y_mod,
        'pressure': pressure_mod,
        'gas_raw': gas_raw_mod,
        'temperature': temp_mod,
        'humidity': humidity_mod,
        'distance_cm': dist_mod,
        'vib_rms': vib_mod,
        'risk_label': 'MODERATE_RISK'
    })

    # ==========================================
    # 3. HIGH_RISK Samples (Critical violations)
    # ==========================================
    tilt_x_high = np.random.choice([-1, 1], size=samples_per_class) * np.random.uniform(15.0, 45.0, size=samples_per_class)
    tilt_y_high = np.random.choice([-1, 1], size=samples_per_class) * np.random.uniform(15.0, 45.0, size=samples_per_class)
    pressure_high = np.random.uniform(low=880.0, high=945.0, size=samples_per_class)
    gas_raw_high = np.random.uniform(low=720, high=980, size=samples_per_class)
    temp_high = np.random.uniform(low=52.0, high=75.0, size=samples_per_class)
    humidity_high = np.random.uniform(low=91.0, high=99.0, size=samples_per_class)
    dist_high = np.random.uniform(low=0.5, high=4.5, size=samples_per_class)
    vib_high = np.random.uniform(low=1.60, high=6.50, size=samples_per_class)

    high_df = pd.DataFrame({
        'tilt_x': tilt_x_high,
        'tilt_y': tilt_y_high,
        'pressure': pressure_high,
        'gas_raw': gas_raw_high,
        'temperature': temp_high,
        'humidity': humidity_high,
        'distance_cm': dist_high,
        'vib_rms': vib_high,
        'risk_label': 'HIGH_RISK'
    })

    # Combine & compute engineered feature
    df = pd.concat([low_df, mod_df, high_df], ignore_index=True)
    df['tilt_magnitude'] = np.sqrt(df['tilt_x']**2 + df['tilt_y']**2)

    # Reorder columns: 9 features + 1 target
    features_order = [
        'tilt_x', 'tilt_y', 'tilt_magnitude',
        'pressure', 'gas_raw', 'temperature',
        'humidity', 'distance_cm', 'vib_rms',
        'risk_label'
    ]
    df = df[features_order]

    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    return df

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(data_dir, 'thulir_sensor_dataset.csv')
    df = generate_dataset(num_samples=3000)
    df.to_csv(output_path, index=False)
    print(f"[DATASET] Generated {len(df)} samples saved to: {output_path}")
    print("[DATASET] Class distribution:")
    print(df['risk_label'].value_counts())
