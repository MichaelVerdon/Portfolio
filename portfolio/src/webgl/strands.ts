import { seededRandom } from '../components/geometry/random';

/**
 * Curly strands that sweep through the page as you scroll, after the
 * curly tubes on lusion.co. Pure maths, no three.js.
 *
 * Every key heading (an "anchor") gets its own strand. Each one comes in
 * from a different edge and depth, curls once or twice on the way, runs
 * flat under the heading to underline it, then curls away off another
 * edge. Long stretches between headings get a free strand deeper in the
 * scene. As you scroll, a strand draws in from its tail to its head, holds
 * on the underline while the heading is in view, then flows off and
 * erases behind itself, so lines keep appearing in new places instead of
 * one repeating coil.
 *
 * x and y are page pixels (y from the top of the document); z is in world
 * units, 0 being the plane the page sits on, negative going away.
 */

export interface Anchor {
  /** Left and right edge of the text, in page pixels. */
  left: number;
  right: number;
  /** Where the underline runs, in page pixels from the top. */
  y: number;
}

export interface PathPoint {
  x: number;
  y: number;
  z: number;
}

export interface View {
  width: number;
  height: number;
}

/** Scroll positions (page pixels) and how far along the strand is drawn by then (0 to 1). */
export interface Keyframe {
  scroll: number;
  at: number;
}

export interface Strand {
  points: PathPoint[];
  /** Index in `points` of the end of the underline, when it has one. */
  underlineEnd?: number;
  /** How the head (leading end) advances with scroll. `at: -1` means "the underline's end". */
  head: Keyframe[];
  /** How the tail (trailing end) follows. */
  tail: Keyframe[];
}

type Side = 'left' | 'right' | 'top' | 'bottom';
const SIDES: Side[] = ['left', 'bottom', 'right', 'top'];

/** A point just off one edge of the screen, around page height `y`. */
function edgePoint(side: Side, y: number, view: View, random: () => number, z: number): PathPoint {
  const { width: w, height: h } = view;
  switch (side) {
    case 'left':
      return { x: -0.12 * w, y: y + (random() - 0.5) * h * 0.6, z };
    case 'right':
      return { x: 1.12 * w, y: y + (random() - 0.5) * h * 0.6, z };
    case 'top':
      return { x: w * (0.2 + random() * 0.6), y: y - h * 0.75, z };
    default:
      return { x: w * (0.2 + random() * 0.6), y: y + h * 0.75, z };
  }
}

/**
 * A loop-the-loop around `center`: a little over one turn, drifting in
 * depth so it reads as a 3D curl rather than a flat circle.
 */
function curl(center: PathPoint, radius: number, random: () => number, clockwise: boolean): PathPoint[] {
  const turns = 1.1 + random() * 0.5;
  const start = random() * Math.PI * 2;
  const steps = 9;
  const dir = clockwise ? 1 : -1;
  const depth = 4 + random() * 6;
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const a = start + dir * t * turns * Math.PI * 2;
    const r = radius * (0.75 + 0.25 * Math.sin(t * Math.PI));
    return {
      x: center.x + Math.cos(a) * r,
      y: center.y + Math.sin(a) * r,
      z: center.z + Math.sin(a + 1) * depth,
    };
  });
}

function lerpPoint(a: PathPoint, b: PathPoint, t: number, z?: number): PathPoint {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: z ?? a.z + (b.z - a.z) * t };
}

