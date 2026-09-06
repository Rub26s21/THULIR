// ============================================================
// THULIR AI — 3D Skeuomorphic Safety Alert Dispatch Center
// ============================================================
// High-tactility emergency dispatch console with 4 corner metallic screws,
// incident response annunciator rows, 3D mechanical acknowledge push-buttons,
// and strata hazard beacons.

import { formatTimeAgo } from '../utils/timeUtils';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, Cpu, Radio, ShieldAlert, Zap } from 'lucide-react';
import type { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => void;
}

export function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const ackAlerts = alerts.filter((a) => a.status === 'ACKNOWLEDGED');

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const watchCount = alerts.filter((a) => a.severity === 'WATCH' && a.status !== 'RESOLVED').length;
  const hasActiveAlerts = activeAlerts.length > 0;
  const hasCritical = criticalCount > 0;

  const headerGradient = hasCritical
    ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #EF4444 100%)'
    : hasActiveAlerts
    ? 'linear-gradient(135deg, #78350F 0%, #B45309 50%, #F59E0B 100%)'
    : 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #059669 100%)';

  const themeColor = hasCritical ? '#EF4444' : hasActiveAlerts ? '#F59E0B' : '#10B981';

  return (
    <div
      className={`individual-overview-3d-card alert-dispatch-chassis ${
        hasCritical ? 'is-danger-state' : hasActiveAlerts ? 'is-watch-state' : 'is-nominal-state'
      }`}
      role="region"
      aria-label="Safety Alert Dispatch Console"
      style={{ '--card-theme-color': themeColor } as React.CSSProperties}
    >
      {/* 4 Corner Metallic Machined Fasteners */}
      <div className="corner-screw top-left" />
      <div className="corner-screw top-right" />
      <div className="corner-screw bottom-left" />
      <div className="corner-screw bottom-right" />

      {/* Top 3D Metallic Header Bezel */}
      <div className="card-top-bezel" style={{ background: headerGradient }}>
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            {hasCritical ? (
              <ShieldAlert size={17} color="#FFFFFF" className="pulse-fast" />
            ) : hasActiveAlerts ? (
              <Bell size={17} color="#FFFFFF" />
            ) : (
              <ShieldCheck size={17} color="#FFFFFF" />
            )}
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">SAFETY ALERT DISPATCH CONSOLE</span>
            <span className="card-chip-sub">REAL-TIME STRATA INCIDENT RESPONSE DESK</span>
          </div>
        </div>

        <div className="bezel-right">
          {hasCritical && (
            <span className="card-hw-badge" style={{ background: 'rgba(239, 68, 68, 0.35)', borderColor: '#EF4444' }}>
              {criticalCount} CRITICAL
            </span>
          )}
          {watchCount > 0 && (
            <span className="card-hw-badge" style={{ background: 'rgba(245, 158, 11, 0.35)', borderColor: '#F59E0B' }}>
              {watchCount} WATCH
            </span>
          )}
          <span className="card-hw-badge">
            {activeAlerts.length + ackAlerts.length > 0
              ? `${activeAlerts.length + ackAlerts.length} ACTIVE`
              : 'STRATA SECURE'}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="overview-card-body">
        {alerts.length === 0 ? (
          <div className="alert-zero-state-well">
            <div className="zero-state-radar-orb">
              <ShieldCheck size={36} color="#10B981" />
              <div className="radar-sonar-wave" />
            </div>
            <div className="zero-state-title">MINE STRATA ENVELOPE: 100% SECURE</div>
            <p className="zero-state-desc">
              All multi-axis inclination, barometric strata pressure, toxic gas concentration, acoustic micro-vibrations,
              and roof displacement metrics are strictly nominal. Zero safety breaches detected across active sensor nodes.
            </p>
            <div className="zero-state-chips">
              <span className="secure-tag"><CheckCircle2 size={11} color="#10B981" /> GAS &lt; 400 PPM</span>
              <span className="secure-tag"><CheckCircle2 size={11} color="#10B981" /> VIBRATION &lt; 1.5 m/s²</span>
              <span className="secure-tag"><CheckCircle2 size={11} color="#10B981" /> TILT &lt; 15.0°</span>
            </div>
          </div>
        ) : (
          <div className="alert-3d-timeline-list">
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isResolved = alert.status === 'RESOLVED';
              const isAcknowledged = alert.status === 'ACKNOWLEDGED' || alert.acknowledged;
              const timeAgo = formatTimeAgo(alert.created_at);

              const rowBorderColor = isResolved ? '#10B981' : isCritical ? '#EF4444' : '#F59E0B';

              return (
                <div
                  key={alert.id}
                  className={`alert-3d-row-item ${
                    isResolved ? 'is-resolved' : isCritical ? 'is-critical' : 'is-watch'
                  }`}
                  style={{ borderLeftColor: rowBorderColor }}
                >
                  {/* Left Severity Indicator Rail */}
                  <div className="alert-row-icon-col">
                    {isResolved ? (
                      <div className="alert-icon-orb orb-resolved">
                        <CheckCircle2 size={14} color="#10B981" />
                      </div>
                    ) : isCritical ? (
                      <div className="alert-icon-orb orb-critical">
                        <AlertCircle size={14} color="#EF4444" />
                      </div>
                    ) : (
                      <div className="alert-icon-orb orb-watch">
                        <AlertTriangle size={14} color="#F59E0B" />
                      </div>
                    )}
                  </div>

                  {/* Center Content */}
                  <div className="alert-row-content">
                    <div className="alert-title-row">
                      <span className="alert-name-text">{alert.title || alert.sensor}</span>
                      <span
                        className="alert-sev-tag"
                        style={{
                          color: isResolved ? '#10B981' : isCritical ? '#EF4444' : '#F59E0B',
                          background: isResolved
                            ? 'rgba(16, 185, 129, 0.12)'
                            : isCritical
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)',
                          borderColor: `${rowBorderColor}40`,
                        }}
                      >
                        {alert.severity}
                      </span>
                      {alert.source && (
                        <span className="alert-src-tag">
                          <Zap size={9} /> {alert.source}
                        </span>
                      )}
                    </div>

                    <div className="alert-desc-text">{alert.message}</div>

                    <div className="alert-telemetry-meta">
                      <span className="meta-item">
                        <Cpu size={10} color="#0284C7" /> {alert.node_id}
                      </span>
                      {alert.value !== null && Number.isFinite(alert.value) && (
                        <span className="meta-item">
                          VALUE: <strong style={{ color: 'var(--text-primary)' }}>{alert.value.toFixed(2)}</strong>
                        </span>
                      )}
                      {isResolved && alert.resolved_at && (
                        <span className="meta-item resolved-tag">
                          RESOLVED AT: {new Date(alert.resolved_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Action & Timestamp */}
                  <div className="alert-row-action-col">
                    <span className="alert-time-tag">{timeAgo}</span>

                    {!isResolved && !isAcknowledged && (
                      <button
                        className="btn-ack-3d"
                        onClick={() => onAcknowledge(alert.id)}
                        title="Acknowledge safety incident dispatch"
                      >
                        <span>ACK</span>
                      </button>
                    )}

                    {!isResolved && isAcknowledged && (
                      <div className="ack-confirmed-badge">
                        <CheckCircle2 size={11} color="#10B981" />
                        <span>ACKNOWLEDGED</span>
                      </div>
                    )}

                    {isResolved && (
                      <div className="resolved-confirmed-badge">
                        <span>RESOLVED</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Radio size={11} className="spin-slow" />
          <span>INCIDENT DISPATCH QUEUE SYNCHRONIZED</span>
        </div>
        <span className="footer-clock-tag">ZERO-LATENCY SAFETY DISPATCH</span>
      </div>
    </div>
  );
}
