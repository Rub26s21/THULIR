"""
THULIR - Model Evaluation Module
===============================
Calculates comprehensive evaluation metrics for THULIR risk classification.
"""

from typing import Dict, Any, List
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def evaluate_model(
    model: Any,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    target_names: List[str]
) -> Dict[str, Any]:
    """
    Compute rigorous evaluation metrics for both Train and Test splits.
    """
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)

    train_acc = float(accuracy_score(y_train, y_train_pred))
    test_acc = float(accuracy_score(y_test, y_test_pred))

    macro_precision = float(precision_score(y_test, y_test_pred, average='macro'))
    weighted_precision = float(precision_score(y_test, y_test_pred, average='weighted'))

    macro_recall = float(recall_score(y_test, y_test_pred, average='macro'))
    weighted_recall = float(recall_score(y_test, y_test_pred, average='weighted'))

    macro_f1 = float(f1_score(y_test, y_test_pred, average='macro'))
    weighted_f1 = float(f1_score(y_test, y_test_pred, average='weighted'))

    cm = confusion_matrix(y_test, y_test_pred, labels=target_names).tolist()

    # Per-class metrics
    per_class_precision = precision_score(y_test, y_test_pred, average=None, labels=target_names)
    per_class_recall = recall_score(y_test, y_test_pred, average=None, labels=target_names)
    per_class_f1 = f1_score(y_test, y_test_pred, average=None, labels=target_names)

    per_class = {}
    for i, name in enumerate(target_names):
        per_class[name] = {
            'precision': float(per_class_precision[i]),
            'recall': float(per_class_recall[i]),
            'f1_score': float(per_class_f1[i])
        }

    return {
        'training_samples': int(len(X_train)),
        'test_samples': int(len(X_test)),
        'training_accuracy': round(train_acc, 4),
        'test_accuracy': round(test_acc, 4),
        'macro_precision': round(macro_precision, 4),
        'weighted_precision': round(weighted_precision, 4),
        'macro_recall': round(macro_recall, 4),
        'weighted_recall': round(weighted_recall, 4),
        'macro_f1': round(macro_f1, 4),
        'weighted_f1': round(weighted_f1, 4),
        'per_class_metrics': per_class,
        'confusion_matrix': cm,
        'classes': target_names
    }
