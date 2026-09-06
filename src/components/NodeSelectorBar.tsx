// ============================================================
// THULIR AI — 3D Surface Intelligence Network (Node Selector)
// ============================================================
// Skeuomorphic Server Blade Selector with metallic edge highlights,
// active LED status rivets, live telemetry transmission beacon, and battery level bars.

import { Server, MapPin, Battery, BatteryCharging, Radio, Cpu } from 'lucide-react';
import type { NodeRecord, RegistryNodeStatus } from '../types';

interface NodeSelectorBarProps {
  nodes: NodeRecord[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  demoMode: boolean;
}

const STATUS_CONFIG: Record<
  RegistryNodeStatus,
  { label: string; ledColor: string; pillClass: string }
> = {
  ONLINE:       { label: 'ONLINE',       ledColor: '#10B981', pillClass: 'node-status-online' },
  DEGRADED:     { label: 'WATCH',        ledColor: '#F59E0B', pillClass: 'node-status-deployed' },
  OFFLINE:      { label: 'OFFLINE',      ledColor: '#EF4444', pillClass: 'node-status-offline' },
  NOT_DEPLOYED: { label: 'STANDBY',      ledColor: '#64748B', pillClass: 'node-status-offline' },
};

export function NodeSelectorBar({
  nodes,
  activeNodeId,
  onSelectNode,
  demoMode,
}: NodeSelectorBarProps) {
  const onlineCount = nodes.filter(n => n.status === 'ONLINE').length;

  return (
    <div className="surface-network-rack">
      {/* Rack Bezel Header */}
      <div className="surface-network-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="rack-beacon-icon">
              <Radio size={16} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="section-title">Surface Intelligence Network</span>
                <span className={`network-mode-pill ${demoMode ? 'simulated' : 'live'}`}>
                  {demoMode ? 'SIMULATED ARRAY' : 'LIVE 2.4G/LTE MESH'}
                </span>
              </div>
              <div className="surface-network-sub">
                Every node watches the ground. THULIR AI watches the pattern.
                <span className="active-nodes-badge">
                  {onlineCount}/{nodes.length} ONLINE
                </span>
              </div>
            </div>
          </div>

          <div className="rack-sub-guide">
            <Cpu size={12} />
            <span>CLICK NODE BLADE TO ROUTE TELEMETRY STREAM</span>
          </div>
        </div>
      </div>

      {/* Node Blades Grid */}
      <div className="node-grid">
        {nodes.map((node, i) => {
          const isActive = node.node_id === activeNodeId;
          const statusCfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.NOT_DEPLOYED;
          const batt = node.battery_level ?? 100;

          return (
            <button
              key={node.node_id}
              type="button"
              onClick={() => onSelectNode(node.node_id)}
              className={`node-card-blade ${isActive ? 'active-blade' : ''} reveal reveal-delay-${Math.min(i + 1, 4) as 1 | 2 | 3 | 4}`}
              aria-pressed={isActive}
            >
              {/* Metallic Tab & Active Indicator */}
              <div className="blade-accent-bar" />

              {/* Blade Header */}
              <div className="blade-header">
                <div className="blade-id-group">
                  <div className={`blade-server-icon ${isActive ? 'active' : ''}`}>
                    <Server size={14} />
                  </div>
                  <div className="blade-title-meta">
                    <span className="node-card-id">{node.node_id}</span>
                    <span className="node-card-sub">{node.zone_id || 'SECTOR ALPHA'}</span>
                  </div>
                </div>

                <div className={`node-status-pill ${statusCfg.pillClass}`}>
                  <span
                    className="status-led-dot"
                    style={{ background: statusCfg.ledColor, boxShadow: `0 0 8px ${statusCfg.ledColor}` }}
                  />
                  {statusCfg.label}
                </div>
              </div>

              {/* Hardware Bar */}
              <div className="blade-hardware-bar">
                <div className="blade-geo-tag">
                  <MapPin size={10} />
                  <span>{node.zone_id || 'ZONE_A'}</span>
                </div>

                {/* Battery Meter */}
                <div className="blade-battery-meter" title={`Battery: ${batt}%`}>
                  {batt > 80 ? (
                    <BatteryCharging size={13} color="#10b981" />
                  ) : (
                    <Battery size={13} color={batt > 30 ? '#f59e0b' : '#ef4444'} />
                  )}
                  <span className="batt-pct">
                    {node.status === 'NOT_DEPLOYED' ? '—' : `${batt}%`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
