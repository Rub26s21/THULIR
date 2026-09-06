// ============================================================
// THULIR AI — 3D Skeuomorphic Liquidmorphic Sensor Telemetry Card
// ============================================================
// High-tactility physical hardware module with authentic sensor styling,
// 3D corner rivets, multi-state LED annunciator, glowing live waveform,
// realistic sensor chip iconography, and specular depth reflections.

import { useState, useEffect, useRef } from 'react';
import { formatTimeAgo } from '../utils/timeUtils';
import { SENSOR_THRESHOLDS } from '../config/thresholds';
import type { RiskLevel } from '../types';
import {
  Compass, Gauge, Flame, Thermometer, Droplets,
  Ruler, Activity, Radio, Zap
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

interface SensorVisualSpec {
  primaryColor: string;
  accentColor: string;
  headerGrad: string;
  cardBgGrad: string;
  subLabel: string;
  icon: React.ReactElement;
  renderMiniHardware: (value: number | null, status: string) => React.ReactElement;
  sparklinePath: string;
  sparklineArea: string;
}

function getSensorVisualSpec(sensorKey: string): SensorVisualSpec {
  switch (sensorKey) {
    case 'tilt_x':
      return {
        primaryColor: '#0284C7',
        accentColor: '#38BDF8',
        headerGrad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #0EA5E9 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(2, 132, 199, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(2, 132, 199, 0.04) 100%)',
        subLabel: 'MPU-6050 6-DOF INCLINOMETER',
        icon: <Compass size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-chip cyan-chip" title="MPU-6050 Gyro + Inclinometer Core">
            <div className="chip-gold-pins left" />
            <div className="chip-die">
              <span className="die-text">MPU</span>
              <span className="die-sub">6050</span>
            </div>
            <div className="chip-gold-pins right" />
          </div>
        ),
        sparklinePath: 'M0,24 Q20,8 40,18 T80,12 T110,26 T135,10 T160,16',
        sparklineArea: 'M0,24 Q20,8 40,18 T80,12 T110,26 T135,10 T160,16 L160,40 L0,40 Z',
      };
    case 'tilt_y':
      return {
        primaryColor: '#0F766E',
        accentColor: '#14B8A6',
        headerGrad: 'linear-gradient(135deg, #115E59 0%, #0F766E 50%, #14B8A6 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(15, 118, 110, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(15, 118, 110, 0.04) 100%)',
        subLabel: 'MPU-6050 PITCH DYNAMICS',
        icon: <Compass size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-chip teal-chip" title="MPU-6050 Dynamics Die">
            <div className="chip-gold-pins left" />
            <div className="chip-die">
              <span className="die-text">PITCH</span>
              <span className="die-sub">GYRO</span>
            </div>
            <div className="chip-gold-pins right" />
          </div>
        ),
        sparklinePath: 'M0,16 Q25,28 50,12 T95,20 T130,10 T160,18',
        sparklineArea: 'M0,16 Q25,28 50,12 T95,20 T130,10 T160,18 L160,40 L0,40 Z',
      };
    case 'pressure':
      return {
        primaryColor: '#6366F1',
        accentColor: '#818CF8',
        headerGrad: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(99, 102, 241, 0.04) 100%)',
        subLabel: 'BMP-280 BAROMETRIC MINE CAVITY',
        icon: <Gauge size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-sensor indigo-sensor" title="BMP280 Barometric Pressure Transducer">
            <div className="sensor-metal-can">
              <div className="vent-hole" />
              <span className="can-text">BMP</span>
            </div>
          </div>
        ),
        sparklinePath: 'M0,20 Q30,16 60,21 T115,18 T140,20 T160,18',
        sparklineArea: 'M0,20 Q30,16 60,21 T115,18 T140,20 T160,18 L160,40 L0,40 Z',
      };
    case 'gas_raw':
      return {
        primaryColor: '#059669',
        accentColor: '#34D399',
        headerGrad: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(5, 150, 105, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(5, 150, 105, 0.04) 100%)',
        subLabel: 'MQ-2 FLAMMABLE & TOXIC GAS',
        icon: <Flame size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-gas-dome" title="MQ-2 Electrochemical Sniffer Dome">
            <div className="gas-mesh-grid">
              <div className="mesh-dot" />
              <div className="mesh-dot" />
            </div>
            <span className="dome-text">MQ-2</span>
          </div>
        ),
        sparklinePath: 'M0,26 Q25,20 55,24 T95,14 T130,20 T160,12',
        sparklineArea: 'M0,26 Q25,20 55,24 T95,14 T130,20 T160,12 L160,40 L0,40 Z',
      };
    case 'temperature':
      return {
        primaryColor: '#E11D48',
        accentColor: '#FB7185',
        headerGrad: 'linear-gradient(135deg, #BE123C 0%, #E11D48 50%, #F43F5E 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(225, 29, 72, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(225, 29, 72, 0.04) 100%)',
        subLabel: 'DHT-22 THERMAL PROFILE',
        icon: <Thermometer size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-dht white-grid" title="DHT-22 Thermal Element">
            <div className="dht-slits">
              <span className="slit" />
              <span className="slit" />
              <span className="slit" />
            </div>
            <span className="dht-sub">DHT22</span>
          </div>
        ),
        sparklinePath: 'M0,22 Q35,14 70,18 T120,12 T140,16 T160,10',
        sparklineArea: 'M0,22 Q35,14 70,18 T120,12 T140,16 T160,10 L160,40 L0,40 Z',
      };
    case 'humidity':
      return {
        primaryColor: '#2563EB',
        accentColor: '#60A5FA',
        headerGrad: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(37, 99, 235, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(37, 99, 235, 0.04) 100%)',
        subLabel: 'DHT-22 RELATIVE HUMIDITY',
        icon: <Droplets size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-rh blue-rh" title="DHT-22 Capacitive RH Sensor">
            <Droplets size={14} color="#2563eb" />
            <span className="rh-sub">%RH</span>
          </div>
        ),
        sparklinePath: 'M0,18 Q30,26 65,16 T110,21 T140,14 T160,20',
        sparklineArea: 'M0,18 Q30,26 65,16 T110,21 T140,14 T160,20 L160,40 L0,40 Z',
      };
    case 'distance_cm':
      return {
        primaryColor: '#D97706',
        accentColor: '#FBBF24',
        headerGrad: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(217, 119, 6, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(217, 119, 6, 0.04) 100%)',
        subLabel: 'HC-SR04 ROOF SUBSIDENCE SONAR',
        icon: <Ruler size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-sonar" title="HC-SR04 Ultrasonic Sonar Transducers">
            <div className="sonar-eye"><span className="eye-lbl">T</span></div>
            <div className="sonar-eye"><span className="eye-lbl">R</span></div>
          </div>
        ),
        sparklinePath: 'M0,12 Q35,24 70,14 T115,18 T145,10 T160,14',
        sparklineArea: 'M0,12 Q35,24 70,14 T115,18 T145,10 T160,14 L160,40 L0,40 Z',
      };
    case 'vib_rms':
      return {
        primaryColor: '#DC2626',
        accentColor: '#F87171',
        headerGrad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 50%, #EF4444 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(220, 38, 38, 0.08) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(220, 38, 38, 0.04) 100%)',
        subLabel: 'ADXL-345 3-AXIS SEISMIC RMS',
        icon: <Activity size={17} color="#FFFFFF" />,
        renderMiniHardware: () => (
          <div className="mini-hw-adxl red-chip" title="ADXL-345 High-G Seismic Accelerometer">
            <div className="adxl-axis">X·Y·Z</div>
            <div className="adxl-brand">ADXL</div>
          </div>
        ),
        sparklinePath: 'M0,22 Q12,8 24,26 T48,10 T72,28 T96,12 T120,24 T145,8 T160,20',
        sparklineArea: 'M0,22 Q12,8 24,26 T48,10 T72,28 T96,12 T120,24 T145,8 T160,20 L160,40 L0,40 Z',
      };
    default:
      return {
        primaryColor: '#0284C7',
        accentColor: '#38BDF8',
        headerGrad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
        cardBgGrad: 'linear-gradient(165deg, rgba(2, 132, 199, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)',
        subLabel: 'INTELLIGENT SENSOR NODE',
        icon: <Activity size={17} color="#FFFFFF" />,
        renderMiniHardware: () => <div className="mini-hw-chip cyan-chip" />,
        sparklinePath: 'M0,18 Q35,12 70,20 T120,14 T160,16',
        sparklineArea: 'M0,18 Q35,12 70,20 T120,14 T160,16 L160,40 L0,40 Z',
      };
  }
}

