import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../../motion/reducedMotion';
import { LOGO_MARK } from './logoMark';
import { seededRandom } from './random';

const CELL = 26; // grid pitch in CSS px
const PIXEL = 20; // square size inside a cell
const INTRO_MS = 2200;
const GLOW_RADIUS = 160;

interface Particle {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function readColor(el: Element, name: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/**
 * The hero's live pixel grid. On load, indigo pixels fly in from across the
 * grid and assemble the logo's stepped mark; afterwards squares near the
 * cursor light up. Draws one still frame for reduced motion, and pauses
 * whenever the hero is off screen.
 */
export default function HeroCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas?.getContext('2d') ?? null;
    } catch {
      ctx = null; // jsdom and very old browsers: the CSS background shows instead.
    }
    if (!canvas || !ctx) return;
    const c = ctx;

    const reduced = prefersReducedMotion();
    const accent = readColor(canvas, '--accent', '#4b3bff');
    const glow = readColor(canvas, '--accent-glow', '#8f85ff');

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let particles: Particle[] = [];
    let twinkles: { x: number; y: number; phase: number }[] = [];
    const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
    let start = performance.now();
    let frame = 0;
    let running = false;

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);

      // Each square of the mark is drawn as a block of grid pixels.
      // Sized and placed to sit to the right of the headline, not behind it.
      const scale = cols >= 70 ? 3 : cols >= 36 ? 2 : 1;
      const markCols = LOGO_MARK[0].length * scale;
      const markRows = LOGO_MARK.length * scale;
      const originX = Math.max(1, cols - markCols - Math.max(1, Math.round(cols * 0.06)));
      const originY = cols >= 36 ? Math.round(rows * 0.42 - markRows / 2) : 2;
      const random = seededRandom(11);

      particles = [];
      LOGO_MARK.forEach((line, my) =>
        line.forEach((filled, mx) => {
          if (!filled) return;
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              particles.push({
                fromX: Math.floor(random() * cols),
                fromY: Math.floor(random() * rows),
                toX: originX + mx * scale + dx,
                toY: originY + my * scale + dy,
                delay: random() * 700 + mx * 60,
              });
            }
          }
        }),
      );

      twinkles = Array.from({ length: Math.round(cols * rows * 0.012) }, () => ({
        x: Math.floor(random() * cols),
        y: Math.floor(random() * rows),
        phase: random() * Math.PI * 2,
      }));
    }

    function square(x: number, y: number) {
      const off = (CELL - PIXEL) / 2;
      c.fillRect(x * CELL + off, y * CELL + off, PIXEL, PIXEL);
    }

    function draw(now: number) {
      const elapsed = reduced ? Infinity : now - start;
      c.clearRect(0, 0, width, height);

      // Base grid.
      c.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) square(x, y);

      // Slow ambient twinkles.
      c.fillStyle = glow;
      for (const t of twinkles) {
        c.globalAlpha = reduced ? 0.25 : 0.08 + 0.5 * Math.max(0, Math.sin(now / 1400 + t.phase)) ** 3;
        square(t.x, t.y);
      }

      // Cursor glow, eased toward the real pointer for a heavier feel.
      pointer.sx += (pointer.x - pointer.sx) * 0.12;
      pointer.sy += (pointer.y - pointer.sy) * 0.12;
      if (pointer.sx > -1000) {
        const r = Math.ceil(GLOW_RADIUS / CELL);
        const cx = Math.floor(pointer.sx / CELL);
        const cy = Math.floor(pointer.sy / CELL);
        for (let y = cy - r; y <= cy + r; y++) {
          for (let x = cx - r; x <= cx + r; x++) {
            const d = Math.hypot(x * CELL + CELL / 2 - pointer.sx, y * CELL + CELL / 2 - pointer.sy);
            if (d > GLOW_RADIUS) continue;
            c.globalAlpha = (1 - d / GLOW_RADIUS) ** 2 * 0.75;
            square(x, y);
          }
        }
      }

      // The logo mark assembling.
      c.fillStyle = accent;
      for (const p of particles) {
        const t = easeOutExpo(Math.max(0, (elapsed - p.delay) / (INTRO_MS - 700)));
        c.globalAlpha = Math.min(1, t * 1.5);
        square(p.fromX + (p.toX - p.fromX) * t, p.fromY + (p.toY - p.fromY) * t);
      }
      c.globalAlpha = 1;
    }

    function loop(now: number) {
      draw(now);
      if (running) frame = requestAnimationFrame(loop);
    }

    function play() {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }

    function pause() {
      running = false;
      cancelAnimationFrame(frame);
    }

    layout();
    draw(performance.now());
    start = performance.now();

    const resize = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    resize.observe(canvas);

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()));
    visibility.observe(canvas);

    const section = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      if (pointer.sx < -1000) {
        pointer.sx = pointer.x;
        pointer.sy = pointer.y;
      }
    };
    const onLeave = () => {
      pointer.x = pointer.y = pointer.sx = pointer.sy = -9999;
    };
    if (!reduced && hasFinePointer()) {
      section.addEventListener('pointermove', onMove);
      section.addEventListener('pointerleave', onLeave);
    }

    return () => {
      pause();
      resize.disconnect();
      visibility.disconnect();
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} className={`heroCanvas ${className}`} aria-hidden="true" data-testid="hero-canvas" />;
}
