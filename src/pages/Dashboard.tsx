// ============================================================
// THULIR AI — Master Application Layout
// ============================================================
// Premium Liquidmorphism · Sidebar navigation · Hero section
// All data hooks, ML inference, alerts, and Supabase integration preserved.

import { useState, useMemo, useEffect } from 'react';
import { Sidebar, CommandBar } from '../components/Header';
import { NodeSelectorBar } from '../components/NodeSelectorBar';
import { APODPanel } from '../components/APODPanel.tsx';
import { GPSCard } from '../components/GPSCard';
import { AlertPanel } from '../components/AlertPanel';
import { MLPanel } from '../components/MLPanel';
import { NetworkTopology } from '../components/NetworkTopology';
import { SystemActivity } from '../components/SystemActivity';
import { HistoricalCharts } from '../components/HistoricalCharts';
import { LaunchScreen } from '../components/LaunchScreen';
import { LiquidBackground } from '../components/LiquidBackground';
import { SmartMineControlDesk } from '../components/SmartMineControlDesk';
import { useSensorData } from '../hooks/useSensorData';
import { useMultiNode } from '../hooks/useMultiNode';
import { useAlerts } from '../hooks/useAlerts';
import { useNodeHealth } from '../hooks/useNodeHealth';
import { useTheme } from '../hooks/useTheme';
import { useMouseShine } from '../hooks/useMouseShine';
import { useAPOD } from '../hooks/useAPOD.ts';
import { evaluateRisk } from '../utils/riskEngine';
import { runMLInference } from '../utils/mlEngine';
import { isSupabaseConfigured } from '../lib/supabase';
import { Activity, Brain, Network, AlertCircle, Info, Sparkles, ArrowUpRight } from 'lucide-react';

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
  label, value, sub, color, glowColor
}: { label: string; value: string; sub?: string; color?: string; glowColor?: string }) {
  return (
    <div className="hero-stat-card" style={{ borderColor: glowColor ? `${glowColor}40` : undefined }}>
      <div className="hero-stat-label">{label}</div>
      <div className="hero-stat-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Dashboard() {
  const [showLaunch, setShowLaunch] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const apod = useAPOD({
    nodes: allNodesWithStatus,
    nodeLinks,
    selectedNodeId,
    latestSensorData: latestData,
    activeMlPrediction: mlPrediction,
    activeRisk: risk,
  });

  const { alerts, acknowledgeAlert } = useAlerts(latestData, mlPrediction);
  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  // Activate scroll-reveal animations
  useRevealObserver();

  // Activate interactive specular mouse shining on all cards
  useMouseShine();

  // Derive live hero stats
  const riskColor =
    risk.level === 'CRITICAL' ? 'var(--status-critical)' :
    risk.level === 'WATCH'    ? 'var(--status-watch)' :
    'var(--status-normal)';

  return (
    <>
      {showLaunch && <LaunchScreen onComplete={() => setShowLaunch(false)} />}

      {/* Master Application Shell */}
      <div className="app-root-container" data-theme={theme} data-color-mode={mode}>
        {/* Ambient Fluid Aurora Background (Liquidmorphism) */}
        <LiquidBackground />

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 1: IMMERSIVE 100vh THULIR SMART MINE CONTROL DESK (Full Bleed)
           ══════════════════════════════════════════════════════════════════ */}
        <section id="section-desk" className="desk-hero-landing-section">
          <SmartMineControlDesk
            data={latestData}
            risk={risk}
            mlPrediction={mlPrediction}
            nodeStatus={nodeStatus}
            alerts={alerts}
            nodeId={selectedNodeId}
            demoMode={demoMode}
            connectionType={connectionType}
            onToggleDemo={toggleDemoMode}
            onNavigateSection={(secId) => {
              const target = document.getElementById(secId);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </section>

        {/* ── Transition Bridge Separator ── */}
        <div className="desk-analytics-transition-bridge">
          <div className="bridge-line" />
          <div className="bridge-badge">
            <span className="bridge-dot" />
            <span>DEEP AI TELEMETRY & MULTI-NODE ANALYTICS</span>
          </div>
          <div className="bridge-line" />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 2: DETAILED ANALYTICS & MISSION CONTROL DASHBOARD APP SHELL
           ══════════════════════════════════════════════════════════════════ */}
        <div id="section-analytics" className="app-layout">
          {/* Left Sidebar Navigation */}
          <Sidebar
            alertCount={activeAlertCount}
            sidebarOpen={sidebarOpen}
            mode={mode}
            onSelectMode={setCategoryMode}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onCloseSidebar={() => setSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="main-content">
            {/* Top Sticky Command Bar */}
            <CommandBar
              connectionType={demoMode ? 'DISCONNECTED' : connectionType}
              lastTimestamp={latestData?.created_at || null}
              demoMode={demoMode}
              onToggleDemo={toggleDemoMode}
              theme={theme}
              mode={mode}
              onSelectTheme={setTheme}
              onSelectMode={setCategoryMode}
              alertCount={activeAlertCount}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Page Content */}
            <div className="page-content">
              {/* Configuration Warning Banner */}
              {!isSupabaseConfigured && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 18px', margin: '16px 32px 24px 32px',
                  background: 'var(--status-watch-bg)',
                  border: '1px solid var(--status-watch-border)',
                  borderRadius: 16,
                  fontSize: '0.8rem', color: 'var(--status-watch)',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)',
                }}>
                  <AlertCircle size={16} />
                  <div>
                    <strong>Supabase credentials not configured.</strong> Running in{' '}
                    <strong>Simulated Demo Mode</strong>. Provide <code>VITE_SUPABASE_URL</code> and{' '}
                    <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to connect live.
                  </div>
                </div>
              )}

              {/* Detailed Mission Control Content */}
              <div className="desk-detailed-content-wrapper">
                {/* ── HERO SECTION ── */}
                <div className="hero-section reveal" id="hero">
              <div className="hero-content">
                <div className="hero-eyebrow">
                  <span className="hero-live-dot" />
                  THULIR AI · Mine Safety Intelligence Platform
                </div>
                <h1 className="hero-headline">
                  Safer Mines.<br />
                  <span className="hero-gradient-word">Smarter</span> Decisions.
                </h1>
                <p className="hero-subline">
                  AI-powered subsidence early warning platform for subsurface coal mines.
                  Real-time ESP8266 multi-sensor fusion with Random Forest risk intelligence —
                  analyzed every 5 seconds.
                </p>
                <div className="hero-cta-group">
                  <button className="btn-primary" onClick={() => {
                    document.getElementById('section-analytics')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <Activity size={15} />
                    <span>View Live Telemetry Trends</span>
                    <ArrowUpRight size={14} style={{ opacity: 0.8 }} />
                  </button>
                  <button className="btn-secondary" onClick={() => {
                    document.getElementById('section-ml')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <Brain size={15} />
                    <span>AI Model Analysis</span>
                  </button>
                  <button className="btn-vibrant-outline" onClick={() => {
                    document.getElementById('section-overview')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <Sparkles size={14} />
                    <span>Live Health</span>
                  </button>
                </div>
              </div>

              {/* Floating hero stat cards */}
              <div className="hero-visual-area">
                <HeroStatCard
                  label="Risk Level"
                  value={risk.level}
                  sub={`Score: ${risk.score}/100 · ${risk.source}`}
                  color={riskColor}
                  glowColor={riskColor}
                />
                <HeroStatCard
                  label="Active Node"
                  value={selectedNodeId}
                  sub={isTelemetryFresh ? 'Online & Streaming' : 'Awaiting Packets'}
                  color={isTelemetryFresh ? 'var(--status-normal)' : 'var(--status-watch)'}
                  glowColor="var(--status-normal)"
                />
                <HeroStatCard
                  label="Active Alerts"
                  value={String(activeAlertCount)}
                  sub={activeAlertCount === 0 ? 'All zones nominal' : `${activeAlertCount} hazard warnings`}
                  color={activeAlertCount > 0 ? 'var(--status-critical)' : 'var(--status-normal)'}
                  glowColor={activeAlertCount > 0 ? 'var(--status-critical)' : undefined}
                />
                <HeroStatCard
                  label="AI Inference"
                  value={mlPrediction ? mlPrediction.prediction.replace('_', ' ') : 'Awaiting'}
                  sub={mlPrediction ? `${(mlPrediction.confidence * 100).toFixed(0)}% confidence` : '—'}
                  color="var(--brand-purple)"
                  glowColor="var(--brand-purple)"
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
                    <stop offset="0%" stopColor="var(--brand-green)" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="var(--brand-blue)" stopOpacity="0.22" />
                  </linearGradient>
                </defs>
                {/* Mountain silhouette */}
                <path d="M0 380 L80 200 L150 280 L230 140 L310 260 L380 100 L460 230 L530 180 L600 260 L600 380 Z"
                  fill="url(#sky-grad)" />
                {/* Strata lines */}
                <path d="M0 310 Q150 295 300 308 T600 300 L600 320 Q450 312 300 324 T0 330 Z"
                  fill="var(--brand-green)" opacity="0.1" />
                <path d="M0 335 Q150 322 300 335 T600 328 L600 345 Q450 338 300 348 T0 350 Z"
                  fill="var(--brand-blue)" opacity="0.08" />
                <path d="M0 358 Q150 348 300 358 T600 352 L600 368 Q450 360 300 370 T0 370 Z"
                  fill="var(--brand-green)" opacity="0.06" />
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

            {/* ── SECTION 1: SYSTEM OVERVIEW & SPATIAL FLEET ── */}
            <section id="section-overview" className="page-section">
              <div className="reveal">
                <GPSCard
                  node={activeNode}
                  allNodes={allNodesWithStatus}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                />
              </div>
            </section>

            {/* ── SECTION 2: A-POD MULTI-NODE EVIDENCE FUSION ── */}
            <section id="section-apod" className="page-section reveal">
              <APODPanel
                apod={apod}
                nodes={allNodesWithStatus}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </section>

            {/* ── SECTION 3: NODE SELECTOR ── */}
            <section id="section-nodes" className="page-section reveal">
              <NodeSelectorBar
                nodes={allNodesWithStatus}
                activeNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                demoMode={demoMode}
              />
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
        </div>

        {/* ── Footer ── */}
        <footer className="app-footer">
          <div className="footer-brand">
            <div className="footer-brand-name">THULIR <span className="gradient-text-vibrant">AI</span></div>
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
  </div>
  </>
  );
}
