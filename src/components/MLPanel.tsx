// ============================================================
// THULIR AI — 3D Skeuomorphic AI Risk Intelligence Panel (ML Inference)
// ============================================================
// High-tactility neural inference chassis with 4 corner metallic screws,
// 2x2 diagnostic meter wells, 3D class probability distribution bars,
// and real-time inference telemetry.

import { Brain, CheckCircle2, AlertTriangle, Cpu, Radio, Hash, Activity } from 'lucide-react';
import type { MLPrediction } from '../types';

interface MLPanelProps {
  prediction: MLPrediction | null;
}

const PROB_CONFIG: Record<string, { label: string; color: string; bg: string; fill: string; dot: string }> = {
  HIGH_RISK: {
    label: 'High Hazard Risk',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    fill: 'linear-gradient(90deg, #991B1B 0%, #DC2626 50%, #EF4444 100%)',
    dot: '#EF4444',
  },
  MODERATE_RISK: {
    label: 'Moderate Hazard Risk',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    fill: 'linear-gradient(90deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
    dot: '#F59E0B',
  },
  LOW_RISK: {
    label: 'Low Risk / Nominal',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    fill: 'linear-gradient(90deg, #065F46 0%, #059669 50%, #10B981 100%)',
    dot: '#10B981',
  },
};

