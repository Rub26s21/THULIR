// ============================================================
// THULIR AI — Ground Event Investigator Engineering Panel
// ============================================================
// High-tactility AI event interpretation console powered by NVIDIA Nemotron 3 Ultra.
// Provides engineering-grade evidence decomposition, sensor conflict analysis,
// and actionable operator verification checklists.

import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { UseGroundEventInvestigatorResult } from '../hooks/useGroundEventInvestigator.ts';
import type { APODResult } from '../services/apod/apodTypes.ts';

interface GroundEventInvestigatorPanelProps {
  investigator: UseGroundEventInvestigatorResult;
  apod: APODResult | null;
}

export function GroundEventInvestigatorPanel({
  investigator,
  apod,
}: GroundEventInvestigatorPanelProps) {
  const {
    investigation,
    status,
    isInvestigating,
    reason,
    cooldownRemaining,
    triggerManualInvestigation,
  } = investigator;

  const isAvailable = status === 'AI_AVAILABLE' && investigation !== null;
  const isRateLimited = status === 'AI_RATE_LIMITED';
  const isError = status === 'AI_ERROR' || status === 'AI_INVALID_RESPONSE';

  const severityColor =
    investigation?.severity_interpretation === 'CRITICAL'
      ? '#EF4444'
      : investigation?.severity_interpretation === 'HIGH'
      ? '#F43F5E'
      : investigation?.severity_interpretation === 'ELEVATED'
      ? '#F59E0B'
      : investigation?.severity_interpretation === 'WATCH'
      ? '#EAB308'
      : '#10B981';

  return (
    <div
      className="individual-overview-3d-card investigator-chassis"
      role="region"
      aria-label="Ground Event Investigator"
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
        style={{
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0284C7 100%)',
        }}
      >
        <div className="bezel-left">
          <div className="bezel-icon-orb">
            <Sparkles size={17} color="#FFFFFF" />
          </div>
          <div className="bezel-text">
            <span className="card-sensor-title">THULIR AI · GROUND EVENT INVESTIGATOR</span>
            <span className="card-chip-sub">
              NVIDIA NEMOTRON 3 ULTRA · MULTI-NODE STRATA EVENT REASONING
            </span>
          </div>
        </div>

        <div className="bezel-right" style={{ gap: 8 }}>
          <div className="investigator-status-pill">
            <span
              className={`status-pulse-dot ${
                isInvestigating ? 'is-busy' : isAvailable ? 'is-active' : 'is-standby'
              }`}
            />
            <span>
              {isInvestigating
                ? 'INVESTIGATING...'
                : isAvailable
                ? 'NEMOTRON ACTIVE'
                : isRateLimited
                ? 'RATE LIMITED'
                : isError
                ? 'STANDBY'
                : 'AI READY'}
            </span>
          </div>

          <button
            className="investigator-refresh-btn"
            onClick={triggerManualInvestigation}
            disabled={isInvestigating || cooldownRemaining > 0}
            title="Execute on-demand NVIDIA Nemotron 3 Ultra event investigation"
          >
            <RefreshCw size={12} className={isInvestigating ? 'spin-fast' : ''} />
            <span>
              {isInvestigating
                ? 'Analyzing...'
                : cooldownRemaining > 0
                ? `Wait ${cooldownRemaining}s`
                : 'Investigate'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="overview-card-body">
        {/* State Banner: Loading / Rate-limited / Standby / Error */}
        {isInvestigating && (
          <div className="investigator-banner is-analyzing">
            <RefreshCw size={15} color="#0284C7" className="spin-fast" />
            <div className="banner-text">
              <strong>SYNTHESIZING EVENT EVIDENCE:</strong> Querying NVIDIA Nemotron 3 Ultra via
              OpenRouter for multi-sensor conflict and spatial correlation analysis...
            </div>
          </div>
        )}

        {!isInvestigating && isRateLimited && (
          <div className="investigator-banner is-warning">
            <AlertTriangle size={15} color="#F59E0B" />
            <div className="banner-text">
              <strong>API RATE LIMIT NOTICED:</strong> OpenRouter free endpoint is temporarily busy.
              A-POD deterministic safety rules remain 100% active. Retry in a moment.
            </div>
          </div>
        )}

        {!isInvestigating && isError && (
          <div className="investigator-banner is-error">
            <Info size={15} color="#EF4444" />
            <div className="banner-text">
              <strong>INVESTIGATION ENGINE NOTICE:</strong> {reason || 'AI interpretation temporarily unavailable.'}{' '}
              Deterministic A-POD monitoring remains fully functional.
            </div>
          </div>
        )}

        {/* When investigation data is available */}
        {isAvailable && investigation && (
          <div className="investigation-content-deck">
            {/* Top Event Diagnostic Strip */}
            <div className="event-diagnostic-banner">
              <div className="event-type-col">
                <span className="event-micro-tag">DETECTED EVENT PATTERN</span>
                <div className="event-type-badge">
                  <Layers size={14} color="#0284C7" />
                  <span>{investigation.event_type.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="severity-col">
                <span className="event-micro-tag">SEVERITY INTERPRETATION</span>
                <div
                  className="severity-pill"
                  style={{
                    backgroundColor: `${severityColor}18`,
                    color: severityColor,
                    borderColor: `${severityColor}40`,
                  }}
                >
                  {investigation.severity_interpretation === 'CRITICAL' ? (
                    <ShieldAlert size={14} />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  <span>{investigation.severity_interpretation}</span>
                </div>
              </div>

              <div className="confidence-col">
                <div className="confidence-label-row">
                  <span className="event-micro-tag">AI CONFIDENCE</span>
                  <span className="confidence-percent-tag">
                    {Math.round(investigation.confidence * 100)}%
                  </span>
                </div>
                <div className="confidence-gauge-track">
                  <div
                    className="confidence-gauge-fill"
                    style={{
                      width: `${investigation.confidence * 100}%`,
                      background:
                        investigation.confidence >= 0.75
                          ? 'linear-gradient(90deg, #0284C7 0%, #10B981 100%)'
                          : 'linear-gradient(90deg, #F59E0B 0%, #0284C7 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Executive AI Interpretation Card */}
            <div className="investigation-well-card summary-card">
              <div className="well-card-header">
                <Sparkles size={13} color="#0284C7" />
                <span>AI ENGINEERING INTERPRETATION</span>
              </div>
              <p className="summary-paragraph">{investigation.summary}</p>
            </div>

            {/* Dual Evidence Columns: Supporting vs Contradicting (Sensor Conflict) */}
            <div className="investigation-dual-grid">
              {/* Left: Supporting Evidence */}
              <div className="investigation-well-card">
                <div className="well-card-header">
                  <CheckCircle2 size={13} color="#10B981" />
                  <span>SUPPORTING EVIDENCE</span>
                </div>
                {investigation.supporting_evidence.length === 0 ? (
                  <div className="empty-evidence-tag">No direct abnormal supporting indicators.</div>
                ) : (
                  <ul className="evidence-bullet-list">
                    {investigation.supporting_evidence.map((item, idx) => (
                      <li key={`sup-${idx}`} className="evidence-bullet-item supporting">
                        <ChevronRight size={12} color="#10B981" className="bullet-arrow" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Right: Contradicting Evidence / Physical Conflicts */}
              <div className="investigation-well-card">
                <div className="well-card-header">
                  <AlertTriangle size={13} color="#F59E0B" />
                  <span>CONTRADICTING SIGNALS / SENSOR CONFLICTS</span>
                </div>
                {investigation.contradicting_evidence.length === 0 ? (
                  <div className="empty-evidence-tag">Zero physical signal contradictions detected.</div>
                ) : (
                  <ul className="evidence-bullet-list">
                    {investigation.contradicting_evidence.map((item, idx) => (
                      <li key={`con-${idx}`} className="evidence-bullet-item contradicting">
                        <ChevronRight size={12} color="#F59E0B" className="bullet-arrow" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Dual Diagnostic Deck: Possible Scenarios vs Data Gaps */}
            <div className="investigation-dual-grid">
              {/* Left: Possible Interpretations */}
              <div className="investigation-well-card">
                <div className="well-card-header">
                  <Layers size={13} color="#8B5CF6" />
                  <span>POSSIBLE ENGINEERING SCENARIOS</span>
                </div>
                <ul className="evidence-bullet-list">
                  {investigation.possible_interpretations.map((item, idx) => (
                    <li key={`pos-${idx}`} className="evidence-bullet-item neutral">
                      <span className="bullet-dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Data Gaps */}
              <div className="investigation-well-card">
                <div className="well-card-header">
                  <HelpCircle size={13} color="#64748B" />
                  <span>DATA GAPS & MISSING TELEMETRY</span>
                </div>
                {investigation.data_gaps.length === 0 ? (
                  <div className="empty-evidence-tag">Telemetry complete across all monitored channels.</div>
                ) : (
                  <ul className="evidence-bullet-list">
                    {investigation.data_gaps.map((item, idx) => (
                      <li key={`gap-${idx}`} className="evidence-bullet-item missing">
                        <span className="bullet-dot grey" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Operator Verification Checklist */}
            <div className="investigation-well-card action-checklist-card">
              <div className="well-card-header">
                <ShieldCheck size={14} color="#10B981" />
                <span>RECOMMENDED OPERATOR FIELD VERIFICATIONS</span>
              </div>
              <div className="verification-check-grid">
                {investigation.operator_verification.map((action, idx) => (
                  <div key={`act-${idx}`} className="verification-check-item">
                    <div className="check-box-orb">
                      <span className="check-number">{idx + 1}</span>
                    </div>
                    <span className="check-action-text">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations Callout */}
            {investigation.limitations.length > 0 && (
              <div className="investigation-limitations-strip">
                <Info size={13} color="var(--text-muted)" />
                <span className="limitations-text">
                  <strong>Analytical Boundary:</strong> {investigation.limitations.join(' ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Initial Standby Zero-State */}
        {!isAvailable && !isInvestigating && (
          <div className="investigator-standby-well">
            <div className="standby-orb">
              <Cpu size={32} color="#0284C7" />
            </div>
            <div className="standby-title">GROUND EVENT INVESTIGATOR STANDBY</div>
            <p className="standby-desc">
              Deterministic A-POD evidence fusion is active (Current Network State:{' '}
              <strong>{apod?.networkState || 'NORMAL'}</strong>). Click "Investigate" above to request a
              real-time natural language event breakdown from NVIDIA Nemotron 3 Ultra.
            </p>
            <div className="standby-actions">
              <button
                className="btn-primary"
                onClick={triggerManualInvestigation}
                style={{ padding: '8px 18px', fontSize: '0.78rem' }}
              >
                <Sparkles size={14} />
                <span>Run AI Event Investigation</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Bezel */}
      <div className="card-footer-strip">
        <div className="footer-status-pill">
          <Cpu size={11} />
          <span>NVIDIA NEMOTRON 3 ULTRA (550B) · OPENROUTER API</span>
        </div>
        <span className="footer-clock-tag">
          {apod ? `A-POD EVIDENCE FUSION SCORE: ${(apod.evidenceScore ?? 0).toFixed(2)}` : 'IDLE'}
        </span>
      </div>
    </div>
  );
}
