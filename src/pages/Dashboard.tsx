// ============================================================
// THULIR - Master Unified Apple-Inspired IoT Monitoring System
// ============================================================
// ONE UI/UX System | ONE Information Architecture | FIVE Visual Themes
// Multi-Node Wireless Mesh & Spatial Strata Risk Foundation

import { useState, useMemo } from 'react';
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
import { GalaxyBackground } from '../components/GalaxyBackground';
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
import {
  Activity, Shield, Brain, Network, Info
} from 'lucide-react';

export function Dashboard() {
  const [showLaunch, setShowLaunch] = useState(true);
  const { theme, mode, setTheme, setCategoryMode } = useTheme();

  // Multi-node state management
  const [selectedNodeId, setSelectedNodeId] = useState<string>('NODE_01');

  const {
    latestData,
    history,
    historyLoading,
    historyError,
    timeRange,
    setTimeRange,
    connectionType,
    demoMode,
    toggleDemoMode,
    supabaseConfigured,
  } = useSensorData(selectedNodeId);

  // Derive node status & freshness
  const nodeStatus = useNodeHealth(latestData, selectedNodeId);
  const isTelemetryFresh = nodeStatus.freshness === 'LIVE' || nodeStatus.freshness === 'RECENT';

  // Multi-node mesh tracking
  const {
    allNodesWithStatus,
    activeNode,
    nodeLinks,
  } = useMultiNode(selectedNodeId, isTelemetryFresh);

  // Compute ML prediction for active node
  const mlPrediction = useMemo(
    () => (latestData ? runMLInference(latestData) : null),
    [latestData]
  );

  // Compute central risk state combining physical thresholds and ML inference
  const risk = useMemo(
    () => evaluateRisk(latestData, mlPrediction),
    [latestData, mlPrediction]
  );

  // Prototype Zone Risk Aggregation across zones
  const zoneRisks = useMemo(() => {
    const riskMap: Record<string, typeof risk> = {
      [selectedNodeId]: risk,
    };
    return KNOWN_ZONES.map((zone) =>
      calculateZoneRisk(zone.id, allNodesWithStatus, riskMap)
    );
  }, [allNodesWithStatus, selectedNodeId, risk]);

  // Central Alert Engine hook
  const { alerts, acknowledgeAlert } = useAlerts(
    latestData,
    mlPrediction
  );

  return (
    <>
      {/* Native Apple "hello" Startup Screen */}
      {showLaunch && (
        <LaunchScreen onComplete={() => setShowLaunch(false)} />
      )}

      {/* Dynamic Galaxy Background (Active in Dark Themes) */}
      <GalaxyBackground theme={theme} />

      <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="mac-window-frame">
          {/* Supabase Configuration Banner (if unconfigured) */}
          {!isSupabaseConfigured && (
            <div style={{ background: 'var(--status-watch-bg)', border: '1px solid var(--status-watch-border)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: 'var(--status-watch)', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>⚙️ Supabase Credentials Not Configured</div>
              <div>Running in <strong>Simulated Demo Mode</strong>. Provide <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to connect live.</div>
            </div>
          )}

          {/* Top Compact Apple Navigation */}
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
          />

          {/* Multi-Node Mesh Selector Bar */}
          <NodeSelectorBar
            nodes={allNodesWithStatus}
            activeNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            demoMode={demoMode}
          />

          {/* Awaiting Telemetry Banner (when live without incoming packets) */}
          {!latestData && !demoMode && (
            <div className="skeuo-well" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Info size={16} color="var(--accent)" />
                <span>
                  <strong>Awaiting {selectedNodeId} Live Telemetry:</strong> Listening for incoming sensor packets from Supabase...
                </span>
              </div>
              <button className="btn-liquid active-demo" onClick={toggleDemoMode} style={{ fontSize: '0.72rem' }}>
                Enable Demo Simulation
              </button>
            </div>
          )}

          {/* 1. SYSTEM OVERVIEW: Overall Structural Risk + Sector Zones + Node Health */}
          <section id="section-overview" className="section-wrapper">
            <div className="section-header-title">
              <Shield size={15} color="var(--accent)" />
              <span>System Overview &amp; Hardware Health</span>
            </div>
            <div className="hero-overview-grid" style={{ marginBottom: 16 }}>
              <RiskPanel risk={risk} />
              <NodeHealth nodeStatus={nodeStatus} />
            </div>

            {/* Prototype Spatial Zone Risk & GNSS Location Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
              <ZoneRiskPanel zones={zoneRisks} />
              <GPSCard node={activeNode} />
            </div>
          </section>

          {/* 2. LIVE SENSOR TELEMETRY (4-Column Responsive Grid) */}
          <section id="section-telemetry" className="section-wrapper">
            <div className="section-header-title">
              <Activity size={15} color="var(--accent)" />
              <span>Live Multi-Sensor Telemetry ({selectedNodeId} Array)</span>
            </div>
            <SensorGrid data={latestData} />
          </section>

          {/* 3. ANALYTICS & TIME-SERIES CHARTS */}
          <section id="section-analytics" className="section-wrapper">
            <HistoricalCharts
              history={history}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              loading={historyLoading}
              error={historyError}
            />
          </section>

          {/* 4. AI / ML RISK ANALYSIS & ALERT CENTER */}
          <section id="section-ml" className="section-wrapper">
            <div className="section-header-title">
              <Brain size={15} color="var(--accent)" />
              <span>AI Risk Analysis &amp; Inference ({selectedNodeId})</span>
            </div>
            <div className="bottom-dual-grid">
              <MLPanel prediction={mlPrediction} />
              <div id="section-alerts">
                <AlertPanel
                  alerts={alerts}
                  onAcknowledge={acknowledgeAlert}
                />
              </div>
            </div>
          </section>

          {/* 5. NETWORK TOPOLOGY & SYSTEM ACTIVITY */}
          <section id="section-system" className="section-wrapper">
            <div className="section-header-title">
              <Network size={15} color="var(--accent)" />
              <span>Network Topology &amp; Live Ingestion Stream</span>
            </div>
            <div className="topology-activity-grid">
              <NetworkTopology
                connectionType={demoMode ? 'DISCONNECTED' : connectionType}
                freshness={nodeStatus.freshness}
                supabaseConnected={supabaseConfigured}
                activeNodeId={selectedNodeId}
                nodeLinks={nodeLinks}
              />
              <SystemActivity
                latestData={latestData}
                mlPrediction={mlPrediction}
                risk={risk}
                connectionType={demoMode ? 'SIMULATED DEMO' : connectionType}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
