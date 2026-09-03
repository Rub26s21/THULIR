// ============================================================
// THULIR - Cosmic Galaxy & Starfield Motion Graphics Canvas
// ============================================================
// Features crisp multi-layered starfield, rotating nebula clouds,
// shooting meteors, and scroll/mouse parallax effects without neon glow.

import { useEffect, useRef } from 'react';
import type { VisualTheme } from '../hooks/useTheme';

interface GalaxyBackgroundProps {
  theme?: VisualTheme | string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface NebulaParticle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
}

export function GalaxyBackground({ theme = 'dark' }: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let scrollY = window.scrollY;
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const isDark = theme.startsWith('dark');

    // Crisp Star Colors Palette (No neon)
    const starColors = isDark
      ? ['#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#e0e7ff', '#f8fafc']
      : ['#0284c7', '#475569', '#64748b', '#3b82f6', '#0f172a'];

    // 1. Generate Star Layers (600 stars)
    const starCount = Math.min(Math.floor((width * height) / 2200), 650);
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      const z = Math.random() * 2.5 + 1; // 1 to 3.5
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 2.2,
        z,
        radius: (Math.random() * 1.3 + 0.3) * (z / 2),
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.006,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // 2. Generate Soft Celestial Nebula Clouds (Refined, no harsh neon)
    const nebulaCount = 6;
    const nebulae: NebulaParticle[] = [];
    const nebulaColors = isDark
      ? [
          'rgba(30, 58, 138, 0.22)',   // Deep Blue
          'rgba(67, 56, 202, 0.20)',   // Deep Indigo
          'rgba(88, 28, 135, 0.18)',   // Muted Violet
          'rgba(14, 116, 144, 0.18)',  // Deep Cyan
          'rgba(15, 23, 42, 0.35)',    // Deep Space Dust
        ]
      : [
          'rgba(186, 230, 253, 0.25)', // Soft Sky
          'rgba(224, 231, 255, 0.25)', // Soft Lavender
          'rgba(241, 245, 249, 0.35)', // Crisp Mist
          'rgba(199, 210, 254, 0.22)', // Soft Blue
        ];

    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 320 + 260,
        color: nebulaColors[i % nebulaColors.length],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }

    // 3. Meteor Shower (Crisp natural shooting stars)
    const meteors: Meteor[] = [];
    const createMeteor = (): Meteor => ({
      x: Math.random() * width * 1.3,
      y: Math.random() * (height * 0.6),
      len: Math.random() * 140 + 90,
      speed: Math.random() * 14 + 11,
      angle: (Math.PI / 4) + (Math.random() * 0.12 - 0.06),
      opacity: 1,
      active: true,
    });

    let lastMeteorTime = Date.now();
    let meteorInterval = Math.random() * 3000 + 2000;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Mouse Parallax easing
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      const mouseOffsetX = (mouseX - width / 2) * 0.04;
      const mouseOffsetY = (mouseY - height / 2) * 0.04;

      // --- 1. Render Cosmic Nebula Clouds ---
      nebulae.forEach((neb, idx) => {
        neb.x += neb.vx;
        neb.y += neb.vy;

        if (neb.x < -neb.radius) neb.x = width + neb.radius;
        if (neb.x > width + neb.radius) neb.x = -neb.radius;
        if (neb.y < -neb.radius) neb.y = height + neb.radius;
        if (neb.y > height + neb.radius) neb.y = -neb.radius;

        const parallaxY = -(scrollY * 0.18) % height;
        const drawX = neb.x + mouseOffsetX * (idx + 1.2);
        const drawY = neb.y + parallaxY + mouseOffsetY * (idx + 1.2);

        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, neb.radius);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(drawX, drawY, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 2. Render Starfield with Parallax (Crisp stars, no neon halo) ---
      stars.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.25) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        const depthSpeed = star.z * 0.28;
        const drawX = (star.x + mouseOffsetX * star.z) % width;
        let drawY = (star.y - scrollY * depthSpeed + mouseOffsetY * star.z) % (height * 1.5);
        if (drawY < 0) drawY += height * 1.5;

        ctx.save();
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(1, star.alpha));
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- 3. Spawn & Render Shooting Meteors (Clean starlight streaks) ---
      const now = Date.now();
      if (now - lastMeteorTime > meteorInterval) {
        meteors.push(createMeteor());
        lastMeteorTime = now;
        meteorInterval = Math.random() * 3200 + 1600;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (!m.active) continue;

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.opacity -= 0.018;

        if (m.opacity <= 0 || m.x > width + 250 || m.y > height + 250) {
          m.active = false;
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - Math.cos(m.angle) * m.len;
        const tailY = m.y - Math.sin(m.angle) * m.len;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        meteorGrad.addColorStop(0.6, `rgba(226, 232, 240, ${m.opacity * 0.6})`);
        meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${m.opacity})`);

        ctx.save();
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = m.opacity;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
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
        opacity: 1,
        transition: 'opacity 0.4s ease',
      }}
      aria-hidden="true"
    />
  );
}
