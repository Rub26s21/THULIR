// ============================================================
// THULIR - Mission-Control High-Contrast Alert Center
// ============================================================

import { formatTimeAgo } from '../utils/timeUtils';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import type { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => void;
}

export function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const ackAlerts = alerts.filter(a => a.status === 'ACKNOWLEDGED');

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const watchCount = alerts.filter(a => a.severity === 'WATCH' && a.status !== 'RESOLVED').length;
  const hasActiveAlerts = activeAlerts.length > 0;
  const hasCritical = criticalCount > 0;

  return (
    <div
      className={`skeuo-card ${hasCritical ? 'alert-state-danger' : hasActiveAlerts ? 'alert-state-danger' : 'alert-state-nominal'}`}
      role="region"
      aria-label="Alert Center"
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Bell
            size={16}
            color={hasCritical ? 'var(--status-critical)' : hasActiveAlerts ? 'var(--status-watch)' : 'var(--status-normal)'}
            style={{
              animation: hasCritical ? 'pulse-glow-red 1.2s infinite ease-in-out' : undefined,
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Alert Dispatch Center
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {criticalCount > 0 && (
            <span
              className="skeuo-pill"
              style={{
                fontSize: '0.66rem',
                padding: '2px 8px',
                color: 'var(--status-critical)',
                background: 'var(--status-critical-bg)',
                fontWeight: 800,
                border: '1px solid var(--status-critical-border)',
                animation: 'pulse-glow-red 1s infinite ease-in-out',
              }}
            >
              {criticalCount} CRITICAL
            </span>
          )}
          {watchCount > 0 && (
            <span
              className="skeuo-pill"
              style={{
                fontSize: '0.66rem',
                padding: '2px 8px',
                color: 'var(--status-watch)',
                background: 'var(--status-watch-bg)',
                fontWeight: 800,
                border: '1px solid var(--status-watch-border)',
              }}
            >
              {watchCount} WATCH
            </span>
          )}
          <span
            className={`skeuo-pill ${activeAlerts.length + ackAlerts.length > 0 ? 'pill-offline' : 'pill-online'}`}
            style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              fontWeight: 700,
              color: activeAlerts.length + ackAlerts.length > 0 ? 'var(--status-critical)' : 'var(--status-normal)',
            }}
          >
            {activeAlerts.length + ackAlerts.length > 0
              ? `${activeAlerts.length + ackAlerts.length} ACTIVE DISPATCHES`
              : 'ALL CLEAR / NOMINAL'}
          </span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 14px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={32} color="var(--status-normal)" style={{ margin: '0 auto 8px', opacity: 0.95 }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-normal)', fontFamily: 'var(--font-mono)' }}>
            MINE STRATA STATUS: SECURE
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            All multi-axis inclination, barometric pressure, toxic gas, acoustic vibration, and roof displacement metrics are strictly within safe operational parameters.
          </div>
        </div>
      ) : (
        <div className="alert-timeline-list" style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isResolved = alert.status === 'RESOLVED';
            const isAcknowledged = alert.status === 'ACKNOWLEDGED' || alert.acknowledged;
            const timeAgo = formatTimeAgo(alert.created_at);

            return (
              <div
                key={alert.id}
                className={`alert-row-item ${isResolved ? 'sev-resolved' : isCritical ? 'sev-critical' : 'sev-watch'}`}
                style={{ opacity: isResolved ? 0.65 : 1 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {isResolved ? (
                      <CheckCircle2 size={14} color="var(--status-normal)" />
                    ) : isCritical ? (
                      <AlertCircle size={14} color="var(--status-critical)" />
                    ) : (
                      <AlertTriangle size={14} color="var(--status-watch)" />
                    )}
                    <span style={{ fontSize: '0.82rem' }}>{alert.title || alert.sensor}</span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: isResolved ? 'var(--status-normal)' : isCritical ? 'var(--status-critical)' : 'var(--status-watch)',
                        background: isResolved ? 'var(--status-normal-bg)' : isCritical ? 'var(--status-critical-bg)' : 'var(--status-watch-bg)',
                      }}
                    >
                      {alert.severity}
                    </span>
                    {alert.source && (
                      <span
                        style={{
                          fontSize: '0.58rem',
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-dim)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {alert.source}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{alert.message}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.66rem', color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Cpu size={10} /> {alert.node_id}
                    </span>
                    {alert.value !== null && Number.isFinite(alert.value) && (
                      <span>Val: <strong style={{ color: 'var(--text-primary)' }}>{alert.value.toFixed(2)}</strong></span>
                    )}
                    {isResolved && alert.resolved_at && (
                      <span style={{ color: 'var(--status-normal)' }}>
                        Resolved: {new Date(alert.resolved_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 10 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {timeAgo}
                  </span>

                  {!isResolved && !isAcknowledged && (
                    <button
                      className="btn-ack"
                      onClick={() => onAcknowledge(alert.id)}
                      title="Acknowledge alert"
                    >
                      ACK
                    </button>
                  )}

                  {!isResolved && isAcknowledged && (
                    <span style={{ fontSize: '0.66rem', color: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      <CheckCircle2 size={12} /> ACK
                    </span>
                  )}

                  {isResolved && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
