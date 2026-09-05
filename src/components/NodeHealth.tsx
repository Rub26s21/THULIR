// ============================================================
// THULIR - Mission-Control Node Health & Telemetry Diagnostics
// ============================================================

import { formatTimeAgo } from '../utils/timeUtils';
import { Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { NodeStatus } from '../types';

interface NodeHealthProps {
  nodeStatus: NodeStatus;
}

export function NodeHealth({ nodeStatus }: NodeHealthProps) {
  const { node_id, online, freshness, lastSeen, sensorHealth } = nodeStatus;
  const lastSeenTime = formatTimeAgo(lastSeen, 'Never');

  const isStale = freshness === 'STALE' || freshness === 'OFFLINE';

  const sensorEntries = Object.entries(sensorHealth);
  const healthyCount = sensorEntries.filter(([, h]) => h.state === 'OK').length;
  const totalCount = sensorEntries.length || 6;

  return (
    <div className="skeuo-card" role="region" aria-label="Node health and connectivity">
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Cpu size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            {node_id} Telemetry Diagnostics
          </span>
        </div>
        <span
          className={`skeuo-pill ${online ? 'pill-online' : 'pill-offline'}`}
          style={{ fontSize: '0.68rem', padding: '2px 8px' }}
        >
          <span className={`pulse-dot ${online ? 'dot-green' : 'dot-gray'}`} />
          {online ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Stale Warning Banner if telemetry is not live */}
      {isStale && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--status-watch-bg)', border: '1px solid var(--status-watch-border)', borderRadius: 8, marginBottom: 10, fontSize: '0.72rem', color: 'var(--status-watch)', fontFamily: 'var(--font-mono)' }}>
          <AlertCircle size={14} />
          <span><strong>STALE DATA:</strong> No telemetry received in &gt;60s. Last reading: {lastSeenTime}.</span>
        </div>
      )}

      {/* 2x2 Metric Grid */}
      <div className="node-health-grid">
        <div className="node-stat-box">
          <div className="node-stat-label">Data Freshness</div>
          <div className="node-stat-val" style={{ color: freshness === 'LIVE' ? 'var(--status-normal)' : freshness === 'RECENT' ? 'var(--accent-cyan)' : 'var(--status-watch)' }}>
            {freshness}
          </div>
        </div>

        <div className="node-stat-box">
          <div className="node-stat-label">Last Transmission</div>
          <div className="node-stat-val" style={{ fontSize: '0.8rem' }}>
            {lastSeenTime}
          </div>
        </div>

        <div className="node-stat-box">
          <div className="node-stat-label">Sensors Healthy</div>
          <div className="node-stat-val" style={{ color: healthyCount === totalCount ? 'var(--status-normal)' : 'var(--status-watch)' }}>
            {healthyCount} / {totalCount} NOMINAL
          </div>
        </div>

        <div className="node-stat-box">
          <div className="node-stat-label">Power &amp; Bus</div>
          <div className="node-stat-val" style={{ fontSize: '0.8rem' }}>
            5V USB / I2C+GPIO
          </div>
        </div>
      </div>

      {/* 6 Hardware Sensor Chip Status Row */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
          <span>Hardware Sensor Array Status</span>
          <span style={{ color: 'var(--text-dim)' }}>I2C / GPIO / ADC</span>
        </div>
        <div className="sensor-chips-row">
          {sensorEntries.map(([hardware, h]) => {
            const isOk = h.state === 'OK';
            return (
              <div
                key={hardware}
                className={`sensor-chip-item ${isOk ? 'chip-ok' : 'chip-err'}`}
                title={`${hardware} (${h.name}): ${h.state}`}
              >
                <div style={{ fontWeight: 800 }}>{hardware}</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.9, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  {isOk ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                  {isOk ? 'OK' : 'ERR'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
