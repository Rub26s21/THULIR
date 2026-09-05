// ============================================================
// THULIR AI — Structural Intelligence Risk Panel
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Brain, Activity } from 'lucide-react';
import type { RiskState } from '../types';

interface RiskPanelProps {
  risk: RiskState;
}

export function RiskPanel({ risk }: RiskPanelProps) {
  const { level, score, reasons, source, confidence, triggeredSensors } = risk;

  const [displayScore, setDisplayScore] = useState(score);
  const prevScoreRef = useRef(score);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)',
  });

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = prevScoreRef.current;
    const endValue = score;
    prevScoreRef.current = score;
    const duration = 600;
    if (startValue === endValue) return;
    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startValue + (endValue - startValue) * easeProgress));
      if (progress < 1) animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 3.5;
    const rotateX = -(y / (rect.height / 2)) * 3.5;
    setTiltStyle({ transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)` });
  };

  const handleMouseLeave = () => {
    setTiltStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)' });
  };

  // Gauge
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const gaugeColor =
    score >= 70 ? 'var(--status-critical)' :
    score >= 40 ? 'var(--status-watch)' :
    'var(--status-normal)';

  const gaugeGlowColor =
    score >= 70 ? 'rgba(198, 40, 40, 0.35)' :
    score >= 40 ? 'rgba(180, 83, 9, 0.3)' :
    'rgba(15, 107, 87, 0.3)';

  const isCritical = level === 'CRITICAL';

  const levelLabel =
    level === 'NORMAL'   ? 'Nominal / Low Risk' :
    level === 'WATCH'    ? 'Elevated / Moderate' :
                           'Critical Hazard';

  const levelColor =
    level === 'CRITICAL' ? 'var(--status-critical)' :
    level === 'WATCH'    ? 'var(--status-watch)' :
    'var(--status-normal)';

  return (
    <div
      ref={cardRef}
      className={`risk-hero-card ${isCritical ? 'critical-pulse' : ''}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Structural risk assessment"
    >
      {/* Subtle strata background illustration */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          opacity: 0.055,
          pointerEvents: 'none',
        }}
        width="220"
        height="140"
        viewBox="0 0 220 140"
      >
        <path d="M0 140 Q55 100 110 115 T220 100 L220 140 Z" fill="var(--brand-green)" />
        <path d="M0 140 Q55 115 110 128 T220 115 L220 140 Z" fill="var(--brand-green)" opacity="0.7" />
        <path d="M0 140 Q55 128 110 138 T220 130 L220 140 Z" fill="var(--brand-green)" opacity="0.5" />
      </svg>

      <div className="risk-hero-main">
        {/* Left: Status Headline */}
        <div className="risk-level-display">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-muted)'
            }}>
              Structural Intelligence
            </span>
            <span style={{
              fontSize: '0.6rem', padding: '2px 7px', borderRadius: 6, fontWeight: 700,
              color: source === 'COMBINED' ? 'var(--brand-blue)' : 'var(--text-dim)',
              background: source === 'COMBINED' ? 'var(--brand-blue-tint)' : 'var(--bg-well)',
              border: `1px solid ${source === 'COMBINED' ? 'var(--brand-blue-border)' : 'var(--border-subtle)'}`,
              fontFamily: 'var(--font-mono)',
            }}>
              {source === 'COMBINED' ? 'RULES + AI' : source === 'ML' ? 'AI INFERENCE' : 'SAFETY RULES'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {level === 'CRITICAL' && <ShieldAlert size={32} color="var(--status-critical)" />}
            {level === 'WATCH'    && <AlertTriangle size={32} color="var(--status-watch)" />}
            {level === 'NORMAL'   && <ShieldCheck size={32} color="var(--status-normal)" />}
            <span style={{
              fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em',
              color: levelColor, lineHeight: 1.15
            }}>
              {levelLabel}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {level === 'NORMAL'
              ? 'Multi-sensor strata readings and ML classifier indicate nominal ground stability.'
              : `${reasons.length} active stress/anomaly factor${reasons.length > 1 ? 's' : ''} triggered in coal mine strata.`}
          </p>

          {triggeredSensors && triggeredSensors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {triggeredSensors.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.68rem', padding: '3px 10px', borderRadius: 8,
                    background: 'var(--bg-well)', color: 'var(--text-secondary)',
                    fontWeight: 600, border: '1px solid var(--border-well)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Gauge + Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div className="risk-gauge-bezel">
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Track */}
              <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-well)" strokeWidth="13" />
              {/* Glow arc */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={gaugeGlowColor}
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter="url(#gaugeGlow)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              {/* Progress arc */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={gaugeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease' }}
              />
            </svg>
            <div className="risk-score-value">{displayScore}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Risk Score
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: gaugeColor }}>
              {displayScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 100</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Level: <strong style={{ color: levelColor }}>{level}</strong>
            </span>
            {confidence < 1.0 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                AI Conf: {(confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div style={{ marginTop: 20 }}>
        <div style={{
          fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10
        }}>
          Active Risk Factors
        </div>
        {reasons.length === 0 ? (
          <div className="skeuo-well" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--status-normal)', fontSize: '0.8rem'
          }}>
            <ShieldCheck size={15} />
            <span>Nominal ground equilibrium — no structural anomalies detected.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reasons.map((r, idx) => (
              <div key={idx} className="risk-factor-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {r.source === 'ML' ? (
                    <Brain size={14} color="#7C3AED" />
                  ) : (
                    <Activity size={14} color={r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)'} />
                  )}
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{r.sensor}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}> — {r.message}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800, padding: '3px 9px', borderRadius: 8,
                  fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 10,
                  color: r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)',
                  background: r.severity === 'CRITICAL' ? 'var(--status-critical-bg)' : 'var(--status-watch-bg)',
                  border: `1px solid ${r.severity === 'CRITICAL' ? 'var(--status-critical-border)' : 'var(--status-watch-border)'}`,
                }}>
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
