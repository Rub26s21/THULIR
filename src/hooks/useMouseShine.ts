// ============================================================
// THULIR AI — Interactive Specular Shine & Mouse Tracking
// ============================================================
// Calculates local cursor (X, Y) relative to any hovered card
// and dynamically drives the liquid glass reflection spotlight.

import { useEffect } from 'react';

export function useMouseShine() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement)?.closest?.(
        '.clay-card, .sensor-card-skeuo, .node-card, .hero-stat-card, .risk-hero-card, .theme-option-card, .btn-primary, .btn-secondary, .skeuo-card, .hero-section'
      ) as HTMLElement | null;

      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
}
