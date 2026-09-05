// ============================================================
// THULIR AI — Sensor Card with Premium Clay Material & Value Flash
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
  bgTint: string;
  icon: React.ReactElement;
  sparklinePath: string;
  sparklineArea: string;
}

function getSensorTheme(sensorKey: string): SensorTheme {
  switch (sensorKey) {
    case 'tilt_x':
      return {
        color: '#087EA4',
        bgTint: 'rgba(8, 126, 164, 0.1)',
        icon: <Compass size={17} color="#087EA4" />,
        sparklinePath: 'M0,22 Q20,6 40,16 T80,10 T110,24 T135,8 T150,14',
        sparklineArea: 'M0,22 Q20,6 40,16 T80,10 T110,24 T135,8 T150,14 L150,36 L0,36 Z',
      };
    case 'tilt_y':
      return {
        color: '#0F6B57',
        bgTint: 'rgba(15, 107, 87, 0.1)',
        icon: <Compass size={17} color="#0F6B57" />,
        sparklinePath: 'M0,14 Q25,26 50,10 T95,18 T125,8 T150,16',
        sparklineArea: 'M0,14 Q25,26 50,10 T95,18 T125,8 T150,16 L150,36 L0,36 Z',
      };
    case 'pressure':
      return {
        color: '#5C6BC0',
        bgTint: 'rgba(92, 107, 192, 0.1)',
        icon: <Gauge size={17} color="#5C6BC0" />,
        sparklinePath: 'M0,18 Q30,14 60,19 T110,16 T135,18 T150,16',
        sparklineArea: 'M0,18 Q30,14 60,19 T110,16 T135,18 T150,16 L150,36 L0,36 Z',
      };
    case 'gas_raw':
      return {
        color: '#D4A017',
        bgTint: 'rgba(212, 160, 23, 0.1)',
        icon: <Flame size={17} color="#D4A017" />,
        sparklinePath: 'M0,24 Q25,18 50,22 T90,12 T125,18 T150,10',
        sparklineArea: 'M0,24 Q25,18 50,22 T90,12 T125,18 T150,10 L150,36 L0,36 Z',
      };
    case 'temperature':
      return {
        color: '#C62828',
        bgTint: 'rgba(198, 40, 40, 0.08)',
        icon: <Thermometer size={17} color="#C62828" />,
        sparklinePath: 'M0,20 Q35,12 70,16 T115,10 T135,14 T150,8',
        sparklineArea: 'M0,20 Q35,12 70,16 T115,10 T135,14 T150,8 L150,36 L0,36 Z',
      };
    case 'humidity':
      return {
        color: '#0F6B57',
        bgTint: 'rgba(15, 107, 87, 0.09)',
        icon: <Droplets size={17} color="#0F6B57" />,
        sparklinePath: 'M0,16 Q30,24 60,14 T105,19 T135,12 T150,18',
        sparklineArea: 'M0,16 Q30,24 60,14 T105,19 T135,12 T150,18 L150,36 L0,36 Z',
      };
    case 'distance_cm':
      return {
        color: '#5D4037',
        bgTint: 'rgba(93, 64, 55, 0.08)',
        icon: <Ruler size={17} color="#5D4037" />,
        sparklinePath: 'M0,10 Q35,22 70,12 T110,16 T140,8 T150,12',
        sparklineArea: 'M0,10 Q35,22 70,12 T110,16 T140,8 T150,12 L150,36 L0,36 Z',
      };
    case 'vib_rms':
      return {
        color: '#7B3F9E',
        bgTint: 'rgba(123, 63, 158, 0.1)',
        icon: <Activity size={17} color="#7B3F9E" />,
        sparklinePath: 'M0,20 Q12,6 24,24 T48,8 T72,26 T96,10 T120,22 T140,6 T150,18',
        sparklineArea: 'M0,20 Q12,6 24,24 T48,8 T72,26 T96,10 T120,22 T140,6 T150,18 L150,36 L0,36 Z',
      };
    default:
      return {
        color: '#087EA4',
        bgTint: 'rgba(8, 126, 164, 0.1)',
        icon: <Activity size={17} color="#087EA4" />,
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
    if (compareValue <= threshold.watch)    return 'WATCH';
  } else {
    if (compareValue >= threshold.critical) return 'CRITICAL';
    if (compareValue >= threshold.watch)    return 'WATCH';
  }
  return 'NORMAL';
}

export function SensorCard({ name, value, unit, hardware, sensorKey, precision, timestamp }: SensorCardProps) {
  const status = getStatus(sensorKey, value);
  const theme = getSensorTheme(sensorKey);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef<number | null>(value);

  useEffect(() => {
    if (value !== null && value !== prevValueRef.current) {
      prevValueRef.current = value;
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 450);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const statusClass = { NORMAL: 'state-normal', WATCH: 'state-watch', CRITICAL: 'state-critical', OFFLINE: 'state-offline' }[status];
  const timeAgo = timestamp ? formatTimeAgo(timestamp) : 'No data';

  const isAbnormal =
    (sensorKey === 'temperature' && (value !== null && (value < -20 || value > 80))) ||
    (sensorKey === 'pressure'    && (value !== null && (value < 500 || value > 1200))) ||
    (sensorKey === 'humidity'    && (value !== null && (value < 0 || value > 100)));

  return (
    <div className={`sensor-card-skeuo ${statusClass}`} role="region" aria-label={`${name} sensor reading`}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px',
        background: theme.color,
        opacity: status === 'OFFLINE' ? 0.3 : 0.6,
        borderRadius: '20px 20px 0 0',
      }} />

      {/* Top Row */}
      <div className="sensor-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            className="sensor-icon-badge"
            style={{ background: theme.bgTint, border: `1px solid ${theme.color}30` }}
          >
            {theme.icon}
          </div>
          <span className="sensor-name-label">{name}</span>
        </div>
        <span className="sensor-chip-badge">{hardware}</span>
      </div>

      {/* Value Row */}
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

        {/* Sparkline */}
        <svg className="sensor-mini-sparkline" width="110" height="32" viewBox="0 0 150 36" fill="none">
          <defs>
            <linearGradient id={`sp-area-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={theme.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={theme.sparklineArea} fill={`url(#sp-area-${sensorKey})`} />
          <path d={theme.sparklinePath} stroke={theme.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {isAbnormal && (
          <div title="Sensor outside expected envelope">
            <AlertCircle size={15} color="var(--status-watch)" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sensor-card-footer">
        <span className={`sensor-status-badge ${status}`}>
          <span className="pulse-dot" style={{
            width: 5, height: 5, marginRight: 4,
            background:
              status === 'CRITICAL' ? 'var(--status-critical)' :
              status === 'WATCH'    ? 'var(--status-watch)' :
              status === 'NORMAL'   ? 'var(--status-normal)' :
              'var(--text-dim)',
          }} />
          {status}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: 'var(--text-dim)' }}>
          {timeAgo}
        </span>
      </div>
    </div>
  );
}
