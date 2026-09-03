// ============================================================
// THULIR - Apple-Inspired Multi-Theme Manager (5 Distinct Themes)
// ============================================================

import { useState, useEffect } from 'react';

export type VisualTheme =
  | 'light-vision'
  | 'light-glass'
  | 'light-minimal'
  | 'dark-apple'
  | 'dark-space';

export type ColorMode = 'light' | 'dark';

export interface ThemeMeta {
  id: VisualTheme;
  name: string;
  category: ColorMode;
  tagline: string;
}

export const THEME_LIST: ThemeMeta[] = [
  {
    id: 'light-vision',
    name: 'Apple Vision',
    category: 'light',
    tagline: 'Warm neutral tones, soft depth & calm cyan accents',
  },
  {
    id: 'light-glass',
    name: 'Frosted Glass',
    category: 'light',
    tagline: 'Refined translucent surfaces & atmospheric highlights',
  },
  {
    id: 'light-minimal',
    name: 'Ultra Minimal',
    category: 'light',
    tagline: 'Pure white clarity, hairline borders & zero distraction',
  },
  {
    id: 'dark-apple',
    name: 'Dark Apple Pro',
    category: 'dark',
    tagline: 'Deep charcoal matte surfaces & OLED-grade contrast',
  },
  {
    id: 'dark-space',
    name: 'Deep Space',
    category: 'dark',
    tagline: 'Near-black cosmic void & aerospace telemetry clarity',
  },
];

export function useTheme() {
  const [theme, setTheme] = useState<VisualTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thulir-theme-id') as VisualTheme;
      if (
        saved === 'light-vision' ||
        saved === 'light-glass' ||
        saved === 'light-minimal' ||
        saved === 'dark-apple' ||
        saved === 'dark-space'
      ) {
        return saved;
      }
      // Migrate old 2-mode storage if present
      const oldMode = localStorage.getItem('thulir-theme');
      if (oldMode === 'light') return 'light-vision';
    }
    return 'dark-apple';
  });

  const mode: ColorMode = theme.startsWith('light') ? 'light' : 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-mode', mode);
    localStorage.setItem('thulir-theme-id', theme);
    localStorage.setItem('thulir-theme', mode);
  }, [theme, mode]);

  const setCategoryMode = (newMode: ColorMode) => {
    if (newMode === 'light' && mode !== 'light') {
      setTheme('light-vision');
    } else if (newMode === 'dark' && mode !== 'dark') {
      setTheme('dark-apple');
    }
  };

  const toggleMode = () => {
    setCategoryMode(mode === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    mode,
    setTheme,
    setCategoryMode,
    toggleMode,
    themes: THEME_LIST,
  };
}
