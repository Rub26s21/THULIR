// ============================================================
// THULIR AI — Node Location Intelligence (GNSS Metadata)
// ============================================================
// Displays geospatial telemetry from onboard GNSS receiver (GY-GPS6MV2)
// with explicit precision disclaimers and X, Y, Z coordinates.

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
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>GNSS · Spatial Coordinates · {node?.node_id || 'NODE_01'}</div>
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
              borderRadius: 4,
              backgroundColor: hasFix ? 'var(--status-normal-bg)' : 'var(--bg-well)',
              border: `1px solid ${hasFix ? 'var(--status-normal-border)' : 'var(--border-subtle)'}`,
              fontWeight: 700,
            }}
          >
            FIX: {node?.gps_fix || 'NONE'}
          </span>
        </div>
      </div>

      {/* Coordinate Display (X, Y, Z Position) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 12,
        }}
      >
        {/* Y Axis: Latitude */}
        <div className="clay-well" style={{ padding: '12px 10px', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{
              fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 3,
              background: 'rgba(8, 126, 164, 0.15)', color: '#087EA4', fontFamily: 'var(--font-mono)'
            }}>
              Y-AXIS
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>LATITUDE</span>
          </div>
          <div
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: node?.latitude !== null && node?.latitude !== undefined ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {node?.latitude !== null && node?.latitude !== undefined ? `${node.latitude.toFixed(5)}°` : '—'}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: 2 }}>North / South</div>
        </div>

        {/* X Axis: Longitude */}
        <div className="clay-well" style={{ padding: '12px 10px', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{
              fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 3,
              background: 'rgba(15, 107, 87, 0.15)', color: 'var(--brand-green)', fontFamily: 'var(--font-mono)'
            }}>
              X-AXIS
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>LONGITUDE</span>
          </div>
          <div
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: node?.longitude !== null && node?.longitude !== undefined ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {node?.longitude !== null && node?.longitude !== undefined ? `${node.longitude.toFixed(5)}°` : '—'}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: 2 }}>East / West</div>
        </div>

        {/* Z Axis: Altitude */}
        <div className="clay-well" style={{ padding: '12px 10px', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{
              fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 3,
              background: 'rgba(93, 64, 55, 0.15)', color: '#8D6E63', fontFamily: 'var(--font-mono)'
            }}>
              Z-AXIS
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>ALTITUDE</span>
          </div>
          <div
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: node?.altitude !== null && node?.altitude !== undefined ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {node?.altitude !== null && node?.altitude !== undefined ? `${node.altitude.toFixed(1)}m` : '—'}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: 2 }}>Elevation (MSL)</div>
        </div>
      </div>

      {/* Geospatial Clarification / Disclosure */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 10,
          backgroundColor: 'var(--brand-blue-tint)',
          border: '1px solid var(--brand-blue-border)',
          fontSize: '0.68rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
        }}
      >
        <MapPin size={14} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <span style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>Geospatial Positioning: </span>
          Surface coordinate triad (X: Lon, Y: Lat, Z: Alt). Ground subsidence and angular deformation are tracked subsurface via MPU6050 inclination and HC-SR04 displacement.
        </div>
      </div>
    </div>
  );
}
