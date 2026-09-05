// ============================================================
// THULIR - Mission-Control Master Navigation Bar
// ============================================================

import { useState, useEffect } from 'react';
import {
  Activity, Play, Pause, Wifi, WifiOff, Radio, Palette, ShieldAlert
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

const NAV_ITEMS = [
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-telemetry', label: 'Telemetry' },
  { id: 'section-analytics', label: 'Analytics' },
  { id: 'section-ml', label: 'AI / ML' },
  { id: 'section-alerts', label: 'Alerts' },
  { id: 'section-system', label: 'System' },
];

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
  const [activeSection, setActiveSection] = useState('section-overview');

  const formattedTime = lastTimestamp ? formatTimeAgo(lastTimestamp) : 'No data';
  const isLive = freshness === 'LIVE' || freshness === 'RECENT';
  const currentThemeMeta = THEME_LIST.find(t => t.id === theme) || THEME_LIST[3];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="mac-header-bar" role="banner">
        {/* Left: Brand Identity & Subsystem status */}
        <div className="header-brand-group">
          <div className="mac-traffic-lights" aria-hidden="true">
            <span className="traffic-light traffic-close" />
            <span className="traffic-light traffic-minimize" />
            <span className="traffic-light traffic-zoom" />
          </div>

          <div>
            <div className="header-main-title">
              <Activity size={18} color="var(--accent-cyan)" />
              <span>THULIR <span className="brand-cyan">IoT</span></span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(0, 212, 255, 0.12)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  marginLeft: 4,
                }}
              >
                SOC-V1.0
              </span>
            </div>
            <div className="header-sub-title">
              <ShieldAlert size={11} color="var(--status-normal)" />
              Mine Subsidence Early Warning System
            </div>
          </div>
        </div>

        {/* Center: Segmented Navigation Pill */}
        <nav className="header-nav-anchors" aria-label="Quick section navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-anchor-btn ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Live Telemetry Telemetry Status & Controls */}
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

          {/* Timestamp in Monospace */}
          <div className="skeuo-pill" title="Last transmission timestamp">
            <span style={{ color: 'var(--text-muted)' }}>Tx:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formattedTime}</span>
          </div>

          {/* Controls: Theme & Tactile Demo Toggle */}
          <div className="header-actions-group">
            <button
              className="btn-liquid"
              onClick={() => setShowThemeModal(true)}
              title="Change Visual Theme"
              aria-label="Appearance settings"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px' }}
            >
              <Palette size={13} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.72rem' }}>{currentThemeMeta.name}</span>
            </button>

            <button
              className={`btn-tactile ${demoMode ? 'active-demo' : ''}`}
              onClick={onToggleDemo}
              title={demoMode ? 'Exit simulation (Listen to live Supabase telemetry)' : 'Simulate live sensor telemetry'}
              aria-label="Toggle demo mode"
            >
              {demoMode ? <Pause size={12} /> : <Play size={12} />}
              <span>{demoMode ? 'SIMULATING' : 'LIVE'}</span>
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
