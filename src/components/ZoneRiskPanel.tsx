// ============================================================
// THULIR AI — 3D Spatial Zone Risk Intelligence
// ============================================================
// High-tactility multi-node spatial risk evaluator with metallic corner screws,
// animated zone hazard annunciators, and sector health indicators.

import { ShieldAlert, Layers, CheckCircle2, AlertTriangle, Radio, MapPin } from 'lucide-react';
import type { ZoneRiskState, RiskLevel } from '../types';

interface ZoneRiskPanelProps {
  zones: ZoneRiskState[];
}

const LEVEL_CONFIG: Record<RiskLevel, { text: string; bg: string; grad: string; icon: typeof CheckCircle2 }> = {
  NORMAL: {
    text: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    grad: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
    icon: CheckCircle2,
  },
  WATCH: {
    text: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    grad: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
    icon: AlertTriangle,
  },
  CRITICAL: {
    text: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 50%, #EF4444 100%)',
    icon: ShieldAlert,
  },
};

export function ZoneRiskPanel({ zones }: ZoneRiskPanelProps) {
  return (
    <div
      className="individual-overview-3d-card spatial-zone-chassis"
      role="region"
      aria-label="Spatial Risk Intelligence"
      style={{ '--card-theme-color': '#0F766E' } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div className="card-top-bezel" style={{ background: 'linear-gradient(135deg, #115E59 0%, #0F766E 50%, #14B8A6 100%)' }}>
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Layers size={17} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">SPATIAL ZONE RISK INTELLIGENCE</span>
            <span className="card-chip-sub">MULTI-NODE MINE STRATA FUSION</span>
          </div>
        </div>

        <div className="bezel-right">
          <span className="card-hw-badge">3 COAL SECTORS ACTIVE</span>
        </div>
      </div>

      {/* Main Zones Grid Body */}
      <div className="overview-card-body">
        <div className="spatial-zones-grid">
          {zones.map((zone) => {
            const cfg = LEVEL_CONFIG[zone.aggregatedRisk] || LEVEL_CONFIG.NORMAL;
            const IconComponent = cfg.icon;

            return (
              <div
                key={zone.zone_id}
                className="zone-sector-card"
                style={{ borderLeft: `3px solid ${cfg.text}` }}
              >
                <div className="zone-card-top">
                  <div className="zone-identity">
                    <div className="zone-name-row">
                      <MapPin size={12} color={cfg.text} />
                      <span className="zone-name">{zone.zone_name}</span>
                    </div>
                    <span className="zone-id-tag">
                      ID: {zone.zone_id} • {zone.onlineNodeCount}/{zone.nodeCount} NODES ACTIVE
                    </span>
                  </div>

                  <div className="zone-status-badge" style={{ color: cfg.text, background: cfg.bg, borderColor: `${cfg.text}40` }}>
                    <IconComponent size={11} />
                    <span>{zone.aggregatedRisk}</span>
                  </div>
                </div>

                {/* Summary / Contributing info */}
                <div className="zone-factors-box">
                  {zone.summary ? (
                    <div className="zone-factor-item">
                      <span className="factor-dot" style={{ background: cfg.text }} />
                      <span>{zone.summary}</span>
                    </div>
                  ) : zone.contributingNodes && zone.contributingNodes.length > 0 ? (
                    zone.contributingNodes.map((cn) => (
                      <div key={cn.node_id} className="zone-factor-item">
                        <span className="factor-dot" style={{ background: cfg.text }} />
                        <span>Node {cn.node_id} ({cn.level} - Score: {cn.score})</span>
                      </div>
                    ))
                  ) : (
                    <div className="zone-factor-item nominal">
                      <CheckCircle2 size={10} color="#10B981" />
                      <span>Strata deformation envelope stable. Zero triggers.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Radio size={11} className="spin-slow" />
          <span>REAL-TIME SPATIAL RE-CALCULATION ACTIVE</span>
        </div>
        <span className="footer-clock-tag">SECTOR LEVEL INTELLIGENCE</span>
      </div>
    </div>
  );
}
