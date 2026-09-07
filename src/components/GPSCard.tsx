// ============================================================
// THULIR AI — 3D Connected Nodes GNSS Geodetic Fleet Cards
// ============================================================
// Minimal spatial cards displaying Latitude, Longitude, Altitude,
// satellite lock, and live status for each connected mesh node.

import {
  Satellite,
  Battery,
  MapPin,
  CheckCircle2,
  RadioTower,
} from 'lucide-react';
import type { NodeRecord } from '../types';

interface GPSCardProps {
  node?: NodeRecord | null;
  allNodes?: NodeRecord[];
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string) => void;
}

export function GPSCard({
  node,
  allNodes = [],
  selectedNodeId,
  onSelectNode,
}: GPSCardProps) {
  const activeId = node?.node_id || selectedNodeId || 'NODE_01';

  if (!allNodes || allNodes.length === 0) {
    return null;
  }

  return (
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
  );
}


