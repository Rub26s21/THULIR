// ============================================================
// THULIR AI — 3D Oscilloscope Telemetry Console & Multi-Channel Stream Recorder
// ============================================================
// High-tactility physical lab oscilloscope chassis with authentic CRT/OLED glass reflections,
// illuminated channel selector buttons, 3D metallic fasteners, live phosphor sweep,
// statistical telemetry readouts (Peak, Trough, Variance), and glowing neon waveform streams.

import { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { SENSOR_META, SENSOR_THRESHOLDS } from '../config/thresholds';
import { safeDate } from '../utils/timeUtils';
import {
  AlertTriangle, Radio, Activity, Cpu, Layers,
  Compass, Gauge, Flame, Thermometer, Ruler
} from 'lucide-react';
import type { SensorData, TimeRange } from '../types';

interface HistoricalChartsProps {
  history: SensorData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  loading: boolean;
  error: any;
}

const TIME_RANGES: TimeRange[] = ['1H', '6H', '24H', '7D'];

type MetricTab = 'ALL' | 'TILT' | 'PRESSURE' | 'GAS' | 'ENV' | 'DISTANCE' | 'VIBRATION';

interface ChannelTabSpec {
  key: MetricTab;
  label: string;
  sub: string;
  color: string;
  icon: React.ReactElement;
  chip: string;
}

const METRIC_TABS: ChannelTabSpec[] = [
  { key: 'ALL', label: '8-CH MATRIX', sub: 'All Sensors', color: '#0284C7', icon: <Layers size={13} />, chip: 'FULL ARRAY' },
  { key: 'TILT', label: 'INCLINATION', sub: 'MPU-6050 X/Y', color: '#0EA5E9', icon: <Compass size={13} />, chip: '6-DOF GYRO' },
  { key: 'PRESSURE', label: 'PRESSURE', sub: 'BMP-280', color: '#6366F1', icon: <Gauge size={13} />, chip: 'BAROMETER' },
  { key: 'GAS', label: 'GAS & SMOKE', sub: 'MQ-2 Sniffer', color: '#10B981', icon: <Flame size={13} />, chip: 'ELECTROCHEM' },
  { key: 'ENV', label: 'TEMP & RH', sub: 'DHT-22 Ambient', color: '#E11D48', icon: <Thermometer size={13} />, chip: 'THERMAL' },
  { key: 'DISTANCE', label: 'SUBSIDENCE', sub: 'HC-SR04 Sonar', color: '#D97706', icon: <Ruler size={13} />, chip: 'ULTRASONIC' },
  { key: 'VIBRATION', label: 'SEISMIC RMS', sub: 'ADXL-345 3D', color: '#DC2626', icon: <Activity size={13} />, chip: 'MICRO-G' },
];

const CHART_COLORS: Record<string, string> = {
  tilt_x: '#0284C7',
  tilt_y: '#0F766E',
  pressure: '#6366F1',
  gas_raw: '#059669',
  temperature: '#E11D48',
  humidity: '#2563EB',
  distance_cm: '#D97706',
  vib_rms: '#DC2626',
};

function formatTimestamp(ts: string, range: TimeRange): string {
  const date = safeDate(ts);
  if (!date) return '';
  try {
    if (range === '1H' || range === '6H') return format(date, 'HH:mm:ss');
    if (range === '24H') return format(date, 'HH:mm');
    return format(date, 'MMM dd HH:mm');
  } catch {
    return '';
  }
}

function formatErrorMessage(err: any): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.error_description && typeof err.error_description === 'string') return err.error_description;
    if (err.details && typeof err.details === 'string') return err.details;
    try {
      return JSON.stringify(err);
    } catch {
      return 'An error occurred while querying historical telemetry.';
    }
  }
  return String(err);
}

