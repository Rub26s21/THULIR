// ============================================================
// THULIR AI — 3D Skeuomorphic Node Intelligence & Diagnostics
// ============================================================
// High-tactility edge diagnostics chassis with metallic corner screws,
// diagnostic HUD meters, and realistic physical IC chip sockets with gold pins.

import { formatTimeAgo } from '../utils/timeUtils';
import { Cpu, AlertCircle, CheckCircle2, Radio, Server, Activity } from 'lucide-react';
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
    freshness === 'LIVE'   ? '#10B981' :
    freshness === 'RECENT' ? '#0284C7' :
    '#F59E0B';

  return (
    <div
      className="individual-overview-3d-card diagnostics-chassis"
      role="region"
      aria-label="Node Diagnostics & Health"
      style={{ '--card-theme-color': '#0284C7' } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div className="card-top-bezel" style={{ background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #0EA5E9 100%)' }}>
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Cpu size={17} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">NODE INTELLIGENCE &amp; DIAGNOSTICS</span>
            <span className="card-chip-sub">{node_id} · HARDWARE TELEMETRY BUS</span>
          </div>
        </div>

        <div className="bezel-right">
          <div className={`node-online-badge ${online ? 'online' : 'offline'}`}>
            <span className="status-beacon-dot" style={{
              background: online ? '#10B981' : '#64748B',
              boxShadow: online ? '0 0 8px #10B981' : 'none'
            }} />
            {online ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* Main Diagnostics Body */}
      <div className="overview-card-body">
        {/* Stale Warning Banner if applicable */}
        {isStale && (
          <div className="diagnostics-stale-alert">
            <AlertCircle size={15} color="#F59E0B" />
            <span>
              <strong>STALE TELEMETRY:</strong> No packets in &gt;60s — last heartbeat recorded {lastSeenTime}.
            </span>
          </div>
        )}

        {/* 2×2 Diagnostics Gauge Wells */}
        <div className="diagnostics-meter-grid">
          <div className="diag-well">
            <div className="diag-lbl">DATA FRESHNESS</div>
            <div className="diag-val" style={{ color: freshnessColor }}>
              <Radio size={12} className="spin-slow" />
              <span>{freshness}</span>
            </div>
          </div>

          <div className="diag-well">
            <div className="diag-lbl">LAST TRANSMISSION</div>
            <div className="diag-val time">{lastSeenTime}</div>
          </div>

          <div className="diag-well">
            <div className="diag-lbl">SENSORS ONLINE</div>
            <div className="diag-val" style={{ color: healthyCount === totalCount ? '#10B981' : '#F59E0B' }}>
              <Activity size={12} />
              <span>{healthyCount} / {totalCount} Nominal</span>
            </div>
          </div>

          <div className="diag-well">
            <div className="diag-lbl">POWER / BUS RAIL</div>
            <div className="diag-val bus">5V USB · I2C+GPIO</div>
          </div>
        </div>

        {/* Physical Hardware IC Chip Socket Array */}
        <div className="hardware-ic-array-section">
          <div className="ic-array-header">
            <span className="ic-title">PHYSICAL HARDWARE SENSOR IC SOCKETS</span>
            <span className="ic-sub">I2C / GPIO / ADC BUS</span>
          </div>

          <div className="ic-chips-row">
            {sensorEntries.map(([hardware, h]) => {
              const isOk = h.state === 'OK';
              return (
                <div
                  key={hardware}
                  className={`micro-ic-socket ${isOk ? 'socket-ok' : 'socket-err'}`}
                  title={`${hardware} (${h.name}): ${h.state}`}
                >
                  <div className="ic-gold-pins top" />
                  <div className="ic-body">
                    <span className="ic-hw-name">{hardware}</span>
                    <div className="ic-status-indicator">
                      {isOk ? <CheckCircle2 size={9} color="#10B981" /> : <AlertCircle size={9} color="#EF4444" />}
                      <span>{isOk ? 'OK' : 'ERR'}</span>
                    </div>
                  </div>
                  <div className="ic-gold-pins bottom" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Server size={11} />
          <span>MICROCONTROLLER: ESP32 DUAL-CORE 240MHz</span>
        </div>
        <span className="footer-clock-tag">FIRMWARE: THULIR-v2.4</span>
      </div>
    </div>
  );
}
