// ============================================================
// THULIR AI — Master Application Layout
// ============================================================
// Premium claymorphism · Sidebar navigation · Hero section
// All data hooks, ML inference, alerts, and Supabase integration preserved.

import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { NodeSelectorBar } from '../components/NodeSelectorBar';
import { SensorGrid } from '../components/SensorGrid';
import { RiskPanel } from '../components/RiskPanel';
import { ZoneRiskPanel } from '../components/ZoneRiskPanel';
import { GPSCard } from '../components/GPSCard';
import { AlertPanel } from '../components/AlertPanel';
import { MLPanel } from '../components/MLPanel';
import { NodeHealth } from '../components/NodeHealth';
import { NetworkTopology } from '../components/NetworkTopology';
import { SystemActivity } from '../components/SystemActivity';
import { HistoricalCharts } from '../components/HistoricalCharts';
import { LaunchScreen } from '../components/LaunchScreen';
import { useSensorData } from '../hooks/useSensorData';
import { useMultiNode } from '../hooks/useMultiNode';
import { useAlerts } from '../hooks/useAlerts';
import { useNodeHealth } from '../hooks/useNodeHealth';
import { useTheme } from '../hooks/useTheme';
import { evaluateRisk } from '../utils/riskEngine';
import { runMLInference } from '../utils/mlEngine';
import { calculateZoneRisk } from '../utils/zoneRiskEngine';
import { KNOWN_ZONES } from '../config/thresholds';
import { isSupabaseConfigured } from '../lib/supabase';
import { Activity, Shield, Brain, Network, AlertCircle, Info } from 'lucide-react';

// Scroll-reveal hook
function useRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

