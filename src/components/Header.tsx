// ============================================================
// THULIR AI — Premium Left Navigation Sidebar + Command Bar
// ============================================================

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Activity, BarChart2, Brain, Bell,
  Network, Map, Settings, Play, Pause, Wifi, WifiOff, Radio, Palette, Menu, X
} from 'lucide-react';
import { formatTimeAgo } from '../utils/timeUtils';
import type { ConnectionType, FreshnessState } from '../types';
import type { VisualTheme, ColorMode } from '../hooks/useTheme';
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
  alertCount?: number;
}

const NAV_ITEMS = [
  { id: 'section-overview',  label: 'Overview',   icon: LayoutDashboard },
  { id: 'section-telemetry', label: 'Telemetry',  icon: Activity },
  { id: 'section-analytics', label: 'Analytics',  icon: BarChart2 },
  { id: 'section-ml',        label: 'AI / ML',    icon: Brain },
  { id: 'section-alerts',    label: 'Alerts',     icon: Bell },
  { id: 'section-system',    label: 'Network',    icon: Network },
  { id: 'maps',              label: 'Maps',       icon: Map },
  { id: 'system-settings',   label: 'System',     icon: Settings },
];

// Neural-Leaf Logo SVG
function NeuralLeafLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 3C18 3 7 8 5.5 18C4 28 13 33 18 33C23 33 32 28 30.5 18C29 8 18 3 18 3Z"
        fill="#0F6B57"
        opacity="0.9"
      />
      <path d="M18 8 L18 30" stroke="white" strokeWidth="0.9" strokeOpacity="0.5" />
      <path d="M18 16 C13.5 16 9.5 14.5 8 11" stroke="white" strokeWidth="0.7" strokeOpacity="0.4" />
      <path d="M18 20 C13.5 20 10 22 8.5 25" stroke="white" strokeWidth="0.7" strokeOpacity="0.4" />
      <path d="M18 16 C22.5 16 26.5 14.5 28 11" stroke="white" strokeWidth="0.7" strokeOpacity="0.4" />
      <path d="M18 20 C22.5 20 26 22 27.5 25" stroke="white" strokeWidth="0.7" strokeOpacity="0.4" />
      <circle cx="18" cy="16" r="1.8" fill="white" fillOpacity="0.7" />
      <circle cx="18" cy="20" r="1.5" fill="white" fillOpacity="0.55" />
      <circle cx="13" cy="16" r="1.2" fill="white" fillOpacity="0.4" />
      <circle cx="23" cy="16" r="1.2" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

export function Header({
  connectionType,
  freshness: _freshness,
  lastTimestamp,
  demoMode,
  onToggleDemo,
  theme,
  mode,
  onSelectTheme,
  onSelectMode,
  alertCount = 0,
}: HeaderProps) {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activeSection, setActiveSection] = useState('section-overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const formattedTime = lastTimestamp ? formatTimeAgo(lastTimestamp) : 'No data';

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
    setSidebarOpen(false);
  };


  return (
    <>
      {/* ── Left Sidebar Navigation Rail ── */}
      <nav
        className={`ai-sidebar ${sidebarOpen ? 'open' : ''}`}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <NeuralLeafLogo size={36} />
            <div className="sidebar-brand-name">
              THULIR <span>AI</span>
            </div>
          </div>
          <div className="sidebar-brand-sub">Intelligent Mine Safety</div>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isAlerts = item.id === 'section-alerts';
            return (
              <button
                key={item.id}
                className={`sidebar-nav-btn ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <Icon size={17} strokeWidth={1.75} />
                <span>{item.label}</span>
                {isAlerts && alertCount > 0 && (
                  <span className="sidebar-badge">{alertCount}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom tagline & botanical motif */}
        <div className="sidebar-bottom">
          <div className="sidebar-tagline">
            <strong>Safer Mines</strong>
            Smarter Decisions.<br />
            A Greener Tomorrow.
          </div>
          {/* Tiny neural-leaf motif */}
          <svg
            className="sidebar-leaf-motif"
            width="60"
            height="40"
            viewBox="0 0 60 40"
            fill="none"
          >
            <path
              d="M30 5 C30 5 12 12 10 25 C8 38 20 42 30 42 C40 42 52 38 50 25 C48 12 30 5 30 5Z"
              fill="#0F6B57"
              opacity="0.6"
            />
            <path d="M30 10 L30 38" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
            <path d="M30 22 C22 22 16 20 13 16" stroke="white" strokeWidth="0.6" strokeOpacity="0.4" />
            <path d="M30 22 C38 22 44 20 47 16" stroke="white" strokeWidth="0.6" strokeOpacity="0.4" />
          </svg>
        </div>
      </nav>

      {/* ── Top Command Bar ── */}
      <header className="command-bar" role="banner">
        {/* Mobile Hamburger */}
        <button
          className="cmd-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ display: 'none' }}
          id="mobile-nav-toggle"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Search */}
        <div className="command-search" role="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>Search nodes, alerts, or insights…</span>
          <span className="command-kbd">⌘ K</span>
        </div>

        {/* Right Controls */}
        <div className="command-bar-right">
          {/* Connection Status Pill */}
          <div className="skeuo-pill" title="Telemetry channel">
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
                <WifiOff size={11} color="var(--text-muted)" />
                <span>DISCONNECTED</span>
              </>
            )}
          </div>

          {/* Last Tx */}
          <div className="skeuo-pill" title="Last transmission">
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
              Tx: <strong>{formattedTime}</strong>
            </span>
          </div>

          {/* Demo Toggle */}
          <button
            className={`btn-tactile ${demoMode ? 'active-demo' : ''}`}
            onClick={onToggleDemo}
            title={demoMode ? 'Exit simulation — listen to live Supabase' : 'Simulate live sensor telemetry'}
            aria-label="Toggle demo mode"
          >
            {demoMode ? <Pause size={11} /> : <Play size={11} />}
            <span>{demoMode ? 'DEMO' : 'LIVE'}</span>
          </button>

          {/* Theme */}
          <button
            className="cmd-btn"
            onClick={() => setShowThemeModal(true)}
            title="Change visual theme"
            aria-label="Appearance settings"
          >
            <Palette size={15} />
          </button>

          {/* Alert bell */}
          <button className="cmd-btn" aria-label="Notifications">
            <Bell size={15} />
            {alertCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--status-critical)',
                  border: '1.5px solid var(--bg-app)',
                }}
              />
            )}
          </button>

          {/* Operator */}
          <div className="operator-pill">
            <div className="operator-avatar">NO</div>
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Node_Operator</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Mine Safety Team</div>
            </div>
          </div>
        </div>
      </header>

      {/* Theme Modal */}
      {showThemeModal && (
        <ThemeSelector
          currentTheme={theme}
          currentMode={mode}
          onSelectTheme={(t) => { onSelectTheme(t); }}
          onSelectMode={(m) => { onSelectMode(m); }}
          onClose={() => setShowThemeModal(false)}
        />
      )}
    </>
  );
}
