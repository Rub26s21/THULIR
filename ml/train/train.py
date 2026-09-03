"""
THULIR - Model Training Pipeline
===============================
Trains a Random Forest Classifier for structural/environmental risk prediction.
Exports .pkl artifact, model metadata, and weights for browser/service inference.
"""

import os
import sys
import json
import shutil
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
ml_root = os.path.dirname(current_dir)
sys.path.insert(0, ml_root)

from preprocessing.preprocessor import ThulirPreprocessor, FEATURE_NAMES
from evaluation.evaluate import evaluate_model

MODEL_VERSION = "thulir-risk-rf-v1.0"
MODEL_NAME = "Random Forest Classifier"
RANDOM_SEED = 42

def export_tree(tree, classes_count):
    """Recursively export sklearn DecisionTreeClassifier tree structure to JSON-serializable dict."""
    tree_ = tree.tree_
    feature = tree_.feature.tolist()
    threshold = tree_.threshold.tolist()
    children_left = tree_.children_left.tolist()
    children_right = tree_.children_right.tolist()
    # tree_.value shape: (node_count, 1, n_classes)
    values = [val[0].tolist() for val in tree_.value]

    return {
        'feature': feature,
        'threshold': threshold,
        'children_left': children_left,
        'children_right': children_right,
        'values': values
    }

def export_random_forest_weights(rf_model, feature_names, class_names, preprocessor_medians):
    """
    Export scikit-learn RandomForestClassifier to JSON format for browser/embedded inference.
    """
    trees = [export_tree(estimator, len(class_names)) for estimator in rf_model.estimators_]
    return {
        'model_name': MODEL_NAME,
        'model_version': MODEL_VERSION,
        'n_estimators': len(trees),
        'feature_names': feature_names,
        'class_names': class_names,
        'feature_medians': preprocessor_medians,
        'trees': trees
    }

def train_pipeline():
    print("=" * 60)
    print("THULIR - RANDOM FOREST TRAINING PIPELINE")
    print("=" * 60)

    data_path = os.path.join(ml_root, 'data', 'thulir_sensor_dataset.csv')
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at: {data_path}")

    print(f"[1/6] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"      Total samples: {len(df)}, Columns: {list(df.columns)}")

    # Preprocessing
    print("[2/6] Fitting preprocessor and preparing feature matrix...")
    preprocessor = ThulirPreprocessor()
    preprocessor.fit(df)
    X = preprocessor.transform_df(df)
    y = df['risk_label'].values

    # Stratified Train/Test split
    print("[3/6] Performing 80/20 Stratified Train/Test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )
    print(f"      Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Model definition & training
    print("[4/6] Training Random Forest Classifier (n_estimators=100, max_depth=8)...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    classes_list = rf.classes_.tolist()
    print(f"      Classes detected ({len(classes_list)}): {classes_list}")

    # 5-fold cross validation on training set
    cv_scores = cross_val_score(rf, X_train, y_train, cv=5, scoring='accuracy')
    print(f"      5-Fold CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # Evaluation
    print("[5/6] Evaluating on Test split...")
    metrics = evaluate_model(rf, X_train, y_train, X_test, y_test, classes_list)
    print(f"      Train Accuracy: {metrics['training_accuracy'] * 100:.2f}%")
    print(f"      Test Accuracy : {metrics['test_accuracy'] * 100:.2f}%")
    print(f"      Macro F1-Score: {metrics['macro_f1'] * 100:.2f}%")
    print(f"      Confusion Matrix:\n      {metrics['confusion_matrix']}")

    # Save artifacts
    print("[6/6] Saving trained model artifacts & metadata...")
    models_dir = os.path.join(ml_root, 'models')
    eval_dir = os.path.join(ml_root, 'evaluation')
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(eval_dir, exist_ok=True)

    # 1. Joblib PKL
    pkl_path = os.path.join(models_dir, f"{MODEL_VERSION}.pkl")
    joblib.dump({
        'model': rf,
        'preprocessor': preprocessor,
        'feature_names': FEATURE_NAMES,
        'classes': classes_list,
        'version': MODEL_VERSION
    }, pkl_path)
    print(f"      Saved PKL model: {pkl_path}")

    # 2. Metadata JSON
    metadata = {
        'model_name': MODEL_NAME,
        'model_type': 'RandomForestClassifier',
        'model_version': MODEL_VERSION,
        'training_date': datetime.utcnow().isoformat() + 'Z',
        'feature_names': FEATURE_NAMES,
        'target_classes': classes_list,
        'training_dataset': 'thulir_sensor_dataset.csv (Development / Prototype)',
        'dataset_disclaimer': 'Trained on synthetic development dataset derived from engineering thresholds. Not field disaster data.',
        'train_samples': int(len(X_train)),
        'test_samples': int(len(X_test)),
        'hyperparameters': {
            'n_estimators': 100,
            'max_depth': 8,
            'min_samples_split': 4,
            'random_state': RANDOM_SEED
        },
        'metrics': metrics,
        'random_seed': RANDOM_SEED
    }

    meta_path = os.path.join(models_dir, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"      Saved metadata: {meta_path}")

    # 3. Evaluation report
    eval_path = os.path.join(eval_dir, 'evaluation_report.json')
    with open(eval_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"      Saved eval report: {eval_path}")

    # 4. JSON Weights for browser/service inference
    weights = export_random_forest_weights(rf, FEATURE_NAMES, classes_list, preprocessor.feature_medians)
    weights_path = os.path.join(models_dir, 'model_weights.json')
    with open(weights_path, 'w') as f:
        json.dump(weights, f)
    print(f"      Saved model weights: {weights_path}")

    # 5. Copy weights & metadata to public/models for React frontend runtime loading
    public_models_dir = os.path.join(os.path.dirname(ml_root), 'public', 'models')
    os.makedirs(public_models_dir, exist_ok=True)
    shutil.copyfile(weights_path, os.path.join(public_models_dir, 'model_weights.json'))
    shutil.copyfile(meta_path, os.path.join(public_models_dir, 'model_metadata.json'))
    print(f"      Copied model artifacts to frontend public/models/ directory")

    print("=" * 60)
    print("TRAINING PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 60)

    return rf, metadata, metrics

if __name__ == '__main__':
    train_pipeline()
