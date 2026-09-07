// ============================================================
// THULIR AI — 3D Skeuomorphic A-POD Master Fusion Instrument
// ============================================================
// Central processing and evidence fusion pod for multi-node
// spatial-temporal aggregation, sensor agreement, and explainability.

import React from 'react';
import {
  Layers,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HelpCircle,
  Zap,
} from 'lucide-react';
import type { APODResult, APODNetworkState, APODEventScope } from '../services/apod/apodTypes.ts';
import type { NodeRecord } from '../types';

interface APODPanelProps {
  apod: APODResult;
  nodes: NodeRecord[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

const STATE_CONFIG: Record<
  APODNetworkState,
  { label: string; color: string; bg: string; border: string; grad: string; icon: typeof CheckCircle2 }
> = {
  NORMAL: {
    label: 'NORMAL / NOMINAL',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: '#10B981',
    grad: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
    icon: CheckCircle2,
  },
  WATCH: {
    label: 'WATCH ADVISORY',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: '#F59E0B',
    grad: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
    icon: AlertTriangle,
  },
  ELEVATED: {
    label: 'ELEVATED RISK',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: '#F97316',
    grad: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F97316 100%)',
    icon: AlertTriangle,
  },
  HIGH: {
    label: 'HIGH RISK EVENT',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: '#EF4444',
    grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 50%, #EF4444 100%)',
    icon: ShieldAlert,
  },
  CRITICAL: {
    label: 'CRITICAL HAZARD',
    color: '#DC2626',
    bg: 'rgba(220, 38, 38, 0.18)',
    border: '#DC2626',
    grad: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #EF4444 100%)',
    icon: ShieldAlert,
  },
  UNKNOWN: {
    label: 'INDETERMINATE / UNKNOWN',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: '#94A3B8',
    grad: 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748B 100%)',
    icon: HelpCircle,
  },
};

const SCOPE_LABELS: Record<APODEventScope, { label: string; desc: string }> = {
  NODE: { label: 'NODE SCOPE', desc: 'Isolated single-node strata envelope' },
  LOCALIZED: { label: 'LOCALIZED SCOPE', desc: 'Spatially bounded local sector anomaly' },
  AREA: { label: 'AREA-WIDE SCOPE', desc: 'Multi-node connected strata propagation' },
  UNKNOWN: { label: 'UNKNOWN SCOPE', desc: 'Insufficient continuous telemetry' },
};

