// ============================================================
// THULIR - Multi-Node Mesh Selector Bar
// ============================================================
// Allows switching active sensor node telemetry view and shows
// telemetry-derived health status for all network nodes.

import { Radio, Server, Battery, MapPin } from 'lucide-react';
import type { NodeRecord, RegistryNodeStatus } from '../types';

interface NodeSelectorBarProps {
  nodes: NodeRecord[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  demoMode: boolean;
}

const STATUS_CONFIG: Record<
  RegistryNodeStatus,
  { label: string; dotClass: string; color: string; border: string; bg: string }
> = {
  ONLINE: {
    label: 'ONLINE',
    dotClass: 'dot-green',
    color: 'var(--status-normal)',
    border: 'rgba(16, 185, 129, 0.4)',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  DEGRADED: {
    label: 'DEGRADED',
    dotClass: 'dot-amber',
    color: 'var(--status-watch)',
    border: 'rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  OFFLINE: {
    label: 'OFFLINE',
    dotClass: 'dot-red',
    color: 'var(--status-critical)',
    border: 'rgba(239, 68, 68, 0.3)',
    bg: 'rgba(239, 68, 68, 0.05)',
  },
  NOT_DEPLOYED: {
    label: 'NOT DEPLOYED',
    dotClass: '',
    color: 'var(--text-muted)',
    border: 'rgba(255, 255, 255, 0.08)',
    bg: 'rgba(255, 255, 255, 0.02)',
  },
};

export function NodeSelectorBar({
  nodes,
  activeNodeId,
  onSelectNode,
  demoMode,
}: NodeSelectorBarProps) {
  return (
    <div
      className="skeuo-card"
      style={{
        padding: '14px 18px',
        marginBottom: 16,
      }}
      role="region"
      aria-label="Surface Sensor Nodes Mesh Selector"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio size={16} color="var(--accent-cyan)" />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Surface Sensor Nodes &amp; Mesh Array
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'rgba(0, 229, 255, 0.1)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {demoMode ? 'SIMULATED MESH' : 'LIVE NETWORK'}
          </span>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SELECT ACTIVE NODE TO INSPECT STRATA TELEMETRY
        </div>
      </div>

      {/* Nodes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 12,
        }}
      >
        {nodes.map((node) => {
          const isActive = node.node_id === activeNodeId;
          const statusCfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.NOT_DEPLOYED;

          return (
            <button
              key={node.node_id}
              type="button"
              onClick={() => onSelectNode(node.node_id)}
              className="skeuo-well"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'linear-gradient(145deg, rgba(0, 229, 255, 0.12), rgba(15, 20, 32, 0.95))'
                  : undefined,
                border: isActive
                  ? '1.5px solid var(--accent-cyan)'
                  : '1px solid var(--border-subtle)',
                boxShadow: isActive ? '0 0 16px rgba(0, 229, 255, 0.25)' : undefined,
              }}
            >
              {/* Header row: Node ID & Status Pill */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Server size={14} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {node.node_id}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 4,
                    color: statusCfg.color,
                    backgroundColor: statusCfg.bg,
                    border: `1px solid ${statusCfg.border}`,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {statusCfg.dotClass && <span className={`pulse-dot ${statusCfg.dotClass}`} />}
                  {statusCfg.label}
                </div>
              </div>

              {/* Subtitle / Zone / Meta */}
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color="var(--text-muted)" />
                  {node.zone_id || 'ZONE_A'}
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Battery size={11} color="var(--text-muted)" />
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
