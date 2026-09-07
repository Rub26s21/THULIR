// ============================================================
// THULIR AI — Intelligence Pipeline & Ingestion Architecture
// ============================================================
// Elegant, warm-neutral architectural pipeline visualization.

import { Network, Database, Cpu, Monitor, Radio } from 'lucide-react';
import type { ConnectionType, FreshnessState, NodeLink } from '../types';

interface NetworkTopologyProps {
  connectionType: ConnectionType;
  freshness: FreshnessState;
  supabaseConnected: boolean;
  activeNodeId?: string;
  nodeLinks?: NodeLink[];
}

const HARDWARE_SENSORS = [
  { chip: 'MPU6050', role: 'Tilt X/Y', bus: 'I2C · 0x68' },
  { chip: 'BMP280', role: 'Pressure', bus: 'I2C · 0x76' },
  { chip: 'DHT22', role: 'Temp / Humidity', bus: 'GPIO · D4' },
  { chip: 'MQ-2', role: 'Gas / Smoke', bus: 'ADC · A0' },
  { chip: 'HC-SR04', role: 'Displacement', bus: 'GPIO · D5/D6' },
  { chip: 'ADXL345', role: 'Vibration', bus: 'I2C · 0x53' },
];

export function NetworkTopology({
  connectionType,
  freshness,
  supabaseConnected,
  activeNodeId = 'NODE_01',
  nodeLinks = [],
}: NetworkTopologyProps) {
  const isOnline = freshness === 'LIVE' || freshness === 'RECENT';
  const isTransmitting = isOnline || connectionType === 'REALTIME';

  return (
    <div className="clay-card warm-pipeline-card" role="region" aria-label="Intelligence Pipeline and Ingestion Architecture">
      {/* Header */}
      <div className="pipeline-card-header">
        <div className="pipeline-header-title-group">
          <div className="pipeline-icon-badge">
            <Network size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="pipeline-title-text">Distributed Intelligence Pipeline</div>
            <div className="pipeline-sub-text">Sensor Array → {activeNodeId} Edge Compute → Supabase Cloud → THULIR SOC</div>
          </div>
        </div>
        <div className="pipeline-status-badge">
          <span className={`status-dot-subtle ${isOnline ? 'active' : 'standby'}`} />
          <span>{isOnline ? 'MESH ACTIVE' : 'AWAITING TELEMETRY'}</span>
        </div>
      </div>

      {/* Main Pipeline Flow: 3 Stages */}
      <div className="pipeline-stages-container">
        <div className="pipeline-flow-grid">
          {/* Tier 1: React Dashboard Node */}
          <div className="pipeline-node-box">
            <div className="node-box-header">
              <Monitor size={14} strokeWidth={2} />
              <span>SOC CONSOLE</span>
            </div>
            <div className="node-box-sub">React 19 Operator Desk</div>
            <div className="node-box-status ready">
              <span className="node-mini-dot" /> CLIENT READY
            </div>
          </div>

          {/* SVG Animated Connector 1 */}
          <div className="pipeline-connector-cell">
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="pipeline-connector-svg">
              <line
                x1="2"
                y1="12"
                x2="58"
                y2="12"
                stroke="var(--border-strong)"
                strokeWidth="2"
                strokeDasharray={isTransmitting ? '4, 4' : '2, 3'}
                className={isTransmitting ? 'topology-flow-line' : ''}
              />
              {isTransmitting && (
                <circle cx="15" cy="12" r="3" fill="var(--text-secondary)">
                  <animate
                    attributeName="cx"
                    from="4"
                    to="56"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>
          </div>

          {/* Tier 2: Supabase Cloud */}
          <div className="pipeline-node-box">
            <div className="node-box-header">
              <Database size={14} strokeWidth={2} />
              <span>SUPABASE</span>
            </div>
            <div className="node-box-sub">
              {connectionType === 'REALTIME' ? 'Postgres Realtime' : 'REST Ingestion (5s)'}
            </div>
            <div className={`node-box-status ${supabaseConnected ? 'ready' : 'standby'}`}>
              <span className="node-mini-dot" /> {supabaseConnected ? 'CLOUD SYNCED' : 'STANDBY'}
            </div>
          </div>

          {/* SVG Animated Connector 2 */}
          <div className="pipeline-connector-cell">
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="pipeline-connector-svg">
              <line
                x1="58"
                y1="12"
                x2="2"
                y2="12"
                stroke="var(--border-strong)"
                strokeWidth="2"
                strokeDasharray={isOnline ? '4, 4' : '2, 3'}
                className={isOnline ? 'topology-flow-line' : ''}
              />
              {isOnline && (
                <circle cx="45" cy="12" r="3" fill="var(--text-secondary)">
                  <animate
                    attributeName="cx"
                    from="56"
                    to="4"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>
          </div>

          {/* Tier 3: Active Sensor Node */}
          <div className="pipeline-node-box">
            <div className="node-box-header">
              <Cpu size={14} strokeWidth={2} />
              <span>{activeNodeId}</span>
            </div>
            <div className="node-box-sub">
              {activeNodeId === 'NODE_01' ? 'ESP8266 Wi-Fi Node' : 'Mine Mesh Node'}
            </div>
            <div className={`node-box-status ${isOnline ? 'ready' : 'standby'}`}>
              <span className="node-mini-dot" /> {isOnline ? 'TELEMETRY LIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        {/* Mesh Links Status Sub-panel */}
        <div className="pipeline-mesh-bar">
          <div className="mesh-info-left">
            <Radio size={13} strokeWidth={2.2} />
            <span className="mesh-lbl">WIRELESS TOPOLOGY:</span>
            <span className="mesh-val">
              {nodeLinks.length > 0 ? `${nodeLinks.length} Active Relay Links` : 'Direct Star / Gateway Uplink'}
            </span>
          </div>
          <div className="mesh-info-right">
            BACKHAUL: 2.4 GHz 802.11 b/g/n &bull; LORA EXPANSION READY
          </div>
        </div>

        {/* Connected Physical Sensors Matrix */}
        <div className="pipeline-sensors-section">
          <div className="sensors-section-header">
            <span className="sensors-section-title">Hardware Sensor Bus Matrix ({activeNodeId})</span>
            <span className="sensors-section-count">6 Integrated Physical Chips</span>
          </div>

          <div className="sensors-chip-grid">
            {HARDWARE_SENSORS.map((s) => (
              <div key={s.chip} className="sensor-chip-card">
                <div className="chip-name">{s.chip}</div>
                <div className="chip-role">{s.role}</div>
                <div className="chip-bus">{s.bus}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
