// ============================================================
// THULIR AI — Surface Intelligence Network (Node Selector)
// ============================================================

import { Server, MapPin, Battery, Wifi } from 'lucide-react';
import type { NodeRecord, RegistryNodeStatus } from '../types';

interface NodeSelectorBarProps {
  nodes: NodeRecord[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  demoMode: boolean;
}

const STATUS_CONFIG: Record<
  RegistryNodeStatus,
  { label: string; dotClass: string; pillClass: string }
> = {
  ONLINE:       { label: 'ONLINE',       dotClass: 'dot-green', pillClass: 'node-status-online' },
  DEGRADED:     { label: 'DEGRADED',     dotClass: 'dot-amber', pillClass: 'node-status-deployed' },
  OFFLINE:      { label: 'OFFLINE',      dotClass: 'dot-red',   pillClass: 'node-status-offline' },
  NOT_DEPLOYED: { label: 'NOT DEPLOYED', dotClass: '',          pillClass: 'node-status-offline' },
};

export function NodeSelectorBar({
  nodes,
  activeNodeId,
  onSelectNode,
  demoMode,
}: NodeSelectorBarProps) {
  const onlineCount = nodes.filter(n => n.status === 'ONLINE').length;

  return (
    <div className="page-section">
      {/* Section Header */}
      <div className="surface-network-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Wifi size={16} color="var(--brand-green)" strokeWidth={2} />
              <span className="section-title">Surface Intelligence Network</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: demoMode ? 'var(--status-watch-bg)' : 'var(--brand-green-tint)',
                  color: demoMode ? 'var(--status-watch)' : 'var(--brand-green)',
                  border: `1px solid ${demoMode ? 'var(--status-watch-border)' : 'var(--brand-green-border)'}`,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                }}
              >
                {demoMode ? 'SIMULATED' : 'LIVE NETWORK'}
              </span>
            </div>
            <div className="surface-network-sub">
              Every node watches the ground. THULIR AI watches the pattern.
              <span style={{ marginLeft: 12, color: 'var(--brand-green)', fontWeight: 600 }}>
                {onlineCount}/{nodes.length} Active
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SELECT NODE TO INSPECT TELEMETRY
          </div>
        </div>
      </div>

      {/* Node Cards Grid */}
      <div className="node-grid">
        {nodes.map((node, i) => {
          const isActive = node.node_id === activeNodeId;
          const statusCfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.NOT_DEPLOYED;

          return (
            <button
              key={node.node_id}
              type="button"
              onClick={() => onSelectNode(node.node_id)}
              className={`node-card ${isActive ? 'active' : ''} reveal reveal-delay-${Math.min(i + 1, 4) as 1 | 2 | 3 | 4}`}
              aria-pressed={isActive}
              style={{ textAlign: 'left' }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Server
                    size={14}
                    color={isActive ? 'var(--brand-green)' : 'var(--text-muted)'}
                    strokeWidth={2}
                  />
                  <span className="node-card-id">{node.node_id}</span>
                </div>
                <div className={`node-status-pill ${statusCfg.pillClass}`}>
                  {statusCfg.dotClass && (
                    <span className={`pulse-dot ${statusCfg.dotClass}`} />
                  )}
                  {statusCfg.label}
                </div>
              </div>

              {/* Meta row */}
              <div className="node-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={10} />
                  {node.zone_id || 'ZONE_A'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Battery size={10} />
                  {node.status === 'NOT_DEPLOYED' ? '—' : `${node.battery_level ?? 100}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
