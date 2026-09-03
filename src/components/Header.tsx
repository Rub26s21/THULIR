// ============================================================
// THULIR - Apple Compact Master Navigation Bar
// ============================================================

import { useState } from 'react';
import {
  Activity, Play, Pause, Wifi, WifiOff, Radio, Palette
} from 'lucide-react';
import { formatTimeAgo } from '../utils/timeUtils';
import type { ConnectionType, FreshnessState } from '../types';
import type { VisualTheme, ColorMode } from '../hooks/useTheme';
import { THEME_LIST } from '../hooks/useTheme';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  connectionType: ConnectionType;
  freshness: FreshnessState;
  lastTimestamp: string | null;
  demoMode: boolean;
  onToggleDemo: () => void;
  theme: VisualTheme;
  mode: ColorMode;
  onSelectTheme: (theme: VisualTheme) => void;
  onSelectMode: (mode: ColorMode) => void;
}

export function Header({
  connectionType,
  freshness,
  lastTimestamp,
  demoMode,
  onToggleDemo,
  theme,
  mode,
  onSelectTheme,
  onSelectMode,
}: HeaderProps) {
  const [showThemeModal, setShowThemeModal] = useState(false);

  const formattedTime = lastTimestamp ? formatTimeAgo(lastTimestamp) : 'No data';
  const isLive = freshness === 'LIVE' || freshness === 'RECENT';
  const currentThemeMeta = THEME_LIST.find(t => t.id === theme) || THEME_LIST[3];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="mac-header-bar" role="banner">
        {/* Left: Traffic Lights & Brand */}
        <div className="header-brand-group">
          <div className="mac-traffic-lights" aria-hidden="true">
            <span className="traffic-light traffic-close" />
            <span className="traffic-light traffic-minimize" />
            <span className="traffic-light traffic-zoom" />
          </div>

          <div>
            <div className="header-main-title">
              <Activity size={20} color="var(--accent)" />
              THULIR <span className="brand-cyan">IoT</span>
            </div>
            <div className="header-sub-title">
              Structural &amp; Environmental Intelligence
            </div>
          </div>
        </div>

        {/* Center: Quick Section Navigation Anchors */}
        <nav className="header-nav-anchors" aria-label="Quick section navigation">
          <button className="nav-anchor-btn" onClick={() => scrollToSection('section-overview')}>
            Overview
          </button>
          <button className="nav-anchor-btn" onClick={() => scrollToSection('section-telemetry')}>
            Telemetry
          </button>
          <button className="nav-anchor-btn" onClick={() => scrollToSection('section-analytics')}>
            Analytics
          </button>
          <button className="nav-anchor-btn" onClick={() => scrollToSection('section-ml')}>
            AI / ML
          </button>
          <button className="nav-anchor-btn" onClick={() => scrollToSection('section-alerts')}>
            Alerts
          </button>
          <button className="nav-anchor-btn" onClick={() => scrollToSection('section-system')}>
            System
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="header-metrics-bar">
          {/* Node Identity Pill */}
          <div className="skeuo-pill pill-node" title="Hardware identity">
            NODE_01
          </div>

          {/* Node Status Pill */}
          <div
            className={`skeuo-pill ${isLive ? 'pill-online' : 'pill-offline'}`}
            title="Node connectivity state"
          >
            <span className={`pulse-dot ${isLive ? 'dot-green' : 'dot-gray'}`} />
            <span>{isLive ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Realtime / Polling Transport Pill */}
          <div className="skeuo-pill" title="Telemetry ingestion channel">
            {connectionType === 'REALTIME' && (
              <>
                <Wifi size={11} color="var(--status-normal)" />
                <span style={{ color: 'var(--status-normal)' }}>REALTIME</span>
              </>
            )}
            {connectionType === 'POLLING' && (
              <>
                <Radio size={11} color="var(--status-watch)" />
                <span style={{ color: 'var(--status-watch)' }}>POLLING</span>
              </>
            )}
            {connectionType === 'DISCONNECTED' && (
              <>
                <WifiOff size={11} color="var(--status-offline)" />
                <span>DISCONNECTED</span>
              </>
            )}
          </div>

          {/* Relative Timestamp */}
          <div className="skeuo-pill" title="Last transmission timestamp">
            <span style={{ color: 'var(--text-muted)' }}>Updated:</span>
            <span style={{ fontWeight: 600 }}>{formattedTime}</span>
          </div>

          {/* Controls: Appearance / Theme Selector Button */}
          <div className="header-actions-group">
            <button
              className="btn-liquid"
              onClick={() => setShowThemeModal(true)}
              title="Change Visual Theme"
              aria-label="Appearance settings"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px' }}
            >
              <Palette size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.74rem' }}>{currentThemeMeta.name}</span>
            </button>

            {/* Tactile Demo Mode Toggle */}
            <button
              className={`btn-tactile ${demoMode ? 'active-demo' : ''}`}
              onClick={onToggleDemo}
              title={demoMode ? 'Exit simulation (Listen to live Supabase telemetry)' : 'Simulate live sensor telemetry'}
              aria-label="Toggle demo mode"
            >
              {demoMode ? <Pause size={13} /> : <Play size={13} />}
              <span>{demoMode ? 'DEMO: ON' : 'DEMO: OFF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Theme Selection Modal Popover */}
      {showThemeModal && (
        <ThemeSelector
          currentTheme={theme}
          currentMode={mode}
          onSelectTheme={(t) => {
            onSelectTheme(t);
          }}
          onSelectMode={(m) => {
            onSelectMode(m);
          }}
          onClose={() => setShowThemeModal(false)}
        />
      )}
    </>
  );
}
