// ============================================================
// THULIR - Marketing-Grade Hero Risk Gauge with 3D Depth & Light Bleed
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Brain, Activity } from 'lucide-react';
import type { RiskState } from '../types';

interface RiskPanelProps {
  risk: RiskState;
}

export function RiskPanel({ risk }: RiskPanelProps) {
  const { level, score, reasons, source, confidence, triggeredSensors } = risk;

  // Animated Count-Up / Count-Down for Center Score
  const [displayScore, setDisplayScore] = useState(score);
  const prevScoreRef = useRef(score);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' });

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = prevScoreRef.current;
    const endValue = score;
    prevScoreRef.current = score;
    const duration = 500; // ms

    if (startValue === endValue) return;

    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out-cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeProgress);
      setDisplayScore(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  // Subtle 3D Perspective Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Max 5 degrees
    const rotateY = (x / (rect.width / 2)) * 4;
    const rotateX = -(y / (rect.height / 2)) * 4;
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
    });
  };

  // Large Dial Calculations (viewBox 160 160, r = 62, circumference ≈ 389.55)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const gaugeColor =
    score >= 70
      ? '#f87171'
      : score >= 40
      ? '#fbbf24'
      : '#34d399';

  const gaugeGlowColor =
    score >= 70
      ? 'rgba(239, 68, 68, 0.6)'
      : score >= 40
      ? 'rgba(245, 158, 11, 0.5)'
      : 'rgba(16, 185, 129, 0.45)';

  const isCritical = level === 'CRITICAL';

  return (
    <div
      ref={cardRef}
      className={`skeuo-card risk-hero-card ${isCritical ? 'critical-pulse' : ''}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Current structural risk assessment"
    >
      <div className="risk-hero-main">
        {/* Left Side: Structural Status Headline */}
        <div className="risk-level-display" style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Overall Structural Integrity
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                padding: '3px 8px',
                borderRadius: 6,
                fontWeight: 800,
                color: source === 'COMBINED' ? '#00e5ff' : 'var(--text-dim)',
                background: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {source === 'COMBINED' ? 'FUSED (RULES + AI)' : source === 'ML' ? 'AI INFERENCE' : 'SAFETY RULES'}
            </span>
          </div>

          <div className={`risk-level-headline level-${level}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            {level === 'CRITICAL' && <ShieldAlert size={36} color="var(--status-critical)" />}
            {level === 'WATCH' && <AlertTriangle size={36} color="var(--status-watch)" />}
            {level === 'NORMAL' && <ShieldCheck size={36} color="var(--status-normal)" />}
            <span>{level === 'NORMAL' ? 'NOMINAL / LOW RISK' : level === 'WATCH' ? 'ELEVATED / MODERATE' : 'CRITICAL HAZARD'}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
            {level === 'NORMAL'
              ? 'Multi-sensor strata readings & ML classifier indicate nominal ground stability.'
              : `${reasons.length} active stress/anomaly factor${reasons.length > 1 ? 's' : ''} triggered in coal mine strata.`}
          </p>

          {triggeredSensors && triggeredSensors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {triggeredSensors.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.68rem',
                    padding: '3px 10px',
                    borderRadius: 6,
                    background: 'var(--bg-well)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid var(--border-well)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: DOMINANT HERO RADIAL GAUGE WITH LIGHT BLEED */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="risk-gauge-bezel">
            <svg width="140" height="140" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="heroRiskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>

                {/* Light-Bleed Halo Filter */}
                <filter id="lightBleedGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Physical Outer Track Ring */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="15"
              />

              {/* 2. Inner Tick Grid Reticle */}
              <circle
                cx="75"
                cy="75"
                r={radius - 12}
                fill="none"
                stroke="rgba(0, 229, 255, 0.16)"
                strokeWidth="1"
                strokeDasharray="3, 5"
              />

              {/* 3. Soft Blurred Light-Bleed Glow Arc Behind */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={gaugeGlowColor}
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter="url(#lightBleedGlow)"
                style={{
                  transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
                  opacity: 0.7,
                }}
              />

              {/* 4. Crisp Foreground Progress Arc */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={gaugeColor}
                strokeWidth="15"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
                }}
              />
            </svg>

            {/* Center Animated Score Display */}
            <div className="risk-score-value">{displayScore}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              Risk Score
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: gaugeColor }}>
              {displayScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 100</span>
            </span>
            {confidence < 1.0 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                AI Conf: {(confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Contributing Factors Breakdown */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
          Active Contributing Risk Factors
        </div>
        {reasons.length === 0 ? (
          <div className="skeuo-well" style={{ fontSize: '0.78rem', color: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} />
            <span>Nominal ground equilibrium: No abnormal inclination, displacement, or toxic gas anomalies detected.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reasons.map((r, idx) => (
              <div
                key={idx}
                className="skeuo-well"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  borderLeft: `4px solid ${r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)'}`,
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.source === 'ML' ? (
                    <Brain size={15} color="#a855f7" />
                  ) : (
                    <Activity size={15} color={r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)'} />
                  )}
                  <span><strong>{r.sensor}:</strong> {r.message}</span>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    padding: '3px 9px',
                    borderRadius: 5,
                    color: r.severity === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-watch)',
                    background: r.severity === 'CRITICAL' ? 'var(--status-critical-bg)' : 'var(--status-watch-bg)',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                    marginLeft: 10,
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
