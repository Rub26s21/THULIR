// ============================================================
// THULIR - Ultra-Premium Chromatic AI / ML Risk Analysis Panel
// ============================================================

import { Brain, CheckCircle2, AlertTriangle, Cpu, Clock, Hash } from 'lucide-react';
import type { MLPrediction } from '../types';

interface MLPanelProps {
  prediction: MLPrediction | null;
}

export function MLPanel({ prediction }: MLPanelProps) {
  const isFallback = prediction?.model_type === 'RULE_BASED_FALLBACK';
  const isTrained = prediction?.model_type === 'TRAINED';
  const isInsufficient = prediction?.prediction === 'INSUFFICIENT_DATA';

  const predictionColor = prediction?.prediction === 'HIGH_RISK'
    ? 'var(--status-critical)'
    : prediction?.prediction === 'MODERATE_RISK'
    ? 'var(--status-watch)'
    : prediction?.prediction === 'LOW_RISK'
    ? 'var(--status-normal)'
    : 'var(--text-muted)';

  const probabilities = prediction?.probabilities;

  return (
    <div className="skeuo-card" role="region" aria-label="ML risk prediction">
      {/* Top Banner */}
      {isInsufficient ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--status-critical-bg)', border: '1px solid var(--status-critical-border)', borderRadius: 10, marginBottom: 14, fontSize: '0.76rem', color: 'var(--status-critical)' }}>
          <AlertTriangle size={14} />
          <span><strong>INSUFFICIENT SENSOR DATA:</strong> All telemetry channels unavailable. Cannot produce valid ML prediction.</span>
        </div>
      ) : isFallback ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--status-watch-bg)', border: '1px solid var(--status-watch-border)', borderRadius: 10, marginBottom: 14, fontSize: '0.76rem', color: 'var(--status-watch)' }}>
          <AlertTriangle size={14} />
          <span><strong>RULE-BASED SAFETY FALLBACK:</strong> Executing deterministic safety threshold checks.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--status-normal-bg)', border: '1px solid var(--status-normal-border)', borderRadius: 10, marginBottom: 14, fontSize: '0.76rem', color: 'var(--status-normal)' }}>
          <CheckCircle2 size={14} />
          <span><strong>REAL ML ACTIVE:</strong> Random Forest Classifier (<code>{prediction?.model_version || 'thulir-risk-rf-v1.0'}</code>) executing live 9-feature inference.</span>
        </div>
      )}

      {/* 4x2 Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <div className="skeuo-well">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Source</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isTrained ? 'var(--status-normal)' : 'var(--status-watch)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Brain size={14} />
            {isTrained ? 'REAL ML' : isInsufficient ? 'INSUFFICIENT' : 'FALLBACK'}
          </div>
        </div>

        <div className="skeuo-well">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Model Version</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'JetBrains Mono, monospace' }}>
            {prediction?.model_version || 'thulir-risk-rf-v1.0'}
          </div>
        </div>

        <div className="skeuo-well">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Prediction</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: predictionColor, marginTop: 2 }}>
            {prediction?.prediction || 'N/A'}
          </div>
        </div>

        <div className="skeuo-well">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {isFallback ? 'Heuristic Score' : 'Confidence'}
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
            {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Class Probability Distribution Breakdown with Jewel Gradients */}
      {probabilities && !isInsufficient && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Class Probability Distribution (100 Decision Trees)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(probabilities).map(([cls, prob]) => {
              const pPercent = (prob * 100).toFixed(1);
              const isMax = cls === prediction?.prediction;

              const gradient = cls === 'HIGH_RISK'
                ? 'linear-gradient(90deg, #ef4444 0%, #ec4899 100%)'
                : cls === 'MODERATE_RISK'
                ? 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)'
                : 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)';

              const color = cls === 'HIGH_RISK'
                ? 'var(--status-critical)'
                : cls === 'MODERATE_RISK'
                ? 'var(--status-watch)'
                : 'var(--status-normal)';

              return (
                <div key={cls} className="skeuo-well" style={{ border: isMax ? `1px solid ${color}` : undefined, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: isMax ? color : 'var(--text-muted)', fontWeight: isMax ? 800 : 600 }}>
                    <span>{cls}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: 'var(--border-well)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pPercent}%`, height: '100%', background: gradient, borderRadius: 3, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sensor Traceability Bar */}
      {prediction && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Cpu size={12} color="var(--accent-cyan)" />
            <span>Node: <strong style={{ color: 'var(--text-primary)' }}>{prediction.node_id}</strong></span>
          </div>
          {prediction.event_id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Hash size={12} color="var(--accent-cyan)" />
              <span>Event: <code style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{prediction.event_id}</code></span>
            </div>
          )}
          {prediction.sensor_timestamp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} color="var(--accent-cyan)" />
              <span>Sensor Time: <strong style={{ color: 'var(--text-primary)' }}>{new Date(prediction.sensor_timestamp).toLocaleTimeString()}</strong></span>
            </div>
          )}
          {prediction.inference_time_ms !== undefined && (
            <div style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Inference: {prediction.inference_time_ms}ms
            </div>
          )}
        </div>
      )}

      {/* Dataset Disclaimer */}
      <div style={{ marginTop: 8, fontSize: '0.66rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
        * Note: Model trained on development/prototype dataset derived from structural &amp; environmental safety thresholds.
      </div>
    </div>
  );
}
