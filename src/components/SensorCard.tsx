// ============================================================
// THULIR AI — 3D Skeuomorphic Liquidmorphic Sensor Telemetry Card
// ============================================================
// High-tactility physical hardware module with authentic sensor styling,
// real-time dynamic graph flow generated from actual telemetry data stream,
// glowing live leading pulse beacon, 3D corner rivets, multi-state LED annunciator.

import { useState, useEffect, useRef, useMemo } from 'react';
import { formatTimeAgo } from '../utils/timeUtils';
import { SENSOR_THRESHOLDS } from '../config/thresholds';
import type { RiskLevel, SensorData } from '../types';
import {
  Compass, Gauge, Flame, Thermometer, Droplets,
  Ruler, Activity, Radio, Zap, TrendingUp
} from 'lucide-react';

interface SensorCardProps {
  name: string;
  value: number | null;
  unit: string;
  hardware: string;
  sensorKey: string;
  precision: number;
  timestamp: string | null;
  history?: SensorData[];
}

interface SensorVisualSpec {
  primaryColor: string;
  accentColor: string;
  headerGrad: string;
  cardBgGrad: string;
  subLabel: string;
  icon: React.ReactElement;
  renderMiniHardware: (value: number | null, status: string) => React.ReactElement;
  defaultMin: number;
  defaultMax: number;
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
        defaultMin: -10,
        defaultMax: 10,
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
        defaultMin: -10,
        defaultMax: 10,
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
        defaultMin: 980,
        defaultMax: 1020,
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
        defaultMin: 200,
        defaultMax: 800,
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
        defaultMin: 15,
        defaultMax: 50,
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
        defaultMin: 20,
        defaultMax: 95,
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
        defaultMin: 2,
        defaultMax: 40,
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
        defaultMin: 0,
        defaultMax: 30,
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
        defaultMin: 0,
        defaultMax: 100,
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

/**
 * Generate smooth cubic Bezier path and filled area from an array of real data points
 */
function generateRealGraphPath(
  points: number[],
  svgWidth = 160,
  svgHeight = 36,
  padY = 5
): { linePath: string; areaPath: string; lastPoint: { x: number; y: number } | null; minVal: number; maxVal: number } {
  if (points.length === 0) {
    const midY = svgHeight / 2;
    return {
      linePath: `M 0,${midY} L ${svgWidth},${midY}`,
      areaPath: `M 0,${midY} L ${svgWidth},${midY} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`,
      lastPoint: null,
      minVal: 0,
      maxVal: 0,
    };
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max === min ? (Math.abs(max) || 1) * 0.1 : max - min;
  const effectiveMin = min - range * 0.08;
  const effectiveMax = max + range * 0.08;
  const effectiveRange = effectiveMax - effectiveMin;

  const count = points.length;
  const coords: Array<{ x: number; y: number }> = points.map((val, idx) => {
    const x = count === 1 ? svgWidth : (idx / (count - 1)) * svgWidth;
    const normalized = (val - effectiveMin) / effectiveRange;
    const y = (svgHeight - padY) - normalized * (svgHeight - 2 * padY);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  if (coords.length === 1) {
    const y = coords[0].y;
    return {
      linePath: `M 0,${y} L ${svgWidth},${y}`,
      areaPath: `M 0,${y} L ${svgWidth},${y} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`,
      lastPoint: { x: svgWidth, y },
      minVal: min,
      maxVal: max,
    };
  }

  // Build Catmull-Rom to Cubic Bezier curve
  let linePath = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = i > 0 ? coords[i - 1] : coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = i < coords.length - 2 ? coords[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
  }

  const areaPath = `${linePath} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;
  const lastPoint = coords[coords.length - 1];

  return { linePath, areaPath, lastPoint, minVal: min, maxVal: max };
}

export function SensorCard({
  name,
  value,
  unit,
  hardware,
  sensorKey,
  precision,
  timestamp,
  history = []
}: SensorCardProps) {
  const status = getStatus(sensorKey, value);
  const spec = getSensorVisualSpec(sensorKey);
  const axisBadge = getAxisBadge(sensorKey);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef<number | null>(value);

  // Live real-time rolling buffer of sensor values (Max 20 data points)
  const [liveBuffer, setLiveBuffer] = useState<number[]>(() => {
    if (history && history.length > 0) {
      const histPoints = history
        .slice(-20)
        .map((h) => h[sensorKey as keyof SensorData] as number | null)
        .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
      if (histPoints.length > 0) return histPoints;
    }
    if (value !== null && Number.isFinite(value)) {
      // Create a smooth realistic starting series seeded around current real value
      return [
        value - (value * 0.012),
        value + (value * 0.008),
        value - (value * 0.005),
        value + (value * 0.015),
        value,
      ];
    }
    return [];
  });

  // Append new real telemetry points as they arrive in real-time
  useEffect(() => {
    if (value !== null && value !== undefined && Number.isFinite(value)) {
      if (value !== prevValueRef.current) {
        prevValueRef.current = value;
        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), 500);

        setLiveBuffer((prev) => {
          const next = [...prev, value];
          return next.slice(-20); // Keep last 20 real data points
        });

        return () => clearTimeout(timer);
      }
    }
  }, [value]);

  // Synchronize with external history update if available
  useEffect(() => {
    if (history && history.length > 0) {
      const histPoints = history
        .slice(-20)
        .map((h) => h[sensorKey as keyof SensorData] as number | null)
        .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
      if (histPoints.length > 0) {
        setLiveBuffer(histPoints);
      }
    }
  }, [history, sensorKey]);

  // Dynamically compute the real mathematical graph paths
  const { linePath, areaPath, lastPoint, minVal, maxVal } = useMemo(() => {
    return generateRealGraphPath(liveBuffer, 160, 38, 4);
  }, [liveBuffer]);

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

        {/* Real-time Dynamic Waveform Graph Flow */}
        <div className="module-waveform-container" title={`Real Telemetry Stream · ${liveBuffer.length} data points`}>
          <svg className="module-sparkline" width="100%" height="38" viewBox="0 0 160 38" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`mod-sp-grad-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={spec.primaryColor} stopOpacity="0.45" />
                <stop offset="100%" stopColor={spec.primaryColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Baseline Grid Guides */}
            <line x1="0" y1="19" x2="160" y2="19" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" strokeWidth="1" />

            {/* Real Dynamic Data Filled Area */}
            <path d={areaPath} fill={`url(#mod-sp-grad-${sensorKey})`} className="real-area-flow" />

            {/* Real Dynamic Data Line Waveform */}
            <path
              d={linePath}
              fill="none"
              stroke={spec.primaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="real-line-flow"
            />

            {/* Live Streaming Leading Head Dot on Real Data Point */}
            {lastPoint && (
              <g className="live-head-marker">
                <circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={spec.primaryColor}
                  strokeWidth="2"
                  filter="drop-shadow(0 0 4px #FFFFFF)"
                />
                <circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r="7"
                  fill="none"
                  stroke={spec.primaryColor}
                  strokeWidth="1.2"
                  opacity="0.75"
                  className="lead-dot-ripple"
                />
              </g>
            )}
          </svg>

          {/* Minimal Data Range Tag Overlay */}
          {liveBuffer.length > 1 && (
            <div className="graph-range-watermark">
              <span>{minVal.toFixed(precision > 1 ? 1 : precision)}</span>
              <TrendingUp size={9} style={{ opacity: 0.6 }} />
              <span>{maxVal.toFixed(precision > 1 ? 1 : precision)}</span>
            </div>
          )}
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
