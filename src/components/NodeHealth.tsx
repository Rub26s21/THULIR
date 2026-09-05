// ============================================================
// THULIR AI — Node Intelligence (Hardware Health & Diagnostics)
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

  const freshnessColor =
    freshness === 'LIVE'   ? 'var(--status-normal)' :
    freshness === 'RECENT' ? 'var(--brand-blue)' :
    'var(--status-watch)';

  return (
    <div className="clay-card" role="region" aria-label="Node health and connectivity">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={16} color="var(--brand-green)" strokeWidth={2} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Node Intelligence
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
              {node_id} Diagnostics
            </div>
          </div>
        </div>
        <div className={`skeuo-pill ${online ? 'pill-online' : 'pill-offline'}`}>
          <span className={`pulse-dot ${online ? 'dot-green' : 'dot-gray'}`} />
          {online ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      {/* Stale Warning */}
      {isStale && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px',
          background: 'var(--status-watch-bg)', border: '1px solid var(--status-watch-border)',
          borderRadius: 10, marginBottom: 12, fontSize: '0.72rem', color: 'var(--status-watch)',
          fontFamily: 'var(--font-mono)',
        }}>
          <AlertCircle size={13} />
          <span><strong>STALE:</strong> No telemetry in &gt;60s — last reading {lastSeenTime}.</span>
        </div>
      )}

      {/* 2×2 Stats Grid */}
      <div className="node-health-grid">
        <div className="node-stat-box">
          <div className="node-stat-label">Data Freshness</div>
          <div className="node-stat-val" style={{ color: freshnessColor }}>{freshness}</div>
        </div>
        <div className="node-stat-box">
          <div className="node-stat-label">Last Transmission</div>
          <div className="node-stat-val" style={{ fontSize: '0.82rem' }}>{lastSeenTime}</div>
        </div>
        <div className="node-stat-box">
          <div className="node-stat-label">Sensors Healthy</div>
          <div className="node-stat-val" style={{ color: healthyCount === totalCount ? 'var(--status-normal)' : 'var(--status-watch)' }}>
            {healthyCount} / {totalCount} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Nominal</span>
          </div>
        </div>
        <div className="node-stat-box">
          <div className="node-stat-label">Power / Bus</div>
          <div className="node-stat-val" style={{ fontSize: '0.75rem', fontWeight: 600 }}>5V USB · I2C+GPIO</div>
        </div>
      </div>

      {/* Sensor Chip Status Row */}
      <div style={{ marginTop: 4 }}>
        <div style={{
          fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase',
          fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
        }}>
          <span>Hardware Sensor Array</span>
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
                <div style={{ fontWeight: 700 }}>{hardware}</div>
                <div style={{ fontSize: '0.6rem', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
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