// Custom 3D Glass Tooltip
function CustomOscilloscopeTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="oscilloscope-tooltip-panel">
      <div className="tooltip-head">
        <span className="tooltip-time-badge">{label}</span>
        <span className="tooltip-rec-tag">● RECORDED</span>
      </div>
      <div className="tooltip-metrics-list">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="tooltip-row">
            <span className="tooltip-dot" style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-val" style={{ color: entry.color }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoricalCharts({
  history,
  timeRange,
  onTimeRangeChange,
  loading,
  error
}: HistoricalChartsProps) {
  const [activeTab, setActiveTab] = useState<MetricTab>('ALL');

  const formattedHistory = useMemo(() => {
    return history.map(row => ({
      ...row,
      timeFormatted: formatTimestamp(row.created_at, timeRange),
    }));
  }, [history, timeRange]);

  const readableError = formatErrorMessage(error);

  // Compute live analytical statistics for active channel
  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;
    let values: number[] = [];

    if (activeTab === 'TILT') values = history.map(h => Math.abs(h.tilt_x || 0));
    else if (activeTab === 'PRESSURE') values = history.map(h => h.pressure || 0);
    else if (activeTab === 'GAS') values = history.map(h => h.gas_raw || 0);
    else if (activeTab === 'ENV') values = history.map(h => h.temperature || 0);
    else if (activeTab === 'DISTANCE') values = history.map(h => h.distance_cm || 0);
    else if (activeTab === 'VIBRATION') values = history.map(h => h.vib_rms || 0);
    else values = history.map(h => Math.abs(h.tilt_x || 0));

    const valid = values.filter(v => v !== null && !isNaN(v));
    if (valid.length === 0) return null;

    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    const latest = valid[valid.length - 1];
    const prev = valid[valid.length - 2] ?? latest;
    const delta = latest - prev;

    return { min, max, avg, latest, delta, count: valid.length };
  }, [history, activeTab]);

  return (
    <div className="oscilloscope-master-chassis" role="region" aria-label="3D Telemetry Stream Oscilloscope">
      {/* 4 Corner Metallic Precision Screws */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* ── TOP CONTROL BEZEL & INSTRUMENT HEADER ── */}
      <div className="oscilloscope-top-bezel">
        <div className="bezel-left">
          <div className="scope-crt-badge">
            <div className="scope-radar-icon">
              <Radio size={16} color="#FFFFFF" className="spin-slow" />
            </div>
            <div>
              <div className="scope-main-title">
                LIVE SENSOR TRENDS &amp; TELEMETRY STREAM
              </div>
              <div className="scope-meta-sub">
                <span className="scope-live-rec">● REC ACTIVE</span>
                <span>50Hz SENSOR FUSION ENGINE · MULTI-CHANNEL FFT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactile Push-Button Time Range Selector */}
        <div className="bezel-right">
          <div className="time-range-tactile-deck" role="group" aria-label="Time window selection">
            <span className="deck-label">WINDOW</span>
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                className={`tactile-range-btn ${timeRange === range ? 'active-range' : ''}`}
                onClick={() => onTimeRangeChange(range)}
                aria-pressed={timeRange === range}
              >
                <span className="btn-led-dot" />
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ILLUMINATED CHANNEL SELECTOR KEYPAD ── */}
      <div className="scope-channel-selector-bar">
        <div className="channel-tabs-scroll">
          {METRIC_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`scope-channel-btn ${isActive ? 'active-channel' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  '--channel-glow': tab.color,
                } as React.CSSProperties}
              >
                <div className="channel-icon-pill" style={{ color: isActive ? '#FFFFFF' : tab.color }}>
                  {tab.icon}
                </div>
                <div className="channel-btn-text">
                  <span className="channel-title">{tab.label}</span>
                  <span className="channel-sub">{tab.sub}</span>
                </div>
                <span className="channel-hardware-tag">{tab.chip}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STATISTICAL TELEMETRY HUD BAR ── */}
      {stats && (
        <div className="scope-hud-stats-bar">
          <div className="hud-stat-item">
            <span className="hud-lbl">ACTIVE SAMPLES</span>
            <span className="hud-val">{stats.count} PKTS</span>
          </div>
          <div className="hud-stat-item">
            <span className="hud-lbl">WINDOW MIN</span>
            <span className="hud-val">{stats.min.toFixed(2)}</span>
          </div>
          <div className="hud-stat-item">
            <span className="hud-lbl">WINDOW PEAK</span>
            <span className="hud-val peak">{stats.max.toFixed(2)}</span>
          </div>
          <div className="hud-stat-item">
            <span className="hud-lbl">ROLLING AVG</span>
            <span className="hud-val">{stats.avg.toFixed(2)}</span>
          </div>
          <div className="hud-stat-item">
            <span className="hud-lbl">CURRENT DRIFT</span>
            <span className={`hud-val ${stats.delta > 0 ? 'drift-up' : 'drift-down'}`}>
              {stats.delta >= 0 ? `+${stats.delta.toFixed(2)}` : stats.delta.toFixed(2)}
            </span>
          </div>
          <div className="hud-stat-item right-meta">
            <Cpu size={12} />
            <span>ESP32 2.4GHz TELEMETRY BUS</span>
          </div>
        </div>
      )}

      {/* ── CRT/OLED PHOSPHOR DISPLAY SCREEN ── */}
      <div className="oscilloscope-crt-screen">
        {/* Curved Glass Specular Highlight Refraction */}
        <div className="crt-glass-specular" />

        {/* Background Laser Radar Grid */}
        <div className="crt-grid-overlay" />

        {loading && (
          <div className="crt-loading-state">
            <div className="scope-pulse-ring" />
            <span className="crt-stream-text">[STREAM] SYNCHRONIZING WITH SUPABASE TELEMETRY LOGS…</span>
          </div>
        )}

        {readableError && (
          <div className="crt-error-banner">
            <AlertTriangle size={16} />
            <span>Telemetry Bus Error: {readableError}</span>
          </div>
        )}

        {!loading && !readableError && formattedHistory.length === 0 && (
          <div className="crt-empty-state">
            <Radio size={22} className="spin-slow" />
            <span>NO PACKETS RECORDED IN {timeRange} WINDOW · AWAITING NODE TELEMETRY</span>
          </div>
        )}

        {/* ── RENDERED GRAPHICAL STREAMS ── */}
        {!loading && !readableError && formattedHistory.length > 0 && (
          <div className="crt-chart-viewport">
            {/* ══ ALL SENSORS 8-CHANNEL 3D MATRIX ══ */}
            {activeTab === 'ALL' && (
              <div className="scope-matrix-8col">
                {SENSOR_META.map(meta => {
                  const color = CHART_COLORS[meta.key] || '#0284c7';
                  const threshold = SENSOR_THRESHOLDS[meta.key];
                  const gradId = `crt-matrix-grad-${meta.key}`;

                  return (
                    <div key={meta.key} className="scope-mini-channel-card">
                      {/* Mini Channel Header */}
                      <div className="mini-channel-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="mini-channel-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                          <span className="mini-channel-name">{meta.name}</span>
                        </div>
                        <span className="mini-channel-unit" style={{ color }}>{meta.unit}</span>
                      </div>

                      {/* Mini Area Chart */}
                      <ResponsiveContainer width="100%" height={145}>
                        <AreaChart data={formattedHistory} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                          <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="2 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="timeFormatted" tick={{ fontSize: 8, fill: 'var(--text-dim)' }} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 8, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} width={38} domain={['auto', 'auto']} />
                          <Tooltip content={<CustomOscilloscopeTooltip />} />
                          {threshold && (
                            <ReferenceLine y={threshold.critical} stroke="#ef4444" strokeDasharray="3 3" opacity={0.8} />
                          )}
                          <Area
                            type="monotone"
                            dataKey={meta.key}
                            stroke={color}
                            strokeWidth={2.2}
                            fillOpacity={1}
                            fill={`url(#${gradId})`}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ FOCUSED TILT DUAL-AXIS SCOPE ══ */}
            {activeTab === 'TILT' && (
              <div className="scope-focused-screen">
                <div className="focused-scope-title-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={16} color="#0EA5E9" />
                    <span>MPU-6050 6-DOF INCLINATION SWEEP (Tilt X vs Tilt Y)</span>
                  </div>
                  <span className="scope-sensor-tag">DUAL-AXIS MEMS GYRO</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedHistory} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} unit="°" />
                    <Tooltip content={<CustomOscilloscopeTooltip />} />
                    <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRITICAL HAZARD ±15°', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine y={-15} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="tilt_x" stroke="#0284C7" name="Tilt X (Pitch °)" strokeWidth={2.8} dot={false} filter="drop-shadow(0 0 6px #0284c7)" />
                    <Line type="monotone" dataKey="tilt_y" stroke="#10B981" name="Tilt Y (Roll °)" strokeWidth={2.8} dot={false} filter="drop-shadow(0 0 6px #10b981)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ══ FOCUSED PRESSURE OSCILLOSCOPE ══ */}
            {activeTab === 'PRESSURE' && (
              <div className="scope-focused-screen">
                <div className="focused-scope-title-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Gauge size={16} color="#6366F1" />
                    <span>BMP-280 BAROMETRIC CAVITY PRESSURE</span>
                  </div>
                  <span className="scope-sensor-tag">PIEZO-RESISTIVE MEMBRANE</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formattedHistory} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scopePressureGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} domain={['dataMin - 4', 'dataMax + 4']} unit=" hPa" />
                    <Tooltip content={<CustomOscilloscopeTooltip />} />
                    <Area type="monotone" dataKey="pressure" stroke="#6366F1" strokeWidth={2.8} fillOpacity={1} fill="url(#scopePressureGrad)" name="Pressure (hPa)" dot={false} filter="drop-shadow(0 0 6px #6366f1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ══ FOCUSED GAS SNIFFER OSCILLOSCOPE ══ */}
            {activeTab === 'GAS' && (
              <div className="scope-focused-screen">
                <div className="focused-scope-title-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Flame size={16} color="#10B981" />
                    <span>MQ-2 ELECTROCHEMICAL FLAMMABLE &amp; TOXIC GAS DETECTOR</span>
                  </div>
                  <span className="scope-sensor-tag">ANALOG CONCENTRATION ADC</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formattedHistory} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scopeGasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} />
                    <Tooltip content={<CustomOscilloscopeTooltip />} />
                    <ReferenceLine y={700} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRITICAL GAS THRESHOLD (700 PPM)', fill: '#ef4444', fontSize: 10 }} />
                    <Area type="monotone" dataKey="gas_raw" stroke="#10B981" strokeWidth={2.8} fillOpacity={1} fill="url(#scopeGasGrad)" name="Gas Raw" dot={false} filter="drop-shadow(0 0 6px #10b981)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ══ FOCUSED THERMAL & RH OSCILLOSCOPE ══ */}
            {activeTab === 'ENV' && (
              <div className="scope-focused-screen">
                <div className="focused-scope-title-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Thermometer size={16} color="#E11D48" />
                    <span>DHT-22 THERMAL PROFILE &amp; RELATIVE HUMIDITY</span>
                  </div>
                  <span className="scope-sensor-tag">DUAL-ELEMENT AMBIENT</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedHistory} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" stroke="#E11D48" unit="°C" />
                    <YAxis yAxisId="right" orientation="right" stroke="#2563EB" unit="%" />
                    <Tooltip content={<CustomOscilloscopeTooltip />} />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#E11D48" name="Temperature (°C)" strokeWidth={2.8} dot={false} filter="drop-shadow(0 0 6px #e11d48)" />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#2563EB" name="Humidity (%RH)" strokeWidth={2.8} dot={false} filter="drop-shadow(0 0 6px #2563eb)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ══ FOCUSED SUBSIDENCE OSCILLOSCOPE ══ */}
            {activeTab === 'DISTANCE' && (
              <div className="scope-focused-screen">
                <div className="focused-scope-title-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Ruler size={16} color="#D97706" />
                    <span>HC-SR04 ULTRASONIC ROOF DISPLACEMENT CLEARANCE</span>
                  </div>
                  <span className="scope-sensor-tag">SONAR PULSE-ECHO</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedHistory} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} unit=" cm" />
                    <Tooltip content={<CustomOscilloscopeTooltip />} />
                    <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRITICAL CLEARANCE BREACH (≤5cm)', fill: '#ef4444', fontSize: 10 }} />
                    <Line type="monotone" dataKey="distance_cm" stroke="#D97706" strokeWidth={2.8} dot={false} name="Roof Clearance (cm)" filter="drop-shadow(0 0 6px #d97706)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ══ FOCUSED VIBRATION OSCILLOSCOPE ══ */}
            {activeTab === 'VIBRATION' && (
              <div className="scope-focused-screen">
                <div className="focused-scope-title-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={16} color="#DC2626" />
                    <span>ADXL-345 3-AXIS SEISMIC RMS ACCELERATION</span>
                  </div>
                  <span className="scope-sensor-tag">SEISMIC VIBRATION ACCEL</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formattedHistory} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scopeVibGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} unit=" m/s²" />
                    <Tooltip content={<CustomOscilloscopeTooltip />} />
                    <ReferenceLine y={1.50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SEISMIC TRIGGER LIMIT (≥1.50 m/s²)', fill: '#ef4444', fontSize: 10 }} />
                    <Area type="monotone" dataKey="vib_rms" stroke="#DC2626" strokeWidth={2.8} fillOpacity={1} fill="url(#scopeVibGrad)" name="Vibration RMS (m/s²)" dot={false} filter="drop-shadow(0 0 6px #dc2626)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
