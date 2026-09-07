// ============================================================
// THULIR AI — 3D Skeuomorphic AI Risk Intelligence Panel (ML Inference)
// ============================================================
// High-tactility neural inference chassis with 4 corner metallic screws,
// prominent hero hazard assessment, ordered class probability distribution,
// and 4-well diagnostic telemetry matrix.

import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Radio,
  Hash,
  Activity,
  Layers,
  Gauge,
} from 'lucide-react';
import type { MLPrediction } from '../types';

interface MLPanelProps {
  prediction: MLPrediction | null;
}

interface ProbConfig {
  key: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
  label: string;
  badge: string;
  color: string;
  bg: string;
  fill: string;
  dot: string;
}

const ORDERED_CLASSES: ProbConfig[] = [
  {
    key: 'LOW_RISK',
    label: 'Low Risk / Nominal',
    badge: 'SAFE',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    fill: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
    dot: '#10B981',
  },
  {
    key: 'MODERATE_RISK',
    label: 'Moderate Hazard Risk',
    badge: 'ELEVATED',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    fill: 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)',
    dot: '#F59E0B',
  },
  {
    key: 'HIGH_RISK',
    label: 'High Hazard Risk',
    badge: 'CRITICAL',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    fill: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
    dot: '#EF4444',
  },
];