function getAxisBadge(sensorKey: string): string | null {
  switch (sensorKey) {
    case 'tilt_x':      return 'X-AXIS';
    case 'tilt_y':      return 'Y-AXIS';
    case 'distance_cm': return 'Z-DISP';
    case 'vib_rms':     return '3D-RMS';
    default:            return null;
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
  const spec = getSensorVisualSpec(sensorKey);
  const axisBadge = getAxisBadge(sensorKey);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef<number | null>(value);

  useEffect(() => {
    if (value !== null && value !== prevValueRef.current) {
      prevValueRef.current = value;
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const timeAgo = timestamp ? formatTimeAgo(timestamp) : 'No data';

  return (
    <div
      className={`liquid-sensor-module ${status.toLowerCase()}-state ${isFlashing ? 'pulse-update' : ''}`}
      role="region"
      aria-label={`${name} sensor physical module`}
      style={{ '--module-theme-color': spec.primaryColor } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Fastener Rivets */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top Skeuomorphic Header Plate */}
      <div className="module-top-plate" style={{ background: spec.headerGrad }}>
        <div className="module-plate-left">
          <div className="module-icon-orb">
            {spec.icon}
          </div>
          <div className="module-title-wrap">
            <span className="module-primary-title">{name}</span>
            <span className="module-sub-identity">{spec.subLabel}</span>
          </div>
        </div>

        <div className="module-plate-right">
          {axisBadge && (
            <span className="module-axis-pill">{axisBadge}</span>
          )}
          <span className="module-chip-badge">{hardware}</span>
        </div>
      </div>

      {/* Sensor Core Telemetry Body */}
      <div className="module-body">
        {/* Hardware Visual + Value Display */}
        <div className="module-reading-row">
          <div className="module-hw-visual">
            {spec.renderMiniHardware(value, status)}
          </div>

          <div className="module-value-block">
            {value !== null && value !== undefined && Number.isFinite(value) ? (
              <div className="module-val-display">
                <span className={`module-digital-num ${isFlashing ? 'val-shimmer' : ''}`}>
                  {typeof value === 'number' ? value.toFixed(precision) : value}
                </span>
                <span className="module-digital-unit">{unit}</span>
              </div>
            ) : (
              <div className="module-offline-display">
                <Radio size={14} className="spin-slow" />
                <span>CONNECTING…</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Sparkline Waveform with Neon Area Fill */}
        <div className="module-waveform-container">
          <svg className="module-sparkline" width="100%" height="34" viewBox="0 0 160 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`mod-sp-grad-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={spec.primaryColor} stopOpacity="0.45" />
                <stop offset="100%" stopColor={spec.primaryColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={spec.sparklineArea} fill={`url(#mod-sp-grad-${sensorKey})`} />
            <path
              d={spec.sparklinePath}
              fill="none"
              stroke={spec.primaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 3-State Physical Annunciator LED Ladder & Footer Status */}
        <div className="module-footer-bar">
          {/* LED Ladder */}
          <div className="led-ladder-cluster" title={`State: ${status}`}>
            <span className={`annunciator-led green ${status === 'NORMAL' ? 'lit' : ''}`} />
            <span className={`annunciator-led yellow ${status === 'WATCH' ? 'lit' : ''}`} />
            <span className={`annunciator-led red ${status === 'CRITICAL' ? 'lit' : ''}`} />
            <span className={`status-text-pill ${status.toLowerCase()}`}>
              {status}
            </span>
          </div>

          {/* Timestamp Heartbeat */}
          <div className="module-heartbeat-meta">
            <Zap size={11} className="zap-beacon" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