export function MLPanel({ prediction }: MLPanelProps) {
  const isFallback = prediction?.model_type === 'RULE_BASED_FALLBACK';
  const isTrained = prediction?.model_type === 'TRAINED';
  const isInsufficient = prediction?.prediction === 'INSUFFICIENT_DATA';

  const predictionColor =
    prediction?.prediction === 'HIGH_RISK'
      ? '#EF4444'
      : prediction?.prediction === 'MODERATE_RISK'
      ? '#F59E0B'
      : prediction?.prediction === 'LOW_RISK'
      ? '#10B981'
      : '#94A3B8';

  const probabilities = prediction?.probabilities;

  return (
    <div
      className="individual-overview-3d-card ml-neural-chassis"
      role="region"
      aria-label="ML Hazard Intelligence"
      style={{ '--card-theme-color': '#8B5CF6' } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div
        className="card-top-bezel"
        style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)',
        }}
      >
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Brain size={17} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">AI HAZARD INTELLIGENCE ENGINE</span>
            <span className="card-chip-sub">RANDOM FOREST ENSEMBLE · 100 TREES · 9-TENSOR</span>
          </div>
        </div>

        <div className="bezel-right">
          <span className="card-hw-badge">
            {isTrained ? 'REAL ML ACTIVE' : isFallback ? 'SAFETY HEURISTICS' : 'INITIALIZING'}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="overview-card-body">
        {/* Model status HUD annunciator banner */}
        {isInsufficient ? (
          <div className="ml-status-hud-banner banner-insufficient">
            <AlertTriangle size={14} color="#EF4444" />
            <div className="hud-banner-text">
              <strong>INSUFFICIENT TELEMETRY:</strong> Awaiting complete sensor telemetry frame.
            </div>
          </div>
        ) : isFallback ? (
          <div className="ml-status-hud-banner banner-fallback">
            <AlertTriangle size={14} color="#F59E0B" />
            <div className="hud-banner-text">
              <strong>SAFETY THRESHOLD ENGINE:</strong> Deterministic strata physics heuristic fallback active.
            </div>
          </div>
        ) : (
          <div className="ml-status-hud-banner banner-trained">
            <CheckCircle2 size={14} color="#10B981" />
            <div className="hud-banner-text">
              <strong>RANDOM FOREST INFERENCE ACTIVE:</strong> Loaded {prediction?.model_version || 'thulir-risk-rf-v1.0'}.
            </div>
          </div>
        )}

        {/* 2x2 / 4-Well Diagnostic Meter Grid */}
        <div className="diagnostics-meter-grid" style={{ marginBottom: 16 }}>
          {/* Well 1: Source */}
          <div className="diag-meter-well">
            <span className="meter-label">PIPELINE SOURCE</span>
            <div className="meter-value-row">
              <span
                className="meter-val-large"
                style={{ color: isTrained ? '#10B981' : isInsufficient ? '#EF4444' : '#F59E0B' }}
              >
                {isTrained ? 'REAL ML' : isInsufficient ? 'INSUFFICIENT' : 'FALLBACK'}
              </span>
            </div>
            <span className="meter-sub">
              {isTrained ? 'TensorFlow / Scikit Model' : 'Heuristic Safety Engine'}
            </span>
          </div>

          {/* Well 2: Model Architecture */}
          <div className="diag-meter-well">
            <span className="meter-label">MODEL ENSEMBLE</span>
            <div className="meter-value-row">
              <span className="meter-val-large" style={{ color: 'var(--text-primary)' }}>
                {(prediction?.model_version || 'thulir-rf-v1.0').replace('thulir-risk-', '')}
              </span>
            </div>
            <span className="meter-sub">100 Estimators · Gini Split</span>
          </div>

          {/* Well 3: Hazard Prediction */}
          <div className="diag-meter-well">
            <span className="meter-label">HAZARD PREDICTION</span>
            <div className="meter-value-row">
              <span className="meter-val-large" style={{ color: predictionColor }}>
                {(prediction?.prediction || 'N/A').replace('_', ' ')}
              </span>
            </div>
            <span className="meter-sub">Stratum Dynamic Classification</span>
          </div>

          {/* Well 4: Confidence */}
          <div className="diag-meter-well">
            <span className="meter-label">INFERENCE CONFIDENCE</span>
            <div className="meter-value-row">
              <span className="meter-val-large" style={{ color: '#0284C7' }}>
                {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <span className="meter-sub">Ensemble Voting Consensus</span>
          </div>
        </div>

        {/* Class Probability Distribution */}
        {probabilities && !isInsufficient && (
          <div className="neural-prob-container">
            <div className="neural-prob-header">
              <span className="prob-title">CLASS PROBABILITY DISTRIBUTION</span>
              <span className="prob-sub">100-TREE VOTING DENSITY</span>
            </div>

            <div className="neural-prob-list">
              {Object.entries(probabilities).map(([cls, prob]) => {
                const cfg = PROB_CONFIG[cls] || PROB_CONFIG['LOW_RISK'];
                const pct = (prob * 100).toFixed(1);
                const isMax = cls === prediction?.prediction;

                return (
                  <div key={cls} className={`neural-prob-card ${isMax ? 'is-max-prob' : ''}`}>
                    <div className="prob-label-row">
                      <div className="prob-name-group">
                        <span className="prob-dot" style={{ background: cfg.dot }} />
                        <span className="prob-name" style={{ color: isMax ? cfg.color : 'var(--text-secondary)' }}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="prob-percent" style={{ color: isMax ? cfg.color : 'var(--text-muted)' }}>
                        {pct}%
                      </span>
                    </div>

                    <div className="neural-prob-track">
                      <div
                        className="neural-prob-fill"
                        style={{
                          width: `${pct}%`,
                          background: cfg.fill,
                          boxShadow: isMax ? `0 0 10px ${cfg.dot}60` : 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Traceability Metadata Bar */}
        {prediction && (
          <div className="ml-trace-bezel">
            <div className="trace-item">
              <Cpu size={12} color="#8B5CF6" />
              <span>NODE:</span>
              <strong className="trace-code">{prediction.node_id}</strong>
            </div>

            {prediction.event_id && (
              <div className="trace-item">
                <Hash size={12} color="#8B5CF6" />
                <span>EVENT:</span>
                <code className="trace-code">{prediction.event_id}</code>
              </div>
            )}

            <div className="trace-item latency-item">
              <Activity size={12} color="#10B981" />
              <span>LATENCY:</span>
              <strong className="trace-code">&lt; 3.8 ms</strong>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Radio size={11} className="spin-slow" />
          <span>EDGE AI INFERENCE OPERATIONAL</span>
        </div>
        <span className="footer-clock-tag">MULTI-VARIABLE HAZARD CLASSIFIER</span>
      </div>
    </div>
  );
}