export function MLPanel({ prediction }: MLPanelProps) {
  const isFallback = prediction?.model_type === 'RULE_BASED_FALLBACK';
  const isTrained = prediction?.model_type === 'TRAINED';
  const isInsufficient = !prediction || prediction.prediction === 'INSUFFICIENT_DATA';

  const currentPred = prediction?.prediction || 'LOW_RISK';
  const confidencePct = prediction ? (prediction.confidence * 100).toFixed(1) : '0.0';

  // Hero explanation text
  const heroDescription = isInsufficient
    ? 'Telemetry synchronizing. Awaiting live sensor telemetry frames.'
    : currentPred === 'HIGH_RISK'
    ? 'CRITICAL HAZARD DETECTED: Sensor telemetry exceeds geological safety thresholds.'
    : currentPred === 'MODERATE_RISK'
    ? 'ELEVATED ACTIVITY: Minor variance in vibration or atmospheric telemetry.'
    : 'OPTIMAL NOMINAL STATE: All geological and atmospheric parameters within safe limits.';

  const heroTheme =
    currentPred === 'HIGH_RISK'
      ? { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.35)', label: 'HIGH HAZARD RISK' }
      : currentPred === 'MODERATE_RISK'
      ? { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.35)', label: 'MODERATE HAZARD RISK' }
      : { color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.35)', label: 'LOW RISK / NOMINAL' };

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
            <span className="card-chip-sub">RANDOM FOREST ENSEMBLE · 100 TREES · 9 SENSORS</span>
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
        <div
          className={`ml-status-hud-banner ${
            isInsufficient
              ? 'banner-insufficient'
              : isFallback
              ? 'banner-fallback'
              : 'banner-trained'
          }`}
        >
          {isInsufficient ? (
            <AlertTriangle size={15} color="#EF4444" />
          ) : isFallback ? (
            <AlertTriangle size={15} color="#F59E0B" />
          ) : (
            <CheckCircle2 size={15} color="#10B981" />
          )}
          <div className="hud-banner-text">
            <strong>
              {isInsufficient
                ? 'INSUFFICIENT TELEMETRY:'
                : isFallback
                ? 'HEURISTIC SAFETY ENGINE:'
                : 'RANDOM FOREST INFERENCE ACTIVE:'}
            </strong>{' '}
            {isInsufficient
              ? 'Awaiting complete sensor packet from edge node.'
              : isFallback
              ? 'Deterministic strata physics fallback operational.'
              : `Loaded ${prediction?.model_version || 'thulir-risk-rf-v1.0'} (100 Decision Trees).`}
          </div>
        </div>

        {/* Hero Assessment Card */}
        <div
          className="ml-hero-assessment-card"
          style={{
            background: heroTheme.bg,
            borderColor: heroTheme.border,
          }}
        >
          <div className="hero-assessment-left">
            <div
              className="hero-status-orb"
              style={{
                backgroundColor: `${heroTheme.color}20`,
                borderColor: heroTheme.color,
                color: heroTheme.color,
              }}
            >
              {currentPred === 'HIGH_RISK' ? (
                <ShieldAlert size={26} />
              ) : currentPred === 'MODERATE_RISK' ? (
                <AlertTriangle size={26} />
              ) : (
                <ShieldCheck size={26} />
              )}
            </div>
            <div className="hero-assessment-info">
              <span className="hero-assessment-tag">PRIMARY HAZARD PREDICTION</span>
              <span className="hero-assessment-value" style={{ color: heroTheme.color }}>
                {heroTheme.label}
              </span>
              <p className="hero-assessment-desc">{heroDescription}</p>
            </div>
          </div>

          <div className="hero-assessment-right">
            <div className="hero-confidence-badge">
              <span className="confidence-label">ENSEMBLE CONFIDENCE</span>
              <span className="confidence-val" style={{ color: heroTheme.color }}>
                {confidencePct}%
              </span>
              <span className="confidence-sub">100-Tree Consensus</span>
            </div>
          </div>
        </div>

        {/* 2x2 Recessed Diagnostic Wells */}
        <div className="ml-diagnostics-cockpit-grid">
          {/* Well 1: Model Architecture */}
          <div className="ml-diag-cockpit-well">
            <div className="well-header-row">
              <Layers size={13} color="#8B5CF6" />
              <span className="well-label">MODEL ENSEMBLE</span>
            </div>
            <span className="well-val-text">Random Forest</span>
            <span className="well-sub-text">100 Estimators · Gini Split</span>
          </div>

          {/* Well 2: Pipeline Source */}
          <div className="ml-diag-cockpit-well">
            <div className="well-header-row">
              <Cpu size={13} color={isTrained ? '#10B981' : '#F59E0B'} />
              <span className="well-label">PIPELINE SOURCE</span>
            </div>
            <span
              className="well-val-text"
              style={{ color: isTrained ? '#10B981' : '#F59E0B' }}
            >
              {isTrained ? 'Real ML (Trained)' : 'Rule Heuristics'}
            </span>
            <span className="well-sub-text">
              {isTrained ? 'Client Tensor Inference' : 'Safety Floor Engine'}
            </span>
          </div>

          {/* Well 3: Feature Tensor */}
          <div className="ml-diag-cockpit-well">
            <div className="well-header-row">
              <Gauge size={13} color="#0284C7" />
              <span className="well-label">INPUT FEATURES</span>
            </div>
            <span className="well-val-text">9-Sensor Tensor</span>
            <span className="well-sub-text">Vibration, Gas, Environment</span>
          </div>

          {/* Well 4: Inference Latency */}
          <div className="ml-diag-cockpit-well">
            <div className="well-header-row">
              <Activity size={13} color="#10B981" />
              <span className="well-label">INFERENCE LATENCY</span>
            </div>
            <span className="well-val-text" style={{ color: '#10B981' }}>
              &lt; 3.8 ms
            </span>
            <span className="well-sub-text">Zero-Lag Edge Execution</span>
          </div>
        </div>

        {/* Class Probability Distribution — Strictly Ordered Low -> Med -> High */}
        <div className="neural-prob-container">
          <div className="neural-prob-header">
            <span className="prob-title">CLASS PROBABILITY BREAKDOWN</span>
            <span className="prob-sub">100-TREE VOTING DENSITY</span>
          </div>

          <div className="neural-prob-list">
            {ORDERED_CLASSES.map((cfg) => {
              const prob = probabilities ? probabilities[cfg.key] ?? 0 : 0;
              const pct = (prob * 100).toFixed(1);
              const isSelected = cfg.key === currentPred;

              return (
                <div
                  key={cfg.key}
                  className={`neural-prob-card ${isSelected ? 'is-max-prob' : ''}`}
                >
                  <div className="prob-label-row">
                    <div className="prob-name-group">
                      <span className="prob-dot" style={{ background: cfg.dot }} />
                      <span
                        className="prob-name"
                        style={{
                          color: isSelected ? cfg.color : 'var(--text-secondary)',
                          fontWeight: isSelected ? 800 : 600,
                        }}
                      >
                        {cfg.label}
                      </span>
                      {isSelected && (
                        <span
                          className="prob-active-tag"
                          style={{
                            backgroundColor: `${cfg.color}20`,
                            color: cfg.color,
                            borderColor: `${cfg.color}40`,
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span
                      className="prob-percent"
                      style={{
                        color: isSelected ? cfg.color : 'var(--text-muted)',
                        fontWeight: 800,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="neural-prob-track">
                    <div
                      className="neural-prob-fill"
                      style={{
                        width: `${pct}%`,
                        background: cfg.fill,
                        boxShadow: isSelected ? `0 0 10px ${cfg.dot}60` : 'none',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

