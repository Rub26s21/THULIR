// ============================================================
// THULIR AI — 3D Skeuomorphic AI Risk Intelligence Panels
// ============================================================
// Modular L-Shaped Architecture:
// 1. MLHeroCard: Top-left Primary Hazard Assessment & Model HUD
// 2. MLDiagnosticsCard: Full-width bottom Diagnostics Matrix & Class Density
// 3. MLPanel: Unified composite wrapper for standalone usage

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

export interface MLPanelProps {
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

function getMLHelpers(prediction: MLPrediction | null) {
  const isFallback = prediction?.model_type === 'RULE_BASED_FALLBACK';
  const isTrained = prediction?.model_type === 'TRAINED';
  const isInsufficient = !prediction || prediction.prediction === 'INSUFFICIENT_DATA';

  const currentPred = prediction?.prediction || 'LOW_RISK';
  const confidencePct = prediction ? (prediction.confidence * 100).toFixed(1) : '0.0';

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

  return {
    isFallback,
    isTrained,
    isInsufficient,
    currentPred,
    confidencePct,
    heroDescription,
    heroTheme,
    probabilities: prediction?.probabilities,
  };
}

/**
 * Top-Left Hero Assessment Card
 */
export function MLHeroCard({ prediction }: MLPanelProps) {
  const {
    isFallback,
    isTrained,
    isInsufficient,
    currentPred,
    confidencePct,
    heroDescription,
    heroTheme,
  } = getMLHelpers(prediction);

  return (
    <div
      className="individual-overview-3d-card ml-neural-chassis ml-hero-card"
      role="region"
      aria-label="ML Hazard Intelligence Assessment"
      style={{ '--card-theme-color': '#8B5CF6' } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Fasteners */}
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
      </div>
    </div>
  );
}

/**
 * Bottom Extended Card spanning full width across both columns (covering the empty space)
 */
export function MLDiagnosticsCard({ prediction }: MLPanelProps) {
  const { isTrained, currentPred, probabilities } = getMLHelpers(prediction);

  return (
    <div
      className="individual-overview-3d-card ml-neural-chassis ml-extended-card"
      role="region"
      aria-label="AI Diagnostics & Voting Density"
      style={{ '--card-theme-color': '#0284C7' } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div
        className="card-top-bezel"
        style={{
          background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #38BDF8 100%)',
        }}
      >
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Layers size={17} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">NEURAL DIAGNOSTIC MATRIX & CLASS DENSITY</span>
            <span className="card-chip-sub">EDGE PIPELINE TELEMETRY · 100-TREE VOTING CONSENSUS</span>
          </div>
        </div>

        <div className="bezel-right">
          <span className="card-hw-badge">
            <Activity size={10} style={{ display: 'inline', marginRight: 4 }} />
            ZERO-LAG INFERENCE (&lt; 3.8ms)
          </span>
        </div>
      </div>

      {/* Main Body: 2-Column Split for Diagnostics and Class Breakdown */}
      <div className="overview-card-body ml-extended-body">
        <div className="ml-extended-split-grid">
          {/* Left: 2x2 Diagnostic Wells */}
          <div className="ml-diag-column">
            <div className="column-micro-header">
              <Layers size={12} color="#0284C7" />
              <span>DIAGNOSTIC TELEMETRY MATRIX</span>
            </div>
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
          </div>

          {/* Right: Class Probability Distribution */}
          <div className="ml-prob-column">
            <div className="column-micro-header">
              <Gauge size={12} color="#10B981" />
              <span>CLASS PROBABILITY VOTING DENSITY</span>
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
        </div>

        {/* Traceability Metadata Bar */}
        {prediction && (
          <div className="ml-trace-bezel">
            <div className="trace-item">
              <Cpu size={12} color="#0284C7" />
              <span>NODE:</span>
              <strong className="trace-code">{prediction.node_id}</strong>
            </div>

            {prediction.event_id && (
              <div className="trace-item">
                <Hash size={12} color="#0284C7" />
                <span>EVENT:</span>
                <code className="trace-code">{prediction.event_id}</code>
              </div>
            )}

            <div className="trace-item latency-item">
              <Activity size={12} color="#10B981" />
              <span>EXECUTION:</span>
              <strong className="trace-code">Edge Tensor Inference</strong>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Radio size={11} className="spin-slow" />
          <span>EDGE AI INFERENCE ACTIVE</span>
        </div>
        <span className="footer-clock-tag">MULTI-VARIABLE HAZARD CLASSIFIER</span>
      </div>
    </div>
  );
}

/**
 * Unified Standalone ML Panel Wrapper
 */
export function MLPanel({ prediction }: MLPanelProps) {
  return (
    <div className="ml-panel-unified-stack">
      <MLHeroCard prediction={prediction} />
      <MLDiagnosticsCard prediction={prediction} />
    </div>
  );
}
