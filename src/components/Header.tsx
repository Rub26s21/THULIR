// ============================================================
// THULIR AI — Premium Navigation Sidebar & Command Bar Components
// ============================================================

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Layers, BarChart2, Brain, Bell,
  Network, Map, Settings, Play, Pause, Wifi, WifiOff, Radio, Menu,
  Sun, Moon
} from 'lucide-react';
import { formatTimeAgo } from '../utils/timeUtils';
import type { ConnectionType, FreshnessState } from '../types';
import type { VisualTheme, ColorMode } from '../hooks/useTheme';

const NAV_GROUPS = [
  {
    title: 'CORE INTELLIGENCE',
    items: [
      { id: 'section-overview',  label: 'Overview',      icon: LayoutDashboard, tag: null },
      { id: 'section-apod',      label: 'A-POD Fusion',  icon: Layers, tag: 'FUSION' },
      { id: 'section-analytics', label: 'Analytics',     icon: BarChart2, tag: null },
      { id: 'section-ml',        label: 'AI / ML',       icon: Brain, tag: 'ML' },
    ],
  },
  {
    title: 'OPERATIONS & SENSORS',
    items: [
      { id: 'section-alerts',    label: 'Alerts',        icon: Bell, isAlerts: true },
      { id: 'section-system',    label: 'Network',       icon: Network, tag: null },
      { id: 'maps',              label: 'Maps',          icon: Map, tag: 'GPS' },
      { id: 'system-settings',   label: 'System',        icon: Settings, tag: null },
    ],
  },
];

// Neural-Leaf / THULIR AI Logo Image
export function NeuralLeafLogo({ size = 34 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="THULIR AI Logo"
      width={size}
      height={size}
      style={{
        objectFit: 'contain',
        borderRadius: '8px',
        filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.35))',
        transition: 'transform 0.25s ease',
      }}
    />
  );
}