export function APODPanel({ apod, nodes, selectedNodeId, onSelectNode }: APODPanelProps) {
  const stateCfg = STATE_CONFIG[apod.networkState] || STATE_CONFIG.UNKNOWN;
  const scopeCfg = SCOPE_LABELS[apod.eventScope] || SCOPE_LABELS.UNKNOWN;
  const StateIcon = stateCfg.icon;

  const displayScore = apod.evidenceScore !== null ? Math.round(apod.evidenceScore * 100) : null;
  const strokeDashoffset = apod.evidenceScore !== null ? 251.2 - (251.2 * apod.evidenceScore) : 251.2;

  return (
    <div
      className={`individual-overview-3d-card apod-fusion-chassis state-${apod.networkState.toLowerCase()}`}
      role="region"
      aria-label="A-POD Multi-Node Evidence Fusion Center"
      style={{ '--card-theme-color': stateCfg.color } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div className="card-top-bezel" style={{ background: stateCfg.grad }}>
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Layers size={18} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">A-POD · EVIDENCE FUSION INSTRUMENT</span>
            <span className="card-chip-sub">MULTI-NODE SPATIAL-TEMPORAL RISK AGGREGATION LAYER</span>
          </div>
        </div>

        <div className="bezel-right">
          <span className="card-hw-badge">
            {apod.contributingNodes.length} / {nodes.length} NODES CONTRIBUTING
          </span>
        </div>
      </div>

      {/* Main Fusion Architecture Grid */}
      <div className="overview-card-body">
        <div className="apod-fusion-grid">
          {/* Column 1: Node Inflow Matrix */}
          <div className="apod-col-nodes">
            <div className="col-header-tag">
              <span>INDEPENDENT NODE INFLOW</span>
              <span className="col-sub">LOCAL ML OUTPUTS</span>
            </div>

            <div className="apod-node-list">
              {nodes.map((node) => {
                const isSelected = node.node_id === selectedNodeId;
                const isContributing = apod.contributingNodes.includes(node.node_id);
                const isHigh = apod.highRiskNodes.includes(node.node_id);
                const isMod = apod.moderateRiskNodes.includes(node.node_id);
                const isUnknown = apod.unknownNodes.includes(node.node_id);

                const nodeDotColor = isHigh
                  ? '#EF4444'
                  : isMod
                  ? '#F59E0B'
                  : isUnknown
                  ? '#94A3B8'
                  : '#10B981';

                return (
                  <div
                    key={node.node_id}
                    className={`apod-node-card ${isSelected ? 'is-selected' : ''} ${
                      isContributing ? 'is-contributing' : 'is-offline'
                    }`}
                    onClick={() => onSelectNode(node.node_id)}
                    title={`Click to focus ${node.node_id}`}
                  >
                    <div className="node-card-left">
                      <span className="node-status-dot" style={{ background: nodeDotColor }} />
                      <div className="node-name-block">
                        <span className="node-id-text">{node.node_id}</span>
                        <span className="node-status-tag">
                          {isUnknown ? 'OFFLINE / UNKNOWN' : isHigh ? 'HIGH RISK' : isMod ? 'MODERATE' : 'NOMINAL'}
                        </span>
                      </div>
                    </div>

                    <div className="node-card-right">
                      <span className="node-conf-tag">
                        {node.status === 'ONLINE' ? 'LIVE' : node.status === 'DEGRADED' ? 'DEGRADED' : 'OFFLINE'}
                      </span>
                      {/* Flow particle beam indicator */}
                      <div className={`node-conduit-beam ${isContributing ? 'beam-active' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: 3D Central Fusion Core */}
          <div className="apod-col-core">
            <div className="col-header-tag center">
              <span>FUSION REACTOR CORE</span>
              <span className="col-sub">DETERMINISTIC AGGREGATION</span>
            </div>

            <div className="apod-core-reactor">
              {/* Radial Evidence Score Dial */}
              <div className="apod-dial-gauge-wrapper">
                <svg className="apod-dial-svg" viewBox="0 0 100 100">
                  <circle className="apod-dial-track" cx="50" cy="50" r="40" />
                  <circle
                    className="apod-dial-fill"
                    cx="50"
                    cy="50"
                    r="40"
                    style={{
                      stroke: stateCfg.color,
                      strokeDashoffset,
                      filter: `drop-shadow(0 0 6px ${stateCfg.color}80)`,
                    }}
                  />
                </svg>

                <div className="apod-dial-content">
                  <span className="apod-dial-score-num">
                    {displayScore !== null ? displayScore : '--'}
                  </span>
                  <span className="apod-dial-score-denom">/ 100</span>
                  <span className="apod-dial-score-label">EVIDENCE SCORE</span>
                </div>
              </div>

              {/* State & Scope Annunciator Badges */}
              <div className="apod-core-annunciators">
                <div
                  className="apod-state-badge"
                  style={{ color: stateCfg.color, background: stateCfg.bg, borderColor: stateCfg.border }}
                >
                  <StateIcon size={14} />
                  <span>{stateCfg.label}</span>
                </div>

                <div className="apod-scope-badge">
                  <span>{scopeCfg.label}</span>
                </div>

                <div className="apod-trend-badge">
                  {apod.riskTrend === 'RISING' ? (
                    <>
                      <TrendingUp size={12} color="#EF4444" />
                      <span style={{ color: '#EF4444' }}>TREND: RISING</span>
                    </>
                  ) : apod.riskTrend === 'FALLING' ? (
                    <>
                      <TrendingDown size={12} color="#10B981" />
                      <span style={{ color: '#10B981' }}>TREND: FALLING</span>
                    </>
                  ) : (
                    <>
                      <Activity size={12} color="#0284C7" />
                      <span>TREND: {apod.riskTrend}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: 4-Pillar Evidence Gauges */}
          <div className="apod-col-pillars">
            <div className="col-header-tag">
              <span>4-PILLAR EVIDENCE DECOMPOSITION</span>
              <span className="col-sub">PROTOTYPE FUSION WEIGHTS</span>
            </div>

            <div className="apod-pillars-grid">
              {/* Pillar 1: Network Risk */}
              <div className="pillar-well">
                <div className="pillar-top-row">
                  <span className="pillar-label">NETWORK RISK (R)</span>
                  <span className="pillar-weight-tag">WEIGHT 40%</span>
                </div>
                <div className="pillar-val-row">
                  <span className="pillar-val" style={{ color: apod.networkRisk !== null ? stateCfg.color : 'var(--text-dim)' }}>
                    {apod.networkRisk !== null ? (apod.networkRisk * 100).toFixed(1) : '--'}
                  </span>
                  <span className="pillar-sub">/ 100</span>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-fill"
                    style={{
                      width: `${(apod.networkRisk ?? 0) * 100}%`,
                      background: stateCfg.grad,
                    }}
                  />
                </div>
                <span className="pillar-caption">Reliability-weighted node risk</span>
              </div>

              {/* Pillar 2: Spatial Correlation */}
              <div className="pillar-well">
                <div className="pillar-top-row">
                  <span className="pillar-label">SPATIAL EVIDENCE (S)</span>
                  <span className="pillar-weight-tag">WEIGHT 20%</span>
                </div>
                <div className="pillar-val-row">
                  <span className="pillar-val" style={{ color: '#0284C7' }}>
                    {(apod.spatialCorrelation * 100).toFixed(1)}
                  </span>
                  <span className="pillar-sub">/ 100</span>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-fill"
                    style={{
                      width: `${apod.spatialCorrelation * 100}%`,
                      background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)',
                    }}
                  />
                </div>
                <span className="pillar-caption">Mesh topology cluster density</span>
              </div>

              {/* Pillar 3: Temporal Persistence */}
              <div className="pillar-well">
                <div className="pillar-top-row">
                  <span className="pillar-label">TEMPORAL EVIDENCE (T)</span>
                  <span className="pillar-weight-tag">WEIGHT 20%</span>
                </div>
                <div className="pillar-val-row">
                  <span className="pillar-val" style={{ color: '#8B5CF6' }}>
                    {(apod.temporalPersistence * 100).toFixed(1)}
                  </span>
                  <span className="pillar-sub">/ 100</span>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-fill"
                    style={{
                      width: `${apod.temporalPersistence * 100}%`,
                      background: 'linear-gradient(90deg, #6D28D9 0%, #8B5CF6 100%)',
                    }}
                  />
                </div>
                <span className="pillar-caption">Window persistence & trend slope</span>
              </div>

              {/* Pillar 4: Sensor Agreement */}
              <div className="pillar-well">
                <div className="pillar-top-row">
                  <span className="pillar-label">SENSOR AGREEMENT (M)</span>
                  <span className="pillar-weight-tag">WEIGHT 20%</span>
                </div>
                <div className="pillar-val-row">
                  <span className="pillar-val" style={{ color: '#10B981' }}>
                    {(apod.sensorAgreement * 100).toFixed(1)}
                  </span>
                  <span className="pillar-sub">/ 100</span>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-fill"
                    style={{
                      width: `${apod.sensorAgreement * 100}%`,
                      background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
                    }}
                  />
                </div>
                <span className="pillar-caption">Physical multi-sensor consensus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Explainability & Guidance */}
        <div className="apod-explain-grid">
          {/* Card 1: Deterministic Evidence Reasoning */}
          <div className="apod-explain-card reasoning-card">
            <div className="explain-header">
              <Zap size={14} color="#F59E0B" />
              <span>DETERMINISTIC EVIDENCE REASONING</span>
            </div>
            <p className="explain-text">{apod.explanation}</p>
          </div>

          {/* Card 2: Recommended Operator Procedure */}
          <div className="apod-explain-card action-card">
            <div className="action-header">
              <ShieldCheck size={14} color="#10B981" />
              <span>OPERATOR PROCEDURE</span>
            </div>
            <p className="action-text">{apod.recommendedAction}</p>
          </div>
        </div>

        {/* Physical Multi-Sensor Consensus Channel Matrix */}
        {(apod.supportingSignals.length > 0 || apod.contradictingSignals.length > 0 || apod.missingSignals.length > 0) && (
          <div className="apod-signals-section">
            <div className="signals-section-title">
              <span>PHYSICAL SENSOR CONSENSUS CHANNELS</span>
            </div>
            <div className="explain-signals-matrix">
              {apod.supportingSignals.map((sig, i) => (
                <div key={`sup-${i}`} className="signal-chip supporting">
                  <CheckCircle2 size={13} color="#10B981" className="signal-icon" />
                  <span className="signal-text">{sig}</span>
                </div>
              ))}
              {apod.contradictingSignals.map((sig, i) => (
                <div key={`con-${i}`} className="signal-chip contradicting">
                  <AlertTriangle size={13} color="#F59E0B" className="signal-icon" />
                  <span className="signal-text">{sig}</span>
                </div>
              ))}
              {apod.missingSignals.map((sig, i) => (
                <div key={`mis-${i}`} className="signal-chip missing">
                  <HelpCircle size={13} color="#94A3B8" className="signal-icon" />
                  <span className="signal-text">{sig}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Radio size={11} className="spin-slow" />
          <span>REAL-TIME MULTI-NODE FUSION CYCLES ACTIVE (5s)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={11} color="var(--text-muted)" />
          <span className="footer-clock-tag">
            CONFIDENCE: {Math.round(apod.confidence * 100)}% · DETERMINISTIC AI
          </span>
        </div>
      </div>
    </div>
  );
}
