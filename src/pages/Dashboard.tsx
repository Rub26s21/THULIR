// ============================================================
// THULIR AI — Master Application Layout
// ============================================================
// Premium Liquidmorphism · Sidebar navigation · Hero section
// All data hooks, ML inference, alerts, and Supabase integration preserved.

import { useState, useMemo, useEffect } from 'react';
import { Sidebar, CommandBar } from '../components/Header';
import { NodeSelectorBar } from '../components/NodeSelectorBar';
import { APODPanel } from '../components/APODPanel.tsx';
import { GroundEventInvestigatorPanel } from '../components/GroundEventInvestigatorPanel';
import { GPSCard } from '../components/GPSCard';
import { AlertPanel } from '../components/AlertPanel';
import { MLHeroCard, MLDiagnosticsCard } from '../components/MLPanel';
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
import { useGroundEventInvestigator } from '../hooks/useGroundEventInvestigator';
import { evaluateRisk } from '../utils/riskEngine';
import { runMLInference } from '../utils/mlEngine';
import { isSupabaseConfigured } from '../lib/supabase';
import { Brain, Network, AlertCircle, Info } from 'lucide-react';

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

  const investigator = useGroundEventInvestigator({
    apod,
    nodes: allNodesWithStatus,
    alerts,
  });

  // Activate scroll-reveal animations
  useRevealObserver();

  // Activate interactive specular mouse shining on all cards
  useMouseShine();

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

            {/* ── SECTION 2B: THULIR AI GROUND EVENT INVESTIGATOR (NVIDIA NEMOTRON 3 ULTRA) ── */}
            <section id="section-investigator" className="page-section reveal">
              <GroundEventInvestigatorPanel
                investigator={investigator}
                apod={apod}
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

            {/* ── SECTION 5: AI / ML + ALERTS (L-SHAPED HUD GRID) ── */}
            <section id="section-ml" className="page-section">
              <div className="section-header">
                <Brain size={14} color="var(--brand-green)" strokeWidth={2} />
                <span className="section-eyebrow">AI Analysis</span>
                <span className="section-title">Risk Intelligence & Alert Dispatch · {selectedNodeId}</span>
              </div>
              <div className="ml-alerts-l-grid">
                {/* Top-Left: AI Hazard Intelligence Primary Hero Assessment */}
                <div className="ml-hero-slot reveal">
                  <MLHeroCard prediction={mlPrediction} />
                </div>

                {/* Top-Right: Safety Alert Dispatch Console */}
                <div id="section-alerts" className="alert-slot-wrapper reveal reveal-delay-1">
                  <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
                </div>

                {/* Bottom Full-Width: 4-Well Diagnostics Matrix & Class Voting Density */}
                <div className="ml-extended-slot reveal">
                  <MLDiagnosticsCard prediction={mlPrediction} />
                </div>
              </div>
            </section>

            {/* ── SECTION 6: NETWORK + SYSTEM ACTIVITY ── */}
            <section id="section-system" className="page-section">
              <div className="section-header">
                <Network size={15} color="var(--text-secondary)" strokeWidth={2.2} />
                <span className="section-eyebrow">Distributed Pipeline</span>
                <span className="section-title">Intelligence Pipeline &amp; System Activity</span>
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
