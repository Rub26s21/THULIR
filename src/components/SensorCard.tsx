// ============================================================
// THULIR - Marketing-Grade Sensor Card with Value Flash & Micro-Interactions
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { formatTimeAgo } from '../utils/timeUtils';
import { SENSOR_THRESHOLDS } from '../config/thresholds';
import type { RiskLevel } from '../types';
import {
  Compass, Gauge, Flame, Thermometer, Droplets,
  Ruler, Activity, AlertCircle
} from 'lucide-react';

interface SensorCardProps {
  name: string;
  value: number | null;
  unit: string;
  hardware: string;
  sensorKey: string;
  precision: number;
  timestamp: string | null;
}

interface SensorTheme {
  color: string;
  gradient: string;
  bgTint: string;
  icon: any;
  sparklinePath: string;
  sparklineArea: string;
}

function getSensorTheme(sensorKey: string): SensorTheme {
  switch (sensorKey) {
    case 'tilt_x':
      return {
        color: '#00e5ff',
        gradient: 'linear-gradient(90deg, #00e5ff 0%, #38bdf8 100%)',
        bgTint: 'rgba(0, 229, 255, 0.12)',
        icon: <Compass size={18} color="#00e5ff" />,
        sparklinePath: 'M0,22 Q20,6 40,16 T80,10 T110,24 T135,8 T150,14',
        sparklineArea: 'M0,22 Q20,6 40,16 T80,10 T110,24 T135,8 T150,14 L150,36 L0,36 Z',
      };
    case 'tilt_y':
      return {
        color: '#7c5cff',
        gradient: 'linear-gradient(90deg, #7c5cff 0%, #a855f7 100%)',
        bgTint: 'rgba(124, 92, 255, 0.12)',
        icon: <Compass size={18} color="#7c5cff" />,
        sparklinePath: 'M0,14 Q25,26 50,10 T95,18 T125,8 T150,16',
        sparklineArea: 'M0,14 Q25,26 50,10 T95,18 T125,8 T150,16 L150,36 L0,36 Z',
      };
    case 'pressure':
      return {
        color: '#3b82f6',
        gradient: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
        bgTint: 'rgba(59, 130, 246, 0.12)',
        icon: <Gauge size={18} color="#3b82f6" />,
        sparklinePath: 'M0,18 Q30,14 60,19 T110,16 T135,18 T150,16',
        sparklineArea: 'M0,18 Q30,14 60,19 T110,16 T135,18 T150,16 L150,36 L0,36 Z',
      };
    case 'gas_raw':
      return {
        color: '#f59e0b',
        gradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
        bgTint: 'rgba(245, 158, 11, 0.12)',
        icon: <Flame size={18} color="#f59e0b" />,
        sparklinePath: 'M0,24 Q25,18 50,22 T90,12 T125,18 T150,10',
        sparklineArea: 'M0,24 Q25,18 50,22 T90,12 T125,18 T150,10 L150,36 L0,36 Z',
      };
    case 'temperature':
      return {
        color: '#ef4444',
        gradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
        bgTint: 'rgba(239, 68, 68, 0.12)',
        icon: <Thermometer size={18} color="#ef4444" />,
        sparklinePath: 'M0,20 Q35,12 70,16 T115,10 T135,14 T150,8',
        sparklineArea: 'M0,20 Q35,12 70,16 T115,10 T135,14 T150,8 L150,36 L0,36 Z',
      };
    case 'humidity':
      return {
        color: '#10b981',
        gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
        bgTint: 'rgba(16, 185, 129, 0.12)',
        icon: <Droplets size={18} color="#10b981" />,
        sparklinePath: 'M0,16 Q30,24 60,14 T105,19 T135,12 T150,18',
        sparklineArea: 'M0,16 Q30,24 60,14 T105,19 T135,12 T150,18 L150,36 L0,36 Z',
      };
    case 'distance_cm':
      return {
        color: '#f97316',
        gradient: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
        bgTint: 'rgba(249, 115, 22, 0.12)',
        icon: <Ruler size={18} color="#f97316" />,
        sparklinePath: 'M0,10 Q35,22 70,12 T110,16 T140,8 T150,12',
        sparklineArea: 'M0,10 Q35,22 70,12 T110,16 T140,8 T150,12 L150,36 L0,36 Z',
      };
    case 'vib_rms':
      return {
        color: '#ec4899',
        gradient: 'linear-gradient(90deg, #ec4899 0%, #d946ef 100%)',
        bgTint: 'rgba(236, 72, 153, 0.12)',
        icon: <Activity size={18} color="#ec4899" />,
        sparklinePath: 'M0,20 Q12,6 24,24 T48,8 T72,26 T96,10 T120,22 T140,6 T150,18',
        sparklineArea: 'M0,20 Q12,6 24,24 T48,8 T72,26 T96,10 T120,22 T140,6 T150,18 L150,36 L0,36 Z',
      };
    default:
      return {
        color: '#00e5ff',
        gradient: 'linear-gradient(90deg, #00e5ff 0%, #38bdf8 100%)',
        bgTint: 'rgba(0, 229, 255, 0.12)',
        icon: <Activity size={18} color="#00e5ff" />,
        sparklinePath: 'M0,16 Q35,10 70,18 T115,12 T150,14',
        sparklineArea: 'M0,16 Q35,10 70,18 T115,12 T150,14 L150,36 L0,36 Z',
      };
  }
}

