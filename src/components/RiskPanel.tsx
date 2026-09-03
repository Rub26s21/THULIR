// ============================================================
// THULIR - Ultra-Premium Chromatic Risk Assessment Panel
// ============================================================

import { ShieldAlert, ShieldCheck, AlertTriangle, Brain, Activity } from 'lucide-react';
import type { RiskState } from '../types';

interface RiskPanelProps {
  risk: RiskState;
}

export function RiskPanel({ risk }: RiskPanelProps) {
  const { level, score, reasons, source, confidence, triggeredSensors } = risk;

  const gradientId = `risk-grad-${level}`;

  const circumference = 2 * Math.PI * 30; // r = 30
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="skeuo-card risk-hero-card" role="region" aria-label="Current structural risk assessment">
      <div className="risk-hero-main">
        <div className="risk-level-display">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Overall Structural Integrity
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '1px 6px',
                borderRadius: 4,
                fontWeight: 700,
                color: source === 'COMBINED' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                background: 'var(--border-subtle)',
                border: '1px solid var(--border-glass)',
              }}
            >
              {source === 'COMBINED' ? 'FUSED (RULES + AI)' : source === 'ML' ? 'AI INFERENCE' : 'SAFETY RULES'}
            </span>
          </div>

          <div className={`risk-level-headline level-${level}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            {level === 'CRITICAL' && <ShieldAlert size={28} color="var(--status-critical)" />}
            {level === 'WATCH' && <AlertTriangle size={28} color="var(--status-watch)" />}
            {level === 'NORMAL' && <ShieldCheck size={28} color="var(--status-normal)" />}
            {level === 'NORMAL' ? 'LOW RISK' : level === 'WATCH' ? 'MODERATE RISK' : 'HIGH RISK'}
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {level === 'NORMAL'
              ? 'All physical sensors & AI risk parameters nominal'
              : `${reasons.length} active risk factor${reasons.length > 1 ? 's' : ''} detected across telemetry streams`}
          </span>

          {triggeredSensors && triggeredSensors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {triggeredSensors.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.64rem',
                    padding: '1px 7px',
                    borderRadius: 10,
                    background: 'var(--border-well)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chromatic Liquid Metallic Bezel Gauge */}
        <div className="risk-gauge-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="risk-gauge-bezel">
            <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="risk-grad-NORMAL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="risk-grad-WATCH" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="risk-grad-CRITICAL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle
                cx="38"
                cy="38"
                r="30"
                fill="none"
                stroke="var(--border-well)"
                strokeWidth="6.5"
              />
              <circle
                cx="38"
                cy="38"
                r="30"
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="6.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div className="risk-score-value">{score}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Risk Index</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{score} / 100</span>
            {confidence < 1.0 && (
              <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                AI Conf: {(confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Contributing Factors Breakdown */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>
          Main Contributing Factors
        </div>
        {reasons.length === 0 ? (
          <div className="skeuo-well" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            ✓ No abnormal physical stresses or ML anomalies detected across structural axes.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {reasons.map((r, idx) => (
              <div
                key={idx}
                className="skeuo-well"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.76rem',
                  borderLeft: `3px solid ${r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)'}`,
                  padding: '8px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {r.source === 'ML' ? (
                    <Brain size={13} color="var(--accent)" />
                  ) : (
                    <Activity size={13} color={r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)'} />
                  )}
                  <span><strong>{r.sensor}:</strong> {r.message}</span>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)',
                    background: r.severity === 'CRITICAL' ? 'var(--status-critical-bg)' : 'var(--status-watch-bg)',
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {r.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
