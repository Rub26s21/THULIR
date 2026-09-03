// ============================================================
// THULIR - Apple-Inspired Appearance & Theme Selector Modal
// ============================================================

import { X, Check, Sun, Moon, Sparkles, Layers, Minimize2, Terminal, Orbit } from 'lucide-react';
import type { VisualTheme, ColorMode } from '../hooks/useTheme';
import { THEME_LIST } from '../hooks/useTheme';

interface ThemeSelectorProps {
  currentTheme: VisualTheme;
  currentMode: ColorMode;
  onSelectTheme: (theme: VisualTheme) => void;
  onSelectMode: (mode: ColorMode) => void;
  onClose: () => void;
}

const THEME_ICONS: Record<VisualTheme, any> = {
  'light-vision': Sparkles,
  'light-glass': Layers,
  'light-minimal': Minimize2,
  'dark-apple': Terminal,
  'dark-space': Orbit,
};

export function ThemeSelector({
  currentTheme,
  currentMode,
  onSelectTheme,
  onSelectMode,
  onClose,
}: ThemeSelectorProps) {
  const lightThemes = THEME_LIST.filter(t => t.category === 'light');
  const darkThemes = THEME_LIST.filter(t => t.category === 'dark');

  return (
    <div className="theme-modal-backdrop" onClick={onClose}>
      <div className="theme-modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-label="Appearance settings">
        {/* Header */}
        <div className="theme-modal-header">
          <div>
            <div className="theme-modal-title">Appearance &amp; Visual Language</div>
            <div className="theme-modal-subtitle">5 Apple-designed themes for the same unified THULIR telemetry system</div>
          </div>
          <button className="theme-modal-close-btn" onClick={onClose} aria-label="Close theme selector">
            <X size={16} />
          </button>
        </div>

        {/* Mode Segmented Switcher */}
        <div className="theme-mode-segmented">
          <button
            className={`theme-mode-seg-btn ${currentMode === 'light' ? 'active' : ''}`}
            onClick={() => onSelectMode('light')}
          >
            <Sun size={15} /> Light Mode
          </button>
          <button
            className={`theme-mode-seg-btn ${currentMode === 'dark' ? 'active' : ''}`}
            onClick={() => onSelectMode('dark')}
          >
            <Moon size={15} /> Dark Mode
          </button>
        </div>

        {/* Light Themes Grid */}
        <div className="theme-category-section">
          <div className="theme-category-title">
            <Sun size={13} color="var(--accent)" /> LIGHT THEMES
          </div>
          <div className="theme-grid">
            {lightThemes.map(t => {
              const Icon = THEME_ICONS[t.id];
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  className={`theme-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTheme(t.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-card-header">
                    <div className="theme-card-icon-wrap">
                      <Icon size={16} />
                    </div>
                    {isSelected && (
                      <div className="theme-card-badge">
                        <Check size={12} strokeWidth={3} /> ACTIVE
                      </div>
                    )}
                  </div>
                  <div className="theme-card-name">{t.name}</div>
                  <div className="theme-card-desc">{t.tagline}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dark Themes Grid */}
        <div className="theme-category-section" style={{ marginTop: 18 }}>
          <div className="theme-category-title">
            <Moon size={13} color="var(--accent)" /> DARK THEMES
          </div>
          <div className="theme-grid">
            {darkThemes.map(t => {
              const Icon = THEME_ICONS[t.id];
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  className={`theme-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTheme(t.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="theme-card-header">
                    <div className="theme-card-icon-wrap">
                      <Icon size={16} />
                    </div>
                    {isSelected && (
                      <div className="theme-card-badge">
                        <Check size={12} strokeWidth={3} /> ACTIVE
                      </div>
                    )}
                  </div>
                  <div className="theme-card-name">{t.name}</div>
                  <div className="theme-card-desc">{t.tagline}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