// Hero floating stat card
function HeroStatCard({
  label, value, sub, color
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="hero-stat-card">
      <div className="hero-stat-label">{label}</div>
      <div className="hero-stat-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Dashboard() {
  const [showLaunch, setShowLaunch] = useState(true);
  const { theme, mode, setTheme, setCategoryMode } = useTheme();

  const [selectedNodeId, setSelectedNodeId] = useState<string>('NODE_01');

  const {
    latestData, history, historyLoading, historyError, timeRange, setTimeRange,
    connectionType, demoMode, toggleDemoMode, supabaseConfigured,
  } = useSensorData(selectedNodeId);

  const nodeStatus = useNodeHealth(latestData, selectedNodeId);
  const isTelemetryFresh = nodeStatus.freshness === 'LIVE' || nodeStatus.freshness === 'RECENT';

  const { allNodesWithStatus, activeNode, nodeLinks } = useMultiNode(selectedNodeId, isTelemetryFresh);

  const mlPrediction = useMemo(
    () => (latestData ? runMLInference(latestData) : null),
    [latestData]
  );

  const risk = useMemo(() => evaluateRisk(latestData, mlPrediction), [latestData, mlPrediction]);

  const zoneRisks = useMemo(() => {
    const riskMap: Record<string, typeof risk> = { [selectedNodeId]: risk };
    return KNOWN_ZONES.map((zone) => calculateZoneRisk(zone.id, allNodesWithStatus, riskMap));
  }, [allNodesWithStatus, selectedNodeId, risk]);

  const { alerts, acknowledgeAlert } = useAlerts(latestData, mlPrediction);
  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  // Activate scroll-reveal animations
  useRevealObserver();

  // Derive live hero stats
  const riskColor =
    risk.level === 'CRITICAL' ? 'var(--status-critical)' :
    risk.level === 'WATCH'    ? 'var(--status-watch)' :
    'var(--status-normal)';

  return (
    <>
      {showLaunch && <LaunchScreen onComplete={() => setShowLaunch(false)} />}

      {/* App Shell */}
      <div className="app-layout" data-theme={theme}>
        {/* Sidebar + Command Bar */}
        <Header
          connectionType={demoMode ? 'DISCONNECTED' : connectionType}
          freshness={nodeStatus.freshness}
          lastTimestamp={latestData?.created_at || null}
          demoMode={demoMode}
          onToggleDemo={toggleDemoMode}
          theme={theme}
          mode={mode}
          onSelectTheme={setTheme}
          onSelectMode={setCategoryMode}
          alertCount={activeAlertCount}
        />

        {/* Main Content */}
        <div className="main-content">
          {/* Page Content */}
          <div className="page-content">

            {/* ── Configuration Warning Banner ── */}
            {!isSupabaseConfigured && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 18px', marginBottom: 24,
                background: 'var(--status-watch-bg)',
                border: '1px solid var(--status-watch-border)',
                borderRadius: 16,
                fontSize: '0.8rem', color: 'var(--status-watch)',
              }}>
                <AlertCircle size={16} />
                <div>
                  <strong>Supabase credentials not configured.</strong> Running in{' '}
                  <strong>Simulated Demo Mode</strong>. Provide <code>VITE_SUPABASE_URL</code> and{' '}
                  <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to connect live.
                </div>
              </div>
            )}

            {/* ── HERO SECTION ── */}
            <div className="hero-section reveal" id="hero">
              <div className="hero-content">
                <div className="hero-eyebrow">THULIR AI · Mine Safety Intelligence</div>
                <h1 className="hero-headline">
                  Safer Mines.<br />
                  <span>Smarter</span> Decisions.
                </h1>
                <p className="hero-subline">
                  AI-powered subsidence early warning for coal mines.
                  Real-time ESP8266 telemetry fused with Random Forest risk intelligence —
                  every 5 seconds.
                </p>
                <div className="hero-cta-group">
                  <button className="btn-primary" onClick={() => {
                    document.getElementById('section-telemetry')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <Activity size={15} />
                    View Live Telemetry
                  </button>
                  <button className="btn-secondary" onClick={() => {
                    document.getElementById('section-ml')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <Brain size={15} />
                    AI Analysis
                  </button>
                </div>
              </div>

              {/* Floating hero stat cards */}
              <div className="hero-visual-area">
                <HeroStatCard
                  label="Risk Level"
                  value={risk.level}
                  sub={`Score: ${risk.score}/100`}
                  color={riskColor}
                />
                <HeroStatCard
                  label="Node"
                  value={selectedNodeId}
                  sub={isTelemetryFresh ? 'Online' : 'Awaiting'}
                  color={isTelemetryFresh ? 'var(--status-normal)' : 'var(--status-watch)'}
                />
                <HeroStatCard
                  label="Active Alerts"
                  value={String(activeAlertCount)}
                  sub={activeAlertCount === 0 ? 'All clear' : 'Attention needed'}
                  color={activeAlertCount > 0 ? 'var(--status-critical)' : 'var(--status-normal)'}
                />
                <HeroStatCard
                  label="AI Inference"
                  value={mlPrediction ? mlPrediction.prediction.replace('_', ' ') : 'Awaiting'}
                  sub={mlPrediction ? `${(mlPrediction.confidence * 100).toFixed(0)}% conf` : '—'}
                />
              </div>

              {/* Mine landscape background SVG */}
              <svg
                className="hero-landscape"
                viewBox="0 0 600 380"
                preserveAspectRatio="xMaxYMax slice"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F6B57" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#0F6B57" stopOpacity="0.18" />
                  </linearGradient>
                </defs>
                {/* Mountain silhouette */}
                <path d="M0 380 L80 200 L150 280 L230 140 L310 260 L380 100 L460 230 L530 180 L600 260 L600 380 Z"
                  fill="url(#sky-grad)" />
                {/* Strata lines */}
                <path d="M0 310 Q150 295 300 308 T600 300 L600 320 Q450 312 300 324 T0 330 Z"
                  fill="#0F6B57" opacity="0.08" />
                <path d="M0 335 Q150 322 300 335 T600 328 L600 345 Q450 338 300 348 T0 350 Z"
                  fill="#0F6B57" opacity="0.06" />
                <path d="M0 358 Q150 348 300 358 T600 352 L600 368 Q450 360 300 370 T0 370 Z"
                  fill="#0F6B57" opacity="0.05" />
              </svg>
            </div>

            {/* ── Awaiting Banner ── */}
            {!latestData && !demoMode && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 20px', marginBottom: 24,
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                borderRadius: 16, boxShadow: 'var(--shadow-card)',
                flexWrap: 'wrap', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Info size={15} color="var(--brand-green)" />
                  <span>
                    <strong>Awaiting {selectedNodeId} live telemetry.</strong> Listening for ESP8266 sensor packets from Supabase...
                  </span>
                </div>
                <button className="btn-primary" onClick={toggleDemoMode} style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
                  Enable Demo Simulation
                </button>
              </div>
            )}

            {/* ── SECTION 1: SYSTEM OVERVIEW ── */}
            <section id="section-overview" className="page-section">
              <div className="section-header">
                <Shield size={14} color="var(--brand-green)" strokeWidth={2} />
                <span className="section-eyebrow">System Overview</span>
                <span className="section-title">Structural & Hardware Health</span>
              </div>

              <div className="hero-overview-grid reveal">
                <RiskPanel risk={risk} />
                <NodeHealth nodeStatus={nodeStatus} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                <div className="reveal reveal-delay-1">
                  <ZoneRiskPanel zones={zoneRisks} />
                </div>
                <div className="reveal reveal-delay-2">
                  <GPSCard node={activeNode} />
                </div>
              </div>
            </section>

            {/* ── SECTION 2: NODE SELECTOR ── */}
            <section id="section-nodes" className="page-section reveal">
              <NodeSelectorBar
                nodes={allNodesWithStatus}
                activeNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                demoMode={demoMode}
              />
            </section>

            {/* ── SECTION 3: LIVE SENSOR TELEMETRY ── */}
            <section id="section-telemetry" className="page-section">
              <div className="section-header">
                <Activity size={14} color="var(--brand-green)" strokeWidth={2} />
                <span className="section-eyebrow">Live Telemetry</span>
                <span className="section-title">Multi-Sensor Array · {selectedNodeId}</span>
                <span className="section-subtitle" style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {demoMode ? 'SIMULATED · 5s UPDATE' : 'LIVE · 5s TX CYCLE'}
                </span>
              </div>
              <div className="reveal">
                <SensorGrid data={latestData} />
              </div>
            </section>

            {/* ── SECTION 4: ANALYTICS ── */}
            <section id="section-analytics" className="page-section reveal">
              <HistoricalCharts
                history={history}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                loading={historyLoading}
                error={historyError}
              />
            </section>

            {/* ── SECTION 5: AI / ML + ALERTS ── */}
            <section id="section-ml" className="page-section">
              <div className="section-header">
                <Brain size={14} color="var(--brand-green)" strokeWidth={2} />
                <span className="section-eyebrow">AI Analysis</span>
                <span className="section-title">Risk Intelligence & Alert Dispatch · {selectedNodeId}</span>
              </div>
              <div className="bottom-dual-grid">
                <div className="reveal">
                  <MLPanel prediction={mlPrediction} />
                </div>
                <div id="section-alerts" className="reveal reveal-delay-1">
                  <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
                </div>
              </div>
            </section>

            {/* ── SECTION 6: NETWORK + SYSTEM ACTIVITY ── */}
            <section id="section-system" className="page-section">
              <div className="section-header">
                <Network size={14} color="var(--brand-green)" strokeWidth={2} />
                <span className="section-eyebrow">Network</span>
                <span className="section-title">Intelligence Pipeline & System Activity</span>
              </div>
              <div className="topology-activity-grid">
                <div className="reveal">
                  <NetworkTopology
                    connectionType={demoMode ? 'DISCONNECTED' : connectionType}
                    freshness={nodeStatus.freshness}
                    supabaseConnected={supabaseConfigured}
                    activeNodeId={selectedNodeId}
                    nodeLinks={nodeLinks}
                  />
                </div>
                <div className="reveal reveal-delay-1">
                  <SystemActivity
                    latestData={latestData}
                    mlPrediction={mlPrediction}
                    risk={risk}
                    connectionType={demoMode ? 'SIMULATED DEMO' : connectionType}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ── Footer ── */}
          <footer className="app-footer">
            <div className="footer-brand">
              <div className="footer-brand-name">THULIR <span>AI</span></div>
              <div className="footer-tagline">Intelligent Mine Safety · Safer Mines. Smarter Decisions.</div>
            </div>
            <div className="footer-right">
              <div>Node: <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedNodeId}</strong></div>
              <div style={{ marginTop: 4 }}>
                {demoMode ? 'Simulated Demo' : `${connectionType} · ${nodeStatus.freshness}`}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
