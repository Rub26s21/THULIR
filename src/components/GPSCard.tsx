// ============================================================
// THULIR AI — 3D Node Location & GNSS Spatial Intelligence
// ============================================================
// High-tactility GNSS positioning module with satellite signal radar,
// 3-axis spatial coordinate wells (Latitude, Longitude, Altitude), and precision beacons.

import { Compass, Satellite, Radio, Globe, Navigation } from 'lucide-react';
import type { NodeRecord } from '../types';

interface GPSCardProps {
  node: NodeRecord | null;
}

export function GPSCard({ node }: GPSCardProps) {
  const hasFix = node?.gps_fix && node.gps_fix !== 'NONE' && node.latitude !== null && node.longitude !== null;
  const satCount = node?.gps_satellites ?? 0;

  return (
    <div
      className="individual-overview-3d-card gnss-spatial-chassis"
      role="region"
      aria-label="Node Location Intelligence"
      style={{ '--card-theme-color': '#0284C7' } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div className="card-top-bezel" style={{ background: 'linear-gradient(135deg, #075985 0%, #0284C7 50%, #38BDF8 100%)' }}>
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Compass size={17} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">NODE LOCATION &amp; GNSS POSITIONING</span>
            <span className="card-chip-sub">GY-GPS6MV2 · SPATIAL TRIAD</span>
          </div>
        </div>

        <div className="bezel-right">
          <div className="gnss-sat-fix-pill">
            <Satellite size={12} color={hasFix ? '#38BDF8' : '#94A3B8'} />
            <span className="sat-count">{satCount} SATS</span>
            <span className={`fix-tag ${hasFix ? 'has-fix' : 'no-fix'}`}>
              {node?.gps_fix || 'NO FIX'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Coordinate Triad Body */}
      <div className="overview-card-body">
        {/* 3-Axis Coordinate Wells */}
        <div className="gnss-coordinate-triad">
          {/* Y Axis: Latitude */}
          <div className="coord-axis-well lat">
            <div className="axis-well-head">
              <span className="axis-badge lat">Y-AXIS</span>
              <span className="axis-title">LATITUDE</span>
            </div>
            <div className="coord-val">
              {node?.latitude !== null && node?.latitude !== undefined ? `${node.latitude.toFixed(5)}°` : '—'}
            </div>
            <span className="coord-sub">North / South Geodetic</span>
          </div>

          {/* X Axis: Longitude */}
          <div className="coord-axis-well lon">
            <div className="axis-well-head">
              <span className="axis-badge lon">X-AXIS</span>
              <span className="axis-title">LONGITUDE</span>
            </div>
            <div className="coord-val">
              {node?.longitude !== null && node?.longitude !== undefined ? `${node.longitude.toFixed(5)}°` : '—'}
            </div>
            <span className="coord-sub">East / West Geodetic</span>
          </div>

          {/* Z Axis: Altitude */}
          <div className="coord-axis-well alt">
            <div className="axis-well-head">
              <span className="axis-badge alt">Z-AXIS</span>
              <span className="axis-title">ALTITUDE</span>
            </div>
            <div className="coord-val">
              {node?.altitude !== null && node?.altitude !== undefined ? `${node.altitude.toFixed(1)}m` : '—'}
            </div>
            <span className="coord-sub">Mean Sea Level (MSL)</span>
          </div>
        </div>

        {/* Spatial Geodetic Notice Banner */}
        <div className="gnss-radar-meta-strip">
          <div className="radar-notice-left">
            <Navigation size={13} color="#0284C7" />
            <span>
              <strong>Surface &amp; Subsurface Mapping:</strong> Triad coordinates (X: Lon, Y: Lat, Z: Alt) lock ground surface elevation.
            </span>
          </div>
          <div className="radar-notice-right">
            <Globe size={12} />
            <span>WGS-84 DATUM</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Radio size={11} className="spin-slow" />
          <span>ONBOARD GNSS RECEIVER: GY-GPS6MV2 ACTIVE</span>
        </div>
        <span className="footer-clock-tag">{node?.node_id || 'NODE_01'} LOCK</span>
      </div>
    </div>
  );
}