/** A strand that underlines one heading. */
function anchorStrand(a: Anchor, index: number, view: View): Strand {
  const random = seededRandom(101 + index * 17);
  const { height: h, width: w } = view;
  // Entry and exit edges change from heading to heading.
  const entrySide = SIDES[(index * 3 + Math.floor(random() * 2)) % SIDES.length];
  const exitSide = SIDES[(SIDES.indexOf(entrySide) + 1 + Math.floor(random() * 3)) % SIDES.length];
  const entry = edgePoint(entrySide, a.y, view, random, -12 - random() * 18);
  const exit = edgePoint(exitSide, a.y, view, random, -14 - random() * 22);

  const radius = Math.min(w, h) * (0.07 + random() * 0.06);
  const start: PathPoint = { x: a.left, y: a.y, z: 0 };
  const end: PathPoint = { x: a.right, y: a.y, z: 0 };

  // One curl on the way in, sometimes one on the way out.
  const inCurl = curl(lerpPoint(entry, start, 0.55, -6 - random() * 8), radius, random, random() > 0.5);
  const lead = { x: a.left - Math.min(120, w * 0.08), y: a.y + (random() - 0.5) * 30, z: -1.5 };
  const span = a.right - a.left;
  const underline = [0, 1 / 3, 2 / 3, 1].map((t) => ({ x: a.left + span * t, y: a.y, z: 0 }));
  const follow = { x: a.right + Math.min(120, w * 0.08), y: a.y + (random() - 0.5) * 40, z: -2 };
  const outCurl = random() > 0.4 ? curl(lerpPoint(end, exit, 0.45, -8 - random() * 10), radius * 0.8, random, random() > 0.5) : [];

  const points = [entry, ...inCurl, lead, ...underline, follow, ...outCurl, exit];
  const underlineEnd = 1 + inCurl.length + 1 + underline.length - 1;

  return {
    points,
    underlineEnd,
    // Draws in as the heading rises from the bottom of the screen, is
    // fully under the heading by the time it's 60% of the way up, then
    // flows off as the heading leaves the top.
    head: [
      { scroll: a.y - 1.05 * h, at: 0 },
      { scroll: a.y - 0.6 * h, at: -1 },
      { scroll: a.y - 0.25 * h, at: -1 },
      { scroll: a.y + 0.1 * h, at: 1 },
    ],
    tail: [
      { scroll: a.y - 0.6 * h, at: 0 },
      { scroll: a.y + 0.45 * h, at: 1 },
    ],
  };
}

/** A free strand deep in the scene, crossing a long gap between headings. */
function freeStrand(y0: number, y1: number, index: number, view: View): Strand {
  const random = seededRandom(301 + index * 29);
  const { width: w, height: h } = view;
  const fromLeft = random() > 0.5;
  const z = -22 - random() * 16;
  const entry = { x: fromLeft ? -0.15 * w : 1.15 * w, y: y0, z };
  const exit = { x: fromLeft ? 1.15 * w : -0.15 * w, y: y1, z: z - 10 };
  const radius = Math.min(w, h) * (0.1 + random() * 0.08);
  const middle = curl(lerpPoint(entry, exit, 0.35 + random() * 0.3), radius, random, random() > 0.5);
  const points = [entry, lerpPoint(entry, exit, 0.2, z + (random() - 0.5) * 10), ...middle, lerpPoint(entry, exit, 0.8), exit];
  return {
    points,
    head: [
      { scroll: y0 - h, at: 0 },
      { scroll: y1 - 0.4 * h, at: 1 },
    ],
    tail: [
      { scroll: y0 - 0.4 * h, at: 0 },
      { scroll: y1 + 0.2 * h, at: 1 },
    ],
  };
}

export function buildStrands(input: Anchor[], view: View): Strand[] {
  const anchors = [...input].filter((a) => a.right > a.left).sort((a, b) => a.y - b.y);
  const strands = anchors.map((a, i) => anchorStrand(a, i, view));
  // Fill long stretches (the pinned story, the project grid) with free strands.
  anchors.forEach((a, i) => {
    const next = anchors[i + 1];
    if (!next) return;
    const gap = next.y - a.y;
    const count = Math.floor(gap / (view.height * 1.4));
    for (let k = 0; k < count; k++) {
      const y0 = a.y + (gap * (k + 0.3)) / (count + 0.6);
      strands.push(freeStrand(y0, y0 + view.height * 0.9, i * 5 + k, view));
    }
  });
  return strands;
}

/**
 * How far along (0 to 1) a strand end is at this scroll position.
 * `underline` is where the underline ends, as a fraction of the strand.
 */
export function progressAt(keys: Keyframe[], scroll: number, underline = 0.5): number {
  const value = (k: Keyframe) => (k.at < 0 ? underline : k.at);
  if (scroll <= keys[0].scroll) return value(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (scroll <= b.scroll) {
      const t = (scroll - a.scroll) / Math.max(1, b.scroll - a.scroll);
      // Ease in and out so strands glide rather than tick along.
      const s = t * t * (3 - 2 * t);
      return value(a) + (value(b) - value(a)) * s;
    }
  }
  return value(keys[keys.length - 1]);
}
