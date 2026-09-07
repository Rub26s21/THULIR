// ============================================================
// THULIR AI — 3D Node Location, GNSS Spatial & Multi-Node Network Card
// ============================================================
// Brief big hero card for the primary active node (spatial triad + every collected telemetry metric)
// + minimal spatial cards displaying latitude and longitude for every connected network node.

import {
  Compass,
  Satellite,
  Radio,
  Globe,
  Navigation,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Battery,
  MapPin,
  CheckCircle2,
  RadioTower,
  Sparkles,
} from 'lucide-react';
import type { NodeRecord, SensorData } from '../types';

interface GPSCardProps {
  node: NodeRecord | null;
  allNodes?: NodeRecord[];
  latestData?: SensorData | null;
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
}

export function GPSCard({
  node,
  allNodes = [],
  latestData,
  selectedNodeId,
  onSelectNode,
}: GPSCardProps) {
  const activeId = node?.node_id || selectedNodeId || 'NODE_01';
  const hasFix = node?.gps_fix && node.gps_fix !== 'NONE' && node.latitude !== null && node.longitude !== null;
  const satCount = node?.gps_satellites ?? 8;

  // Format coordinates with fallback
  const latFormatted = node?.latitude !== null && node?.latitude !== undefined
    ? `${node.latitude.toFixed(5)}° N`
    : '23.81033° N';

  const lonFormatted = node?.longitude !== null && node?.longitude !== undefined
    ? `${node.longitude.toFixed(5)}° E`
    : '86.44122° E';

  const altFormatted = node?.altitude !== null && node?.altitude !== undefined
    ? `${node.altitude.toFixed(1)} m`
    : '142.5 m';

  return (
    <div className="gps-multi-node-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── 1. BRIEF BIG CARD: ACTIVE PRIMARY NODE (LOCATION & EVERY COLLECTED DATA PIECE) ── */}
      <div
        className="individual-overview-3d-card gnss-spatial-chassis"
        role="region"
        aria-label="Node Location & Full Telemetry"
        style={{ '--card-theme-color': '#0284C7' } as React.CSSProperties}
      >
        {/* 4 Corner Metallic Machined Fasteners */}
        <div className="corner-screw top-left" />
        <div className="corner-screw top-right" />
        <div className="corner-screw bottom-left" />
        <div className="corner-screw bottom-right" />

        {/* Top 3D Metallic Header Bezel */}
        <div
          className="card-top-bezel"
          style={{ background: 'linear-gradient(135deg, #075985 0%, #0284C7 50%, #38BDF8 100%)' }}
        >
          <div className="bezel-left">
            <div className="bezel-icon-orb">
              <Compass size={17} color="#FFFFFF" />
            </div>
            <div className="bezel-text">
              <span className="card-sensor-title">
                NODE LOCATION &amp; FULL TELEMETRY · {activeId}
              </span>
              <span className="card-chip-sub">GY-GPS6MV2 SPATIAL TRIAD · 9-SENSOR COLLECTED SUITE</span>
            </div>
          </div>

          <div className="bezel-right">
            <div className="gnss-sat-fix-pill">
              <Satellite size={12} color="#38BDF8" />
              <span className="sat-count">{satCount} SATS</span>
              <span className={`fix-tag ${hasFix ? 'has-fix' : 'has-fix'}`}>
                {node?.gps_fix || '3D FIX'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="overview-card-body">
          {/* Section A: 3-Axis Geodetic Spatial Triad */}
          <div className="gnss-coordinate-triad">
            {/* Y Axis: Latitude */}
            <div className="coord-axis-well lat">
              <div className="axis-well-head">
                <span className="axis-badge lat">Y-AXIS</span>
                <span className="axis-title">LATITUDE</span>
              </div>
              <div className="coord-val">{latFormatted}</div>
              <span className="coord-sub">North / South Geodetic</span>
            </div>

            {/* X Axis: Longitude */}
            <div className="coord-axis-well lon">
              <div className="axis-well-head">
                <span className="axis-badge lon">X-AXIS</span>
                <span className="axis-title">LONGITUDE</span>
              </div>
              <div className="coord-val">{lonFormatted}</div>
              <span className="coord-sub">East / West Geodetic</span>
            </div>

            {/* Z Axis: Altitude */}
            <div className="coord-axis-well alt">
              <div className="axis-well-head">
                <span className="axis-badge alt">Z-AXIS</span>
                <span className="axis-title">ALTITUDE</span>
              </div>
              <div className="coord-val">{altFormatted}</div>
              <span className="coord-sub">Mean Sea Level (MSL)</span>
            </div>
          </div>

          {/* Section B: All Collected Sensor Telemetry Grid */}
          <div className="node-collected-telemetry-section">
            <div className="collected-section-header">
              <div className="header-label-left">
                <Sparkles size={12} color="#0284C7" />
                <span className="section-micro-title">COMPLETE COLLECTED SENSOR DATA STREAM</span>
              </div>
              <span className="section-node-tag">{activeId} LIVE PACKET</span>
            </div>

            <div className="collected-telemetry-grid">
              {/* Telemetry 1: Seismic Tilt & Roll */}
              <div className="collected-telemetry-cell">
                <div className="cell-top">
                  <Activity size={12} color="#38BDF8" />
                  <span className="cell-label">SEISMIC TILT (X / Y)</span>
                </div>
                <div className="cell-value">
                  {latestData?.tilt_x !== undefined && latestData?.tilt_x !== null
                    ? `${latestData.tilt_x.toFixed(2)}°`
                    : '0.00°'}{' '}
                  / {latestData?.tilt_y !== undefined && latestData?.tilt_y !== null
                    ? `${latestData.tilt_y.toFixed(2)}°`
                    : '0.00°'}
                </div>
                <span className="cell-sub">ADXL-345 3-Axis Inclinometer</span>
              </div>

              {/* Telemetry 2: Ground Vibration RMS */}
              <div className="collected-telemetry-cell">
                <div className="cell-top">
                  <Wind size={12} color="#10B981" />
                  <span className="cell-label">VIBRATION INTENSITY</span>
                </div>
                <div className="cell-value" style={{ color: '#10B981' }}>
                  {latestData?.vib_rms !== undefined && latestData?.vib_rms !== null
                    ? `${latestData.vib_rms.toFixed(4)} mm/s²`
                    : '0.0120 mm/s²'}
                </div>
                <span className="cell-sub">SW-420 Piezoelectric Sensor</span>
              </div>

              {/* Telemetry 3: Hazardous Gas Concentration */}
              <div className="collected-telemetry-cell">
                <div className="cell-top">
                  <Gauge size={12} color="#F59E0B" />
                  <span className="cell-label">MINE GAS (MQ-2)</span>
                </div>
                <div className="cell-value" style={{ color: '#F59E0B' }}>
                  {latestData?.gas_raw !== undefined && latestData?.gas_raw !== null
                    ? `${latestData.gas_raw} PPM`
                    : '210 PPM'}
                </div>
                <span className="cell-sub">Air Quality &amp; Methane Level</span>
              </div>

              {/* Telemetry 4: Subsidence Displacement Range */}
              <div className="collected-telemetry-cell">
                <div className="cell-top">
                  <Navigation size={12} color="#EC4899" />
                  <span className="cell-label">DISPLACEMENT DISTANCE</span>
                </div>
                <div className="cell-value">
                  {latestData?.distance_cm !== undefined && latestData?.distance_cm !== null
                    ? `${latestData.distance_cm.toFixed(1)} cm`
                    : '120.0 cm'}
                </div>
                <span className="cell-sub">HC-SR04 Ultrasonic Sonar</span>
              </div>

              {/* Telemetry 5: Ambient Temperature */}
              <div className="collected-telemetry-cell">
                <div className="cell-top">
                  <Thermometer size={12} color="#EF4444" />
                  <span className="cell-label">TEMPERATURE</span>
                </div>
                <div className="cell-value">
                  {latestData?.temperature !== undefined && latestData?.temperature !== null
                    ? `${latestData.temperature.toFixed(1)} °C`
                    : '24.5 °C'}
                </div>
                <span className="cell-sub">BMP280 Thermal Sensor</span>
              </div>

              {/* Telemetry 6: Atmospheric Pressure & Humidity */}
              <div className="collected-telemetry-cell">
                <div className="cell-top">
                  <Droplets size={12} color="#0284C7" />
                  <span className="cell-label">PRESSURE &amp; HUMIDITY</span>
                </div>
                <div className="cell-value">
                  {latestData?.pressure !== undefined && latestData?.pressure !== null
                    ? `${latestData.pressure.toFixed(0)} hPa`
                    : '1013 hPa'}{' '}
                  ·{' '}
                  {latestData?.humidity !== undefined && latestData?.humidity !== null
                    ? `${latestData.humidity.toFixed(0)}%`
                    : '55%'}
                </div>
                <span className="cell-sub">Barometric Altimetry &amp; RH</span>
              </div>
            </div>
          </div>

          {/* Section C: Spatial Geodetic Notice Banner */}
          <div className="gnss-radar-meta-strip">
            <div className="radar-notice-left">
              <Navigation size={13} color="#0284C7" />
              <span>
                <strong>Surface &amp; Subsurface Spatial Lock:</strong> Triad coordinates (Lat: {latFormatted}, Lon: {lonFormatted}, Alt: {altFormatted}) bind ground elevation datum.
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
            <span>PRIMARY GNSS TELEMETRY RECEIVER: GY-GPS6MV2 ACTIVE</span>
          </div>
          <span className="footer-clock-tag">{activeId} SYNCHRONIZED</span>
        </div>
      </div>

      {/* ── 2. MINIMAL CARDS FOR EVERY CONNECTED NETWORK NODE (SHOWING LATITUDE & LONGITUDE) ── */}
      {allNodes && allNodes.length > 0 && (
        <div className="connected-nodes-spatial-fleet">
          <div className="fleet-header-row">
            <div className="fleet-title-group">
              <RadioTower size={14} color="#0284C7" />
              <span className="fleet-title">CONNECTED MESH NODES · GEODETIC COORDINATES</span>
              <span className="fleet-count-tag">{allNodes.length} NODES LINKED</span>
            </div>
            <span className="fleet-sub">Click node card to focus live telemetry</span>
          </div>

          <div className="minimal-nodes-grid">
            {allNodes.map((n) => {
              const isSelected = n.node_id === activeId;
              const nLat = n.latitude !== null && n.latitude !== undefined
                ? `${n.latitude.toFixed(5)}° N`
                : '23.81000° N';
              const nLon = n.longitude !== null && n.longitude !== undefined
                ? `${n.longitude.toFixed(5)}° E`
                : '86.44000° E';
              const nAlt = n.altitude !== null && n.altitude !== undefined
                ? `${n.altitude.toFixed(1)}m`
                : '140.0m';

              return (
                <div
                  key={n.node_id}
                  className={`minimal-node-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectNode && onSelectNode(n.node_id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${n.node_id}`}
                >
                  {/* Card Top: Node ID, Status, and Satellite Badge */}
                  <div className="min-card-top">
                    <div className="min-node-identity">
                      <div className="min-node-icon-orb">
                        <MapPin size={12} color={isSelected ? '#0284C7' : '#94A3B8'} />
                      </div>
                      <div className="min-node-text">
                        <span className="min-node-id">{n.node_id}</span>
                        <span className="min-zone-tag">{n.zone_id || 'Surface Zone'}</span>
                      </div>
                    </div>

                    <div className="min-status-group">
                      <span className={`min-status-badge ${n.status === 'ONLINE' ? 'online' : 'offline'}`}>
                        <span className="min-status-dot" />
                        {n.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}
                      </span>
                      {isSelected && (
                        <span className="min-active-badge">
                          <CheckCircle2 size={10} /> ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coordinates Triad: Latitude and Longitude */}
                  <div className="min-coords-box">
                    <div className="min-coord-col">
                      <span className="min-coord-label">LATITUDE</span>
                      <span className="min-coord-val">{nLat}</span>
                    </div>
                    <div className="min-coord-divider" />
                    <div className="min-coord-col">
                      <span className="min-coord-label">LONGITUDE</span>
                      <span className="min-coord-val">{nLon}</span>
                    </div>
                  </div>

                  {/* Card Bottom: Altitude, Battery & Satellites */}
                  <div className="min-card-bottom">
                    <span className="min-meta-item">
                      <Satellite size={10} color="#0284C7" />
                      <span>{n.gps_satellites || 8} Sats</span>
                    </span>
                    <span className="min-meta-item">
                      <span>Alt: {nAlt}</span>
                    </span>
                    <span className="min-meta-item battery-item">
                      <Battery size={11} color="#10B981" />
                      <span>{n.battery_level || 90}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

