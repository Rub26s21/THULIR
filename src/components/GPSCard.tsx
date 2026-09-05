// ============================================================
// THULIR AI — Node Location Intelligence (GNSS Metadata)
// ============================================================
// Displays geospatial telemetry from onboard GNSS receiver (GY-GPS6MV2)
// with explicit precision disclaimers.

import { Compass, Satellite, MapPin } from 'lucide-react';
import type { NodeRecord } from '../types';

interface GPSCardProps {
  node: NodeRecord | null;
}

export function GPSCard({ node }: GPSCardProps) {
  const hasFix = node?.gps_fix && node.gps_fix !== 'NONE' && node.latitude !== null && node.longitude !== null;

  return (
    <div className="clay-card" role="region" aria-label="Node Location Intelligence">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Compass size={17} color="var(--brand-green)" strokeWidth={2} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Node Location Intelligence</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>GNSS · {node?.node_id || 'NODE_01'}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: hasFix ? 'var(--status-normal)' : 'var(--text-muted)',
          }}
        >
          <Satellite size={13} />
          <span>{node?.gps_satellites ?? 0} SATS</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 3,
              backgroundColor: hasFix ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${hasFix ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              fontWeight: 700,
            }}
          >
            FIX: {node?.gps_fix || 'NONE'}
          </span>
        </div>
      </div>

      {/* Coordinate Display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div className="skeuo-well" style={{ padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LATITUDE</div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: node?.latitude !== null ? 'var(--text-primary)' : 'var(--text-muted)',
              marginTop: 3,
            }}
          >
            {node?.latitude !== null && node?.latitude !== undefined ? node.latitude.toFixed(5) : '—'}
          </div>
        </div>

        <div className="skeuo-well" style={{ padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LONGITUDE</div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: node?.longitude !== null ? 'var(--text-primary)' : 'var(--text-muted)',
              marginTop: 3,
            }}
          >
            {node?.longitude !== null && node?.longitude !== undefined ? node.longitude.toFixed(5) : '—'}
          </div>
        </div>

        <div className="skeuo-well" style={{ padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ALTITUDE</div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: node?.altitude !== null ? 'var(--text-primary)' : 'var(--text-muted)',
              marginTop: 3,
            }}
          >
            {node?.altitude !== null && node?.altitude !== undefined ? `${node.altitude.toFixed(1)}m` : '—'}
          </div>
        </div>
      </div>

      {/* Geospatial Clarification / Disclosure */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 6,
          backgroundColor: 'rgba(0, 229, 255, 0.04)',
          border: '1px solid rgba(0, 229, 255, 0.15)',
          fontSize: '0.68rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}
      >
        <MapPin size={14} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Geospatial Positioning: </span>
          Standard GNSS (GY-GPS6MV2) provides surface node geospatial identification. Subsidence detection is driven by subsurface MEMS tilt &amp; displacement. RTK-GNSS is planned for high-precision surface kinematic tracking.
        </div>
      </div>
    </div>
  );
}
