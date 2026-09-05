// ============================================================
// THULIR AI — Intelligence Pipeline & Ingestion Architecture
// ============================================================

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
  { chip: 'MPU6050', role: 'Tilt X/Y', bus: 'I2C (0x68)', color: '#00e5ff' },
  { chip: 'BMP280', role: 'Pressure', bus: 'I2C (0x76)', color: '#3b82f6' },
  { chip: 'DHT22', role: 'Temp/Hum', bus: 'GPIO D4', color: '#10b981' },
  { chip: 'MQ-2', role: 'Gas ADC', bus: 'ADC A0', color: '#f59e0b' },
  { chip: 'HC-SR04', role: 'Displacement', bus: 'GPIO D5/D6', color: '#f97316' },
  { chip: 'ADXL345', role: 'Vibration', bus: 'I2C (0x53)', color: '#ec4899' },
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
    <div className="clay-card" role="region" aria-label="Intelligence Pipeline and Ingestion Architecture">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={17} color="var(--brand-green)" strokeWidth={2} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Intelligence Pipeline</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>Sensor → {activeNodeId} → Supabase → THULIR AI</div>
          </div>
        </div>
      </div>

      {/* Main Pipeline Flow with Traveling Light Pulses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Tier 1 & 2 Architecture */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 1fr 70px 1fr', alignItems: 'center', gap: 6 }}>
          {/* React Dashboard Node */}
          <div
            className="skeuo-well"
            style={{
              textAlign: 'center',
              borderTop: '2px solid #00e5ff',
              boxShadow: '0 0 16px rgba(0, 229, 255, 0.15)',
              padding: '12px 8px',
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Monitor size={14} /> SOC CONSOLE
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>React 19 Frontend</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--status-normal)', marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span className="pulse-dot dot-cyan" /> CLIENT READY
            </div>
          </div>

          {/* SVG Animated Connector: Dashboard <-> Supabase */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
              <line
                x1="4"
                y1="14"
                x2="66"
                y2="14"
                stroke={isTransmitting ? '#00e5ff' : 'rgba(107, 114, 128, 0.35)'}
                strokeWidth="2"
                strokeDasharray={isTransmitting ? '4, 4' : '3, 3'}
                className={isTransmitting ? 'topology-flow-line' : ''}
              />
              {/* Traveling Packet Pulse */}
              {isTransmitting && (
                <circle cx="20" cy="14" r="3.5" fill="#00e5ff">
                  <animate
                    attributeName="cx"
                    from="4"
                    to="66"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.2;1;0.2"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>
          </div>

          {/* Supabase Cloud */}
          <div
            className="skeuo-well"
            style={{
              textAlign: 'center',
              borderTop: '2px solid #10b981',
              boxShadow: supabaseConnected ? '0 0 16px rgba(16, 185, 129, 0.15)' : undefined,
              padding: '12px 8px',
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--status-normal)', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Database size={14} /> SUPABASE
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {connectionType === 'REALTIME' ? 'Postgres Realtime' : 'REST Ingestion (5s)'}
            </div>
            <div style={{ fontSize: '0.66rem', color: supabaseConnected ? 'var(--status-normal)' : 'var(--status-watch)', marginTop: 5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {supabaseConnected ? '● CLOUD SYNCED' : '● STANDBY'}
            </div>
          </div>

          {/* SVG Animated Connector: Supabase <-> Node */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
              <line
                x1="66"
                y1="14"
                x2="4"
                y2="14"
                stroke={isOnline ? '#7c5cff' : 'rgba(107, 114, 128, 0.35)'}
                strokeWidth="2"
                strokeDasharray={isOnline ? '4, 4' : '3, 3'}
                className={isOnline ? 'topology-flow-line' : ''}
              />
              {/* Traveling Packet Pulse (Node -> Supabase) */}
              {isOnline && (
                <circle cx="50" cy="14" r="3.5" fill="#7c5cff">
                  <animate
                    attributeName="cx"
                    from="66"
                    to="4"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.2;1;0.2"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>
          </div>

          {/* Active Sensor Node */}
          <div
            className="skeuo-well"
            style={{
              textAlign: 'center',
              borderTop: '2px solid #7c5cff',
              boxShadow: isOnline ? '0 0 16px rgba(124, 92, 255, 0.2)' : undefined,
              padding: '12px 8px',
            }}
          >
            <div style={{ fontSize: '0.76rem', color: '#a855f7', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Cpu size={14} /> {activeNodeId}
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {activeNodeId === 'NODE_01' ? 'ESP8266 Wi-Fi HTTPS' : 'Mesh Sensor Node'}
            </div>
            <div style={{ fontSize: '0.66rem', color: isOnline ? 'var(--status-normal)' : 'var(--status-offline)', marginTop: 5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {isOnline ? '● 5s TX ACTIVE' : '● OFFLINE'}
            </div>
          </div>
        </div>

        {/* Mesh Links Status Sub-panel */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            backgroundColor: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <Radio size={13} color="var(--accent-cyan)" />
            <span>WIRELESS MESH TOPOLOGY:</span>
            <span style={{ color: nodeLinks.length > 0 ? 'var(--status-normal)' : 'var(--text-secondary)' }}>
              {nodeLinks.length > 0 ? `${nodeLinks.length} Active Relay Links` : 'Direct Star / Gateway Uplink'}
            </span>
          </div>

          <div style={{ color: 'var(--text-muted)' }}>
            BACKHAUL: 2.4 GHz 802.11 b/g/n &bull; LORA EXTENSION READY
          </div>
        </div>

        {/* Connected Physical Sensors Matrix */}
        <div style={{ marginTop: 2, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
            <span>Hardware Sensor Bus Array ({activeNodeId})</span>
            <span style={{ color: 'var(--accent-cyan)' }}>6 Physical Chips Integrated</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {HARDWARE_SENSORS.map(s => (
              <div
                key={s.chip}
                className="skeuo-well"
                style={{
                  padding: '9px 6px',
                  textAlign: 'center',
                  borderTop: `2px solid ${s.color}`,
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.chip}</div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.role}</div>
                <div style={{ fontSize: '0.6rem', color: s.color, marginTop: 3, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {s.bus}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
