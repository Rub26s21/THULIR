// ============================================================
// THULIR - Ultra-Premium Jewel-Toned Sensor Telemetry Card
// ============================================================

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
}

function getSensorTheme(sensorKey: string): SensorTheme {
  switch (sensorKey) {
    case 'tilt_x':
      return {
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        bgTint: 'rgba(6, 182, 212, 0.12)',
        icon: <Compass size={16} color="#06b6d4" />,
      };
    case 'tilt_y':
      return {
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        bgTint: 'rgba(139, 92, 246, 0.12)',
        icon: <Compass size={16} color="#8b5cf6" />,
      };
    case 'pressure':
      return {
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
        bgTint: 'rgba(59, 130, 246, 0.12)',
        icon: <Gauge size={16} color="#3b82f6" />,
      };
    case 'gas_raw':
      return {
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        bgTint: 'rgba(245, 158, 11, 0.12)',
        icon: <Flame size={16} color="#f59e0b" />,
      };
    case 'temperature':
      return {
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        bgTint: 'rgba(239, 68, 68, 0.12)',
        icon: <Thermometer size={16} color="#ef4444" />,
      };
    case 'humidity':
      return {
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        bgTint: 'rgba(16, 185, 129, 0.12)',
        icon: <Droplets size={16} color="#10b981" />,
      };
    case 'distance_cm':
      return {
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        bgTint: 'rgba(249, 115, 22, 0.12)',
        icon: <Ruler size={16} color="#f97316" />,
      };
    case 'vib_rms':
      return {
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
        bgTint: 'rgba(236, 72, 153, 0.12)',
        icon: <Activity size={16} color="#ec4899" />,
      };
    default:
      return {
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        bgTint: 'rgba(6, 182, 212, 0.12)',
        icon: <Activity size={16} color="#06b6d4" />,
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

  const statusClass = {
    NORMAL: 'state-normal',
    WATCH: 'state-watch',
    CRITICAL: 'state-critical',
    OFFLINE: 'state-offline',
  }[status];

  const timeAgo = timestamp ? formatTimeAgo(timestamp) : 'No data';

  // Physical validation check (sanity bounds)
  const isAbnormal =
    (sensorKey === 'temperature' && (value !== null && (value < -20 || value > 80))) ||
    (sensorKey === 'pressure' && (value !== null && (value < 500 || value > 1200))) ||
    (sensorKey === 'humidity' && (value !== null && (value < 0 || value > 100)));

  return (
    <div className={`sensor-card-skeuo ${statusClass}`} role="region" aria-label={`${name} sensor reading`}>
      {/* Top Specular Shimmer Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 16,
          right: 16,
          height: '2px',
          background: theme.gradient,
          borderRadius: '2px',
          opacity: 0.85,
        }}
      />

      {/* Top Header */}
      <div className="sensor-card-top" style={{ marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: theme.bgTint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.color}30`,
            }}
          >
            {theme.icon}
          </div>
          <span className="sensor-name-label">{name}</span>
        </div>
        <span className="sensor-chip-badge">{hardware}</span>
      </div>

      {/* Main Dominant Value */}
      <div className="sensor-value-row">
        {value !== null && value !== undefined && Number.isFinite(value) ? (
          <div>
            <span className="sensor-val-num">
              {typeof value === 'number' ? value.toFixed(precision) : value}
            </span>
            <span className="sensor-val-unit">{unit}</span>
          </div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '1.3rem', fontFamily: 'JetBrains Mono, monospace' }}>
            — N/A
          </div>
        )}

        {isAbnormal && (
          <div title="Data validation notice: value outside typical operational range" style={{ color: 'var(--status-watch)', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={15} />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="sensor-card-footer">
        <span className={`sensor-status-badge ${status}`}>{status}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem' }}>{timeAgo}</span>
      </div>
    </div>
  );
}