interface SidebarProps {
  alertCount?: number;
  sidebarOpen: boolean;
  mode: ColorMode;
  onSelectMode: (mode: ColorMode) => void;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

export function Sidebar({
  alertCount = 0,
  sidebarOpen,
  mode,
  onSelectMode,
  onCloseSidebar,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState('section-overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const group of NAV_GROUPS) {
        for (const item of group.items) {
          const el = document.getElementById(item.id);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              setActiveSection(item.id);
              return;
            }
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
    onCloseSidebar();
  };

  return (
    <nav
      className={`ai-sidebar ${sidebarOpen ? 'open' : ''}`}
      aria-label="Primary navigation"
    >
      {/* 3D Illuminated Brand Bezel */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-orb">
            <NeuralLeafLogo size={34} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">
              THULIR <span className="gradient-text-vibrant">AI</span>
            </div>
            <div className="sidebar-brand-status">
              <span className="sidebar-pulse-dot" />
              <span>MINE SAFETY NET</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Group Sections */}
      <div className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="sidebar-group-block">
            <div className="sidebar-section-label">
              <span>{group.title}</span>
              <div className="sidebar-label-line" />
            </div>

            <div className="sidebar-btn-stack">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isAlerts = item.isAlerts;

                return (
                  <button
                    key={item.id}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="nav-btn-indicator" />
                    <div className="nav-btn-icon-wrapper">
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                    </div>
                    <span className="nav-btn-label">{item.label}</span>

                    {/* Alert notification count or micro badge */}
                    {isAlerts && alertCount > 0 ? (
                      <span className="sidebar-badge-pulse">{alertCount}</span>
                    ) : item.tag ? (
                      <span className="sidebar-micro-tag">{item.tag}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tactile Dual-Chamber Theme Switcher */}
      <div className="sidebar-theme-wrapper">
        <div className="sidebar-theme-switch-tray">
          <div
            className="sidebar-theme-slider-thumb"
            style={{
              transform: mode === 'dark' ? 'translateX(100%)' : 'translateX(0%)',
            }}
          />
          <button
            className={`sidebar-theme-pill-btn ${mode === 'light' ? 'is-active' : ''}`}
            onClick={() => onSelectMode('light')}
            title="Switch to Light Appearance"
          >
            <Sun size={13} className="theme-pill-icon" />
            <span>Light</span>
          </button>
          <button
            className={`sidebar-theme-pill-btn ${mode === 'dark' ? 'is-active' : ''}`}
            onClick={() => onSelectMode('dark')}
            title="Switch to Dark Appearance"
          >
            <Moon size={13} className="theme-pill-icon" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* 3D Recessed Botanical Mission Footprint */}
      <div className="sidebar-bottom">
        <div className="sidebar-mission-card">
          <div className="mission-title-row">
            <span className="mission-highlight">SAFER MINES</span>
            <span className="mission-badge">ACTIVE</span>
          </div>
          <p className="mission-desc">
            Smarter Decisions.<br />
            A Greener Tomorrow.
          </p>
          <div className="mission-meta-strip">
            <span className="meta-dot" />
            <span>24/7 AI TELEMETRY</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface CommandBarProps {
  connectionType: ConnectionType;
  lastTimestamp: string | null;
  demoMode: boolean;
  onToggleDemo: () => void;
  theme: VisualTheme;
  mode: ColorMode;
  onSelectTheme: (theme: VisualTheme) => void;
  onSelectMode: (mode: ColorMode) => void;
  alertCount?: number;
  onToggleSidebar?: () => void;
}

export function CommandBar({
  connectionType,
  lastTimestamp,
  demoMode,
  onToggleDemo,
  mode,
  onSelectMode,
  onToggleSidebar,
}: CommandBarProps) {
  const formattedTime = lastTimestamp ? formatTimeAgo(lastTimestamp) : 'No data';

  return (
    <header className="command-bar" role="banner">
      {/* Mobile Hamburger */}
      {onToggleSidebar && (
        <button
          className="cmd-btn"
          onClick={onToggleSidebar}
          id="mobile-nav-toggle"
          aria-label="Toggle navigation"
          style={{ display: 'none' }}
        >
          <Menu size={16} />
        </button>
      )}

      {/* Search */}
      <div className="command-search" role="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span>Search nodes, alerts, or telemetry…</span>
        <span className="command-kbd">⌘ K</span>
      </div>

      {/* Right Controls */}
      <div className="command-bar-right">
        {/* Connection Status Pill */}
        <div className="skeuo-pill" title="Telemetry channel">
          {connectionType === 'REALTIME' && (
            <>
              <Wifi size={12} color="var(--status-normal)" />
              <span style={{ color: 'var(--status-normal)', fontWeight: 700 }}>REALTIME</span>
            </>
          )}
          {connectionType === 'POLLING' && (
            <>
              <Radio size={12} color="var(--status-watch)" />
              <span style={{ color: 'var(--status-watch)', fontWeight: 700 }}>POLLING</span>
            </>
          )}
          {connectionType === 'DISCONNECTED' && (
            <>
              <WifiOff size={12} color="var(--text-muted)" />
              <span>DISCONNECTED</span>
            </>
          )}
        </div>

        {/* Last Tx */}
        <div className="skeuo-pill" title="Last transmission">
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
            Tx: <strong style={{ color: 'var(--text-primary)' }}>{formattedTime}</strong>
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

        {/* One-Click Dark / Light Mode Switcher */}
        <button
          className="theme-quick-toggle-btn"
          onClick={() => onSelectMode(mode === 'light' ? 'dark' : 'light')}
          title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle dark and light theme"
        >
          {mode === 'light' ? (
            <>
              <Sun size={14} className="theme-toggle-icon sun" />
              <span className="theme-toggle-label">LIGHT</span>
            </>
          ) : (
            <>
              <Moon size={14} className="theme-toggle-icon moon" />
              <span className="theme-toggle-label">DARK</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

// Backwards compatibility alias
export interface HeaderProps {
  connectionType: ConnectionType;
  freshness?: FreshnessState;
  lastTimestamp: string | null;
  demoMode: boolean;
  onToggleDemo: () => void;
  theme: VisualTheme;
  mode: ColorMode;
  onSelectTheme: (theme: VisualTheme) => void;
  onSelectMode: (mode: ColorMode) => void;
  alertCount?: number;
}

export function Header(props: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Sidebar
        alertCount={props.alertCount}
        sidebarOpen={sidebarOpen}
        mode={props.mode}
        onSelectMode={props.onSelectMode}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
      <CommandBar
        {...props}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </>
  );
}
