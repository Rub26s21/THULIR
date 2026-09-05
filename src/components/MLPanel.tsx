// ============================================================
// THULIR AI — AI Risk Intelligence Panel (ML Inference)
// ============================================================

import { Brain, CheckCircle2, AlertTriangle, Cpu, Clock, Hash } from 'lucide-react';
import type { MLPrediction } from '../types';

interface MLPanelProps {
  prediction: MLPrediction | null;
}

const PROB_CONFIG: Record<string, { label: string; color: string; bg: string; fill: string }> = {
  HIGH_RISK:     { label: 'High Risk',     color: 'var(--status-critical)', bg: 'var(--status-critical-bg)', fill: 'linear-gradient(90deg, #C62828 0%, #EF5350 100%)' },
  MODERATE_RISK: { label: 'Moderate Risk', color: 'var(--status-watch)',    bg: 'var(--status-watch-bg)',    fill: 'linear-gradient(90deg, #B45309 0%, #F59E0B 100%)' },
  LOW_RISK:      { label: 'Low Risk',      color: 'var(--status-normal)',   bg: 'var(--status-normal-bg)',   fill: 'linear-gradient(90deg, #0F6B57 0%, #1F9D7A 100%)' },
};

export function MLPanel({ prediction }: MLPanelProps) {
  const isFallback = prediction?.model_type === 'RULE_BASED_FALLBACK';
  const isTrained  = prediction?.model_type === 'TRAINED';
  const isInsufficient = prediction?.prediction === 'INSUFFICIENT_DATA';

  const predictionColor =
    prediction?.prediction === 'HIGH_RISK'     ? 'var(--status-critical)' :
    prediction?.prediction === 'MODERATE_RISK' ? 'var(--status-watch)' :
    prediction?.prediction === 'LOW_RISK'      ? 'var(--status-normal)' :
    'var(--text-muted)';

  const probabilities = prediction?.probabilities;

  return (
    <div className="clay-card" role="region" aria-label="ML risk prediction">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <Brain size={17} color="var(--brand-green)" strokeWidth={2} />
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            AI Risk Intelligence
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>
            Random Forest Classifier · 100 decision trees · 9-feature inference
          </div>
        </div>
      </div>

      {/* Model status banner */}
      {isInsufficient ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px',
          background: 'var(--status-critical-bg)', border: '1px solid var(--status-critical-border)',
          borderRadius: 12, marginBottom: 14, fontSize: '0.76rem', color: 'var(--status-critical)',
          fontFamily: 'var(--font-mono)',
        }}>
          <AlertTriangle size={13} />
          <span><strong>INSUFFICIENT DATA:</strong> Awaiting valid telemetry frame.</span>
        </div>
      ) : isFallback ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px',
          background: 'var(--status-watch-bg)', border: '1px solid var(--status-watch-border)',
          borderRadius: 12, marginBottom: 14, fontSize: '0.76rem', color: 'var(--status-watch)',
          fontFamily: 'var(--font-mono)',
        }}>
          <AlertTriangle size={13} />
          <span><strong>SAFETY THRESHOLD ENGINE:</strong> Deterministic heuristic rule fallback.</span>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px',
          background: 'var(--status-normal-bg)', border: '1px solid var(--status-normal-border)',
          borderRadius: 12, marginBottom: 14, fontSize: '0.76rem', color: 'var(--status-normal)',
          fontFamily: 'var(--font-mono)',
        }}>
          <CheckCircle2 size={13} />
          <span><strong>REAL ML ACTIVE:</strong> {prediction?.model_version || 'thulir-risk-rf-v1.0'}</span>
        </div>
      )}

      {/* 4-Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          {
            label: 'Source',
            value: isTrained ? 'REAL ML' : isInsufficient ? 'INSUFFICIENT' : 'FALLBACK',
            color: isTrained ? 'var(--status-normal)' : 'var(--status-watch)',
          },
          {
            label: 'Model',
            value: (prediction?.model_version || 'thulir-rf-v1.0').replace('thulir-risk-', ''),
            color: 'var(--text-primary)',
          },
          {
            label: 'Prediction',
            value: (prediction?.prediction || 'N/A').replace('_', ' '),
            color: predictionColor,
          },
          {
            label: isFallback ? 'Score' : 'Confidence',
            value: prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A',
            color: 'var(--brand-blue)',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="clay-well">
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.07em', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Class Probability Distribution */}
      {probabilities && !isInsufficient && (
        <div>
          <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10 }}>
            Class Probability Distribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {Object.entries(probabilities).map(([cls, prob]) => {
              const cfg = PROB_CONFIG[cls] || PROB_CONFIG['LOW_RISK'];
              const pct = (prob * 100).toFixed(1);
              const isMax = cls === prediction?.prediction;
              return (
                <div key={cls}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.74rem', fontWeight: isMax ? 700 : 500 }}>
                    <span style={{ color: isMax ? cfg.color : 'var(--text-muted)' }}>{cfg.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: isMax ? cfg.color : 'var(--text-dim)' }}>{pct}%</span>
                  </div>
                  <div className="ml-probability-bar">
                    <div
                      className="ml-probability-fill"
                      style={{ width: `${pct}%`, background: cfg.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traceability Footer */}
      {prediction && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
          marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.7rem', color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Cpu size={11} color="var(--brand-green)" />
            Node: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginLeft: 3 }}>{prediction.node_id}</strong>
          </div>
          {prediction.event_id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Hash size={11} color="var(--brand-green)" />
              <code style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{prediction.event_id}</code>
            </div>
          )}
          {prediction.sensor_timestamp && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} color="var(--brand-green)" />
              {new Date(prediction.sensor_timestamp).toLocaleTimeString()}
            </div>
          )}
          {prediction.inference_time_ms !== undefined && (
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {prediction.inference_time_ms}ms inference
            </div>
          )}
        </div>
      )}
    </div>
  );
}
