// ============================================================
// THULIR - Prototype Zone Risk Aggregation Panel
// ============================================================
// Displays spatial zone risk assessment aggregating node telemetry
// across longwall panels and mine haulage drifts.

import { ShieldAlert, Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ZoneRiskState, RiskLevel } from '../types';

interface ZoneRiskPanelProps {
  zones: ZoneRiskState[];
}

const LEVEL_COLORS: Record<RiskLevel, { text: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  NORMAL: {
    text: 'var(--status-normal)',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: CheckCircle,
  },
  WATCH: {
    text: 'var(--status-watch)',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: AlertTriangle,
  },
  CRITICAL: {
    text: 'var(--status-critical)',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: ShieldAlert,
  },
};

export function ZoneRiskPanel({ zones }: ZoneRiskPanelProps) {
  return (
    <div className="skeuo-card" role="region" aria-label="Prototype Zone Risk Aggregation">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={17} color="var(--accent-cyan)" />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Spatial Zone Risk Aggregation
          </span>
          <span
            style={{
              fontSize: '0.64rem',
              padding: '2px 6px',
              borderRadius: 3,
              backgroundColor: 'rgba(124, 92, 255, 0.15)',
              color: '#a855f7',
              fontWeight: 800,
              border: '1px solid rgba(124, 92, 255, 0.3)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            PROTOTYPE
          </span>
        </div>

        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          MULTI-NODE FUSION ENGINE
        </span>
      </div>

      {/* Zones Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {zones.map((zone) => {
          const cfg = LEVEL_COLORS[zone.aggregatedRisk];
          const IconComponent = cfg.icon;

          return (
            <div
              key={zone.zone_id}
              className="skeuo-well"
              style={{
                padding: '12px 14px',
                borderTop: `2px solid ${cfg.text}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Top row: Sector name and status badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {zone.zone_name}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    ID: {zone.zone_id} • {zone.onlineNodeCount}/{zone.nodeCount} Nodes Active
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 4,
                    color: cfg.text,
                    backgroundColor: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <IconComponent size={12} />
                  {zone.aggregatedRisk}
                </div>
              </div>

              {/* Summary note */}
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.35,
                  padding: '6px 8px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              >
                {zone.summary}
              </div>

              {/* Contributing nodes */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {zone.contributingNodes.map((cn) => {
                  const nodeCfg = LEVEL_COLORS[cn.level];
                  return (
                    <span
                      key={cn.node_id}
                      style={{
                        fontSize: '0.64rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        backgroundColor: nodeCfg.bg,
                        color: nodeCfg.text,
                        border: `1px solid ${nodeCfg.border}`,
                      }}
                    >
                      {cn.node_id}: {cn.score > 0 ? `${cn.score}%` : 'NOMINAL'}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
