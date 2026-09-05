// ============================================================
// THULIR AI — Historical Telemetry & Trend Analytics
// ============================================================

import { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { SENSOR_META, SENSOR_THRESHOLDS } from '../config/thresholds';
import { safeDate } from '../utils/timeUtils';
import { TrendingUp, AlertTriangle } from 'lucide-react';
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

const METRIC_TABS: { key: MetricTab; label: string; color: string }[] = [
  { key: 'ALL', label: 'All Sensors (Matrix)', color: '#00d4ff' },
  { key: 'TILT', label: 'Tilt X / Y', color: '#00d4ff' },
  { key: 'PRESSURE', label: 'Pressure', color: '#3b82f6' },
  { key: 'GAS', label: 'Gas (MQ-2)', color: '#f59e0b' },
  { key: 'ENV', label: 'Temp & Humidity', color: '#ef4444' },
  { key: 'DISTANCE', label: 'Displacement', color: '#f97316' },
  { key: 'VIBRATION', label: 'Vibration RMS', color: '#ec4899' },
];

const CHART_COLORS: Record<string, string> = {
  tilt_x: '#087EA4',
  tilt_y: '#0F6B57',
  pressure: '#5C6BC0',
  gas_raw: '#D4A017',
  temperature: '#C62828',
  humidity: '#1F9D7A',
  distance_cm: '#5D4037',
  vib_rms: '#7B3F9E',
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

export function HistoricalCharts({ history, timeRange, onTimeRangeChange, loading, error }: HistoricalChartsProps) {
  const [activeTab, setActiveTab] = useState<MetricTab>('ALL');

  const formattedHistory = history.map(row => ({
    ...row,
    timeFormatted: formatTimestamp(row.created_at, timeRange),
  }));

  const readableError = formatErrorMessage(error);

  return (
    <div className="skeuo-card" role="region" aria-label="Live Sensor Trends">
      {/* Top Header & Segmented Controls */}
      <div className="charts-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Live Sensor Trends &amp; Telemetry Stream
          </span>
        </div>

        {/* Time Range Selector */}
        <div className="time-range-group" role="group" aria-label="Time range selector">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              className={`time-btn-v2 ${timeRange === range ? 'active' : ''}`}
              onClick={() => onTimeRangeChange(range)}
              aria-pressed={timeRange === range}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Category Tabs */}
      <div className="charts-metric-tabs" style={{ marginBottom: 16 }}>
        {METRIC_TABS.map(tab => (
          <button
            key={tab.key}
            className={`chart-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              borderColor: activeTab === tab.key ? `${tab.color}90` : undefined,
              color: activeTab === tab.key ? tab.color : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            [STREAM] Fetching telemetry records from Supabase...
          </div>
        </div>
      )}

      {readableError && (
        <div style={{ padding: '10px 14px', background: 'var(--status-critical-bg)', border: '1px solid var(--status-critical-border)', borderRadius: 8, color: 'var(--status-critical)', fontSize: '0.78rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} />
          <span>Telemetry query notice: {readableError}</span>
        </div>
      )}

      {!loading && !readableError && formattedHistory.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
          No telemetry records recorded for the {timeRange} window.
        </div>
      )}

      {/* Charts Render based on Tab */}
      {!loading && !readableError && formattedHistory.length > 0 && (
        <div>
          {/* ALL SENSORS MULTI-GRID MATRIX */}
          {activeTab === 'ALL' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
              {SENSOR_META.map(meta => {
                const color = CHART_COLORS[meta.key] || '#3b82f6';
                const threshold = SENSOR_THRESHOLDS[meta.key];
                const gradId = `grid-grad-${meta.key}`;

                return (
                  <div key={meta.key} className="skeuo-well" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{meta.name}</span>
                      <span style={{ color: color, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{meta.unit}</span>
                    </div>

                    <ResponsiveContainer width="100%" height={155}>
                      <AreaChart data={formattedHistory} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="var(--chart-grid)" />
                        <XAxis dataKey="timeFormatted" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={45} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 11, color: 'var(--text-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', fontFamily: 'var(--font-mono)' }}
                          formatter={(val: any) => [`${val ?? 'N/A'} ${meta.unit}`, meta.name]}
                        />
                        {threshold && (
                          <ReferenceLine y={threshold.critical} stroke="var(--status-critical)" strokeDasharray="3 3" opacity={0.7} />
                        )}
                        <Area type="monotone" dataKey={meta.key} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradId})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          )}

          {/* FOCUSED TILT CHART */}
          {activeTab === 'TILT' && (
            <div className="skeuo-well" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                MPU6050 Structural Inclination (Tilt X vs Tilt Y)
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={formattedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} unit="°" />
                  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                  <ReferenceLine y={15} stroke="var(--status-critical)" strokeDasharray="3 3" label={{ value: 'Critical ±15°', fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine y={-15} stroke="var(--status-critical)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="tilt_x" stroke="#00d4ff" name="Tilt X (°)" strokeWidth={2.4} dot={false} />
                  <Line type="monotone" dataKey="tilt_y" stroke="#8b5cf6" name="Tilt Y (°)" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* FOCUSED PRESSURE CHART */}
          {activeTab === 'PRESSURE' && (
            <div className="skeuo-well" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                BMP280 Barometric Atmospheric Pressure
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pressureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={['dataMin - 5', 'dataMax + 5']} unit=" hPa" />
                  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                  <Area type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2.4} fillOpacity={1} fill="url(#pressureGrad)" name="Pressure (hPa)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* FOCUSED GAS CHART */}
          {activeTab === 'GAS' && (
            <div className="skeuo-well" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                MQ-2 Analog Toxic &amp; Flammable Gas (ADC 0–1023)
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                  <ReferenceLine y={700} stroke="var(--status-critical)" strokeDasharray="3 3" label={{ value: 'Critical Gas 700', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="gas_raw" stroke="#f59e0b" strokeWidth={2.4} fillOpacity={1} fill="url(#gasGrad)" name="Gas Raw" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* FOCUSED ENV CHART */}
          {activeTab === 'ENV' && (
            <div className="skeuo-well" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                DHT22 Mine Atmosphere (Temperature &amp; Humidity)
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={formattedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="#ef4444" unit="°C" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" />
                  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature (°C)" strokeWidth={2.4} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#10b981" name="Humidity (%)" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* FOCUSED DISTANCE CHART */}
          {activeTab === 'DISTANCE' && (
            <div className="skeuo-well" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                HC-SR04 Roof Displacement Clearance
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={formattedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} unit=" cm" />
                  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                  <ReferenceLine y={5.0} stroke="var(--status-critical)" strokeDasharray="3 3" label={{ value: 'Critical Breach ≤5cm', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="distance_cm" stroke="#f97316" strokeWidth={2.4} dot={false} name="Distance (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* FOCUSED VIBRATION CHART */}
          {activeTab === 'VIBRATION' && (
            <div className="skeuo-well" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                ADXL345 50-Sample Vibration RMS Magnitude
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} unit=" m/s²" />
                  <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
                  <ReferenceLine y={1.50} stroke="var(--status-critical)" strokeDasharray="3 3" label={{ value: 'Critical Vibration ≥1.50 m/s²', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="vib_rms" stroke="#ec4899" strokeWidth={2.4} fillOpacity={1} fill="url(#vibGrad)" name="Vib RMS (m/s²)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
