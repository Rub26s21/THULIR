// ============================================================
// THULIR - 3D Subterranean Strata Mesh & Sensor Constellation Canvas
// ============================================================
// Thematic 3D geological strata wireframe representing underground coal mine layers

import { useEffect, useRef } from 'react';
import type { VisualTheme } from '../hooks/useTheme';

interface GalaxyBackgroundProps {
  theme?: VisualTheme | string;
}

export function GalaxyBackground({ theme = 'dark-apple' }: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isDark = !theme.startsWith('light');

    // 3D Strata Mesh Grid Configuration
    const cols = 28;
    const rows = 16;
    let time = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isDark) {
        time += 0.012;

        // 3D Perspective Projection Matrix
        const fov = 340;
        const horizon = height * 0.48;

        const points: { x: number; y: number; z: number; px: number; py: number }[][] = [];

        for (let r = 0; r < rows; r++) {
          points[r] = [];
          for (let c = 0; c < cols; c++) {
            // Isometric / perspective coordinate calculation
            const x3d = (c - cols / 2) * 60;
            const z3d = (r + 1) * 55;
            // Harmonic wave representing geological strata oscillation
            const y3d = Math.sin(c * 0.35 + time) * 18 + Math.cos(r * 0.4 + time * 0.8) * 14;

            const scale = fov / (fov + z3d);
            const px = width / 2 + x3d * scale;
            const py = horizon + (y3d + 120) * scale + z3d * 0.45;

            points[r][c] = { x: x3d, y: y3d, z: z3d, px, py };
          }
        }

        // Draw Translucent Wireframe Mesh Lines
        ctx.save();
        ctx.lineWidth = 1;

        // 1. Horizontal Strata Lines
        for (let r = 0; r < rows; r++) {
          const depthAlpha = Math.max(0.02, 0.16 * (1 - r / rows));
          ctx.strokeStyle = r % 2 === 0 ? `rgba(0, 229, 255, ${depthAlpha})` : `rgba(124, 92, 255, ${depthAlpha * 0.85})`;

          ctx.beginPath();
          for (let c = 0; c < cols; c++) {
            const pt = points[r][c];
            if (c === 0) ctx.moveTo(pt.px, pt.py);
            else ctx.lineTo(pt.px, pt.py);
          }
          ctx.stroke();
        }

        // 2. Vertical Geological Fault Lines
        for (let c = 0; c < cols; c += 2) {
          ctx.strokeStyle = `rgba(0, 229, 255, 0.06)`;
          ctx.beginPath();
          for (let r = 0; r < rows; r++) {
            const pt = points[r][c];
            if (r === 0) ctx.moveTo(pt.px, pt.py);
            else ctx.lineTo(pt.px, pt.py);
          }
          ctx.stroke();
        }

        // 3. Glowing Sensor Node Points on Strata
        for (let r = 2; r < rows - 2; r += 3) {
          for (let c = 3; c < cols - 3; c += 4) {
            const pt = points[r][c];
            const pulse = (Math.sin(time * 2 + r + c) + 1) * 0.5;

            ctx.fillStyle = '#00e5ff';
            ctx.globalAlpha = 0.25 + pulse * 0.35;
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, 2 + pulse * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
