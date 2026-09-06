// ============================================================
// THULIR AI — 3D Skeuomorphic Structural Intelligence Risk Panel
// ============================================================
// High-tactility physical hazard evaluator chassis with metallic corner screws,
// 3D radial score gauge with neon phosphor arc, animated annunciator triggers,
// and tactile factor alarm wells.

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Radio, Zap } from 'lucide-react';
import type { RiskState } from '../types';

interface RiskPanelProps {
  risk: RiskState;
}

export function RiskPanel({ risk }: RiskPanelProps) {
  const { level, score, reasons, source, confidence, triggeredSensors } = risk;

  const [displayScore, setDisplayScore] = useState(score);
  const prevScoreRef = useRef(score);

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

  // Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, displayScore)) / 100) * circumference;

  const isCritical = level === 'CRITICAL';
  const isWatch = level === 'WATCH';

  const themeColor = isCritical ? '#EF4444' : isWatch ? '#F59E0B' : '#10B981';
  const headerGrad = isCritical
    ? 'linear-gradient(135deg, #991B1B 0%, #DC2626 50%, #EF4444 100%)'
    : isWatch
      ? 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)'
      : 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)';

  const levelLabel =
    level === 'NORMAL' ? 'NOMINAL STABILITY' :
    level === 'WATCH'  ? 'MODERATE ELEVATED' :
                         'CRITICAL HAZARD';

  return (
    <div
      className={`individual-overview-3d-card risk-chassis ${isCritical ? 'hazard-pulse' : ''}`}
      role="region"
      aria-label="Structural Risk Assessment"
      style={{ '--card-theme-color': themeColor } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div className="card-top-bezel" style={{ background: headerGrad }}>
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            {isCritical && <ShieldAlert size={17} color="#FFFFFF" />}
            {isWatch && <AlertTriangle size={17} color="#FFFFFF" />}
            {!isCritical && !isWatch && <ShieldCheck size={17} color="#FFFFFF" />}
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">STRUCTURAL INTELLIGENCE</span>
            <span className="card-chip-sub">MULTI-STRATA HAZARD MATRIX</span>
          </div>
        </div>

        <div className="bezel-right">
          <span className="card-hw-badge">
            {source === 'COMBINED' ? 'RULES + ML ENSEMBLE' : source === 'ML' ? 'AI INFERENCE' : 'SAFETY RULES'}
          </span>
        </div>
      </div>

      {/* Main Assessment Body */}
      <div className="overview-card-body">
        <div className="risk-evaluation-row">
          {/* Left: Headline & Trigger tags */}
          <div className="risk-status-info">
            <div className="risk-headline-wrap">
              <span className="risk-level-badge" style={{ color: themeColor, borderColor: `${themeColor}60` }}>
                <span className="status-beacon-dot" style={{ background: themeColor, boxShadow: `0 0 8px ${themeColor}` }} />
                {levelLabel}
              </span>
            </div>

            <p className="risk-subline-desc">
              {level === 'NORMAL'
                ? 'Multi-sensor strata readings and ML classifier indicate nominal ground stability.'
                : `${reasons.length} active stress/anomaly factor${reasons.length > 1 ? 's' : ''} triggered in coal mine strata.`}
            </p>

            {/* Triggered sensor pills */}
            {triggeredSensors && triggeredSensors.length > 0 && (
              <div className="triggered-chips-cluster">
                {triggeredSensors.map((s) => (
                  <span key={s} className="triggered-chip">
                    <Zap size={9} />
                    {s}
                  </span>
                ))}
                <span className="triggered-chip ml-chip">
                  AI Conf: {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Right: 3D Dial Gauge */}
          <div className="risk-dial-gauge-wrapper">
            <svg width="128" height="128" viewBox="0 0 128 128" className="risk-svg-dial">
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="var(--bg-well)"
                strokeWidth="10"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={themeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
                style={{
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
                  filter: `drop-shadow(0 0 6px ${themeColor})`,
                }}
              />
            </svg>

            {/* Inset Score Display */}
            <div className="dial-score-content">
              <span className="dial-num">{displayScore}</span>
              <span className="dial-denom">/ 100</span>
              <span className="dial-sub-tag" style={{ color: themeColor }}>{level}</span>
            </div>
          </div>
        </div>

        {/* Active Risk Factors Alarm Strips */}
        {reasons.length > 0 && (
          <div className="risk-factors-section">
            <span className="section-micro-header">ACTIVE RISK TRIGGERS</span>
            <div className="risk-alarms-list">
              {reasons.map((r, i) => (
                <div key={i} className={`tactile-alarm-strip ${r.severity.toLowerCase()}`}>
                  <div className="alarm-strip-left">
                    <span className="alarm-dot" style={{
                      background: r.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B',
                      boxShadow: `0 0 8px ${r.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B'}`
                    }} />
                    <span className="alarm-name">{r.sensor}</span>
                    <span className="alarm-msg">— {r.message}</span>
                  </div>
                  <span className={`alarm-sev-badge ${r.severity.toLowerCase()}`}>
                    {r.severity}
                  </span>
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
          <span>REAL-TIME INFERENCE ENGINE ACTIVE</span>
        </div>
        <span className="footer-clock-tag">50Hz FUSION CYCLE</span>
      </div>
    </div>
  );
}