function getStatus(key: string, value: number | null): RiskLevel | 'OFFLINE' {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'OFFLINE';

  const threshold = SENSOR_THRESHOLDS[key];
  if (!threshold) return 'NORMAL';

  let compareValue = value;
  if (threshold.direction === 'absolute') compareValue = Math.abs(value);

  if (threshold.direction === 'below') {
    if (compareValue <= threshold.critical) return 'CRITICAL';
    if (compareValue <= threshold.watch) return 'WATCH';
  } else {
    if (compareValue >= threshold.critical) return 'CRITICAL';
    if (compareValue >= threshold.watch) return 'WATCH';
  }

  return 'NORMAL';
}

export function SensorCard({ name, value, unit, hardware, sensorKey, precision, timestamp }: SensorCardProps) {
  const status = getStatus(sensorKey, value);
  const theme = getSensorTheme(sensorKey);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef<number | null>(value);

  // Micro-interaction: brief ticker value flash on update
  useEffect(() => {
    if (value !== null && value !== prevValueRef.current) {
      prevValueRef.current = value;
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 450);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const statusClass = {
    NORMAL: 'state-normal',
    WATCH: 'state-watch',
    CRITICAL: 'state-critical',
    OFFLINE: 'state-offline',
  }[status];

  const timeAgo = timestamp ? formatTimeAgo(timestamp) : 'No data';

  const isAbnormal =
    (sensorKey === 'temperature' && (value !== null && (value < -20 || value > 80))) ||
    (sensorKey === 'pressure' && (value !== null && (value < 500 || value > 1200))) ||
    (sensorKey === 'humidity' && (value !== null && (value < 0 || value > 100)));

  return (
    <div className={`sensor-card-skeuo ${statusClass}`} role="region" aria-label={`${name} sensor reading`}>
      {/* Top Specular Glass Highlight Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: theme.gradient,
          boxShadow: `0 0 12px ${theme.color}90`,
        }}
      />

      {/* Top Header Row with 38px Glowing Icon Badge */}
      <div className="sensor-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="sensor-icon-badge"
            style={{
              background: theme.bgTint,
              border: `1px solid ${theme.color}40`,
              boxShadow: `0 0 12px ${theme.color}25`,
            }}
          >
            {theme.icon}
          </div>
          <span className="sensor-name-label">{name}</span>
        </div>
        <span className="sensor-chip-badge">{hardware}</span>
      </div>

      {/* Dominant Monospace Value & Subtle Animated Sparkline */}
      <div className="sensor-value-row">
        {value !== null && value !== undefined && Number.isFinite(value) ? (
          <div>
            <span className={`sensor-val-num ${isFlashing ? 'sensor-val-updated' : ''}`}>
              {typeof value === 'number' ? value.toFixed(precision) : value}
            </span>
            <span className="sensor-val-unit">{unit}</span>
          </div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}>
            — N/A
          </div>
        )}

        {/* Ambient SVG Sparkline with Gradient Area Fill */}
        <svg
          className="sensor-mini-sparkline"
          width="125"
          height="36"
          viewBox="0 0 150 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`sparkArea-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={theme.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={theme.sparklineArea}
            fill={`url(#sparkArea-${sensorKey})`}
          />
          <path
            d={theme.sparklinePath}
            stroke={theme.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isAbnormal && (
          <div title="Sensor reading outside expected envelope" style={{ color: 'var(--status-watch)', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {/* Footer Info Row */}
      <div className="sensor-card-footer">
        <span className={`sensor-status-badge ${status}`}>
          <span
            className="pulse-dot"
            style={{
              width: 6,
              height: 6,
              marginRight: 4,
              background: status === 'CRITICAL' ? '#ef4444' : status === 'WATCH' ? '#f59e0b' : status === 'NORMAL' ? '#10b981' : '#6b7280',
            }}
          />
          {status}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{timeAgo}</span>
      </div>
    </div>
  );
}
