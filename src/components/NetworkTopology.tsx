// ============================================================
// THULIR - Ultra-Premium Chromatic Node & Network Topology
// ============================================================

import { Network, Database, Cpu } from 'lucide-react';
import type { ConnectionType, FreshnessState } from '../types';

interface NetworkTopologyProps {
  connectionType: ConnectionType;
  freshness: FreshnessState;
  supabaseConnected: boolean;
}

const HARDWARE_SENSORS = [
  { chip: 'MPU6050', role: 'Tilt X/Y', bus: 'I2C', color: '#06b6d4' },
  { chip: 'BMP280', role: 'Pressure', bus: 'I2C', color: '#3b82f6' },
  { chip: 'DHT22', role: 'Temp/Hum', bus: 'GPIO', color: '#10b981' },
  { chip: 'MQ-2', role: 'Gas ADC', bus: 'A0', color: '#f59e0b' },
  { chip: 'HC-SR04', role: 'Distance', bus: 'GPIO', color: '#f97316' },
  { chip: 'ADXL345', role: 'Vibration', bus: 'I2C', color: '#ec4899' },
];

export function NetworkTopology({ connectionType, freshness, supabaseConnected }: NetworkTopologyProps) {
  const isOnline = freshness === 'LIVE' || freshness === 'RECENT';

  return (
    <div className="skeuo-card" role="region" aria-label="Network and Node Topology">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Network size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            System Topology &amp; Transport
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          6 SENSORS → NODE_01 → SUPABASE → REACT
        </span>
      </div>

      {/* Visual Pipeline Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Tier 1 & 2: Cloud & Node */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: 8 }}>
          {/* React Dashboard Node */}
          <div className="skeuo-well" style={{ textAlign: 'center', borderTop: '2px solid #06b6d4' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>THULIR DASHBOARD</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>macOS UI (React 19)</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--status-normal)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span className="pulse-dot dot-green" /> Client Active
            </div>
          </div>

          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textAlign: 'center', fontWeight: 700 }}>◀───▶</div>

          {/* Supabase Cloud */}
          <div className="skeuo-well" style={{ textAlign: 'center', borderTop: '2px solid #10b981' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--status-normal)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Database size={12} /> SUPABASE
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {connectionType === 'REALTIME' ? 'Postgres Realtime' : 'REST Polling (5s)'}
            </div>
            <div style={{ fontSize: '0.65rem', color: supabaseConnected ? 'var(--status-normal)' : 'var(--status-watch)', marginTop: 4, fontWeight: 600 }}>
              {supabaseConnected ? '● Connected' : '● Standby'}
            </div>
          </div>

          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textAlign: 'center', fontWeight: 700 }}>◀───</div>

          {/* ESP8266 NODE_01 */}
          <div className="skeuo-well" style={{ textAlign: 'center', borderTop: '2px solid #8b5cf6' }}>
            <div style={{ fontSize: '0.74rem', color: '#a855f7', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Cpu size={12} /> NODE_01
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>ESP8266 Wi-Fi HTTPS</div>
            <div style={{ fontSize: '0.65rem', color: isOnline ? 'var(--status-normal)' : 'var(--status-offline)', marginTop: 4, fontWeight: 600 }}>
              {isOnline ? '● Online (5s Tx)' : '● Offline'}
            </div>
          </div>
        </div>

        {/* Connected Physical Sensors */}
        <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Hardware Sensor Interfaces</span>
            <span style={{ color: 'var(--text-dim)' }}>6 Physical Chips</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {HARDWARE_SENSORS.map(s => (
              <div
                key={s.chip}
                className="skeuo-well"
                style={{
                  padding: '7px 4px',
                  textAlign: 'center',
                  borderTop: `2px solid ${s.color}`,
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.chip}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.role}</div>
                <div style={{ fontSize: '0.6rem', color: s.color, marginTop: 2, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
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
