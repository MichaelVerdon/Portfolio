import { LOGO_MARK } from '../components/geometry/logoMark';
import { seededRandom } from '../components/geometry/random';
import type { SceneId } from './chapters';

/**
 * Pure maths for the 3D story: where every cube sits in each chapter.
 * Units are world units; the camera sees about 32 units top to bottom.
 *
 * Every formation has the same number of cubes, so any chapter can morph
 * into any other. The first part of the list makes up the shape; the rest
 * is "dust", tiny cubes scattered deep in the background that stay put and
 * give the scene depth.
 */

export interface Formation {
  /** x, y, z for each cube. */
  positions: Float32Array;
  /** Edge length of each cube. */
  sizes: Float32Array;
  /** How many cubes, from the start, belong to the shape (the rest are dust). */
  shapeCount: number;
  /** r, g, b (0 to 1) for each shape cube, when the shape has its own colours (logos). */
  colors?: Float32Array;
}

/** x, y, z, size, and optionally r, g, b. */
type Point = [number, number, number, number, ...number[]];

/** The stepped line of squares from the logo, the same grid the 2D hero uses. */
export const LOGO_VOXELS: number[][] = LOGO_MARK;

/** Share of the cubes that build the shape; the rest are dust. */
export const SHAPE_SHARE = 0.6;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function fibonacciSphere(count: number, radius: number, size: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * GOLDEN;
    return [Math.cos(a) * r * radius, y * radius, Math.sin(a) * r * radius, size] as Point;
  });
}

export function logo(budget: number): Point[] {
  const cells = LOGO_VOXELS.flat().filter(Boolean).length;
  // Largest k (cubes per cell edge) that fits, two cubes deep.
  const k = Math.max(1, Math.floor(Math.sqrt(budget / (cells * 2))));
  const cell = 3.2;
  const step = cell / k;
  const cols = LOGO_VOXELS[0].length;
  const rows = LOGO_VOXELS.length;
  const points: Point[] = [];
  LOGO_VOXELS.forEach((line, row) =>
    line.forEach((filled, col) => {
      if (!filled) return;
      for (let gy = 0; gy < k; gy++)
        for (let gx = 0; gx < k; gx++)
          for (let gz = 0; gz < 2; gz++) {
            const x = (col - cols / 2) * cell + (gx + 0.5) * step;
            const y = (rows / 2 - row) * cell - (gy + 0.5) * step;
            const z = (gz - 0.5) * step;
            points.push([x, y, z, step * 0.8]);
          }
    }),
  );
  return points;
}

export function sphere(budget: number): Point[] {
  const outer = Math.round(budget * 0.72);
  const inner = budget - outer;
  const size = (r: number, n: number) => Math.sqrt((4 * Math.PI * r * r) / n) * 0.5;
  return [...fibonacciSphere(outer, 10, size(10, outer)), ...fibonacciSphere(inner, 4.5, size(4.5, inner))];
}

/** A rising staircase of columns, like the logo's steps seen in 3D. */
export function steps(budget: number): Point[] {
  const total = (g: number) => g * g * ((g + 1) / 2);
  let g = 3;
  while (total(g + 1) <= budget) g++;
  const span = 17;
  const s = span / g;
  const points: Point[] = [];
  for (let x = 0; x < g; x++)
    for (let z = 0; z < g; z++) {
      const h = 1 + Math.floor(((x + z) / (2 * (g - 1))) * (g - 1) + 0.5);
      for (let y = 0; y < h; y++) {
        points.push([(x - (g - 1) / 2) * s, (y - g / 2) * s, (z - (g - 1) / 2) * s, s * 0.86]);
      }
    }
  return points;
}

/** A hub with satellites on tilted orbits, joined by dotted links. */
export function network(budget: number): Point[] {
  const hubCount = Math.round(budget * 0.22);
  const satellites = 9;
  const points: Point[] = fibonacciSphere(hubCount, 3, 0.62);
  const satelliteCubes = satellites * 8;
  const linkCubes = Math.max(0, budget - hubCount - satelliteCubes);
  const perLink = Math.floor(linkCubes / satellites);
  for (let i = 0; i < satellites; i++) {
    const ring = i % 3;
    const radius = 9 + ring * 1.6;
    const angle = (i / satellites) * Math.PI * 2 + ring * 0.4;
    const tilt = (ring - 1) * 0.55;
    const cx = Math.cos(angle) * radius;
    const cy = Math.sin(angle) * radius * Math.sin(tilt) + (ring - 1) * 2.5;
    const cz = Math.sin(angle) * radius * Math.cos(tilt);
    for (let j = 0; j < 8; j++) {
      points.push([cx + ((j & 1) - 0.5) * 0.9, cy + (((j >> 1) & 1) - 0.5) * 0.9, cz + ((j >> 2) - 0.5) * 0.9, 0.8]);
    }
    for (let j = 1; j <= perLink; j++) {
      const t = 0.22 + (j / (perLink + 1)) * 0.68;
      points.push([cx * t, cy * t, cz * t, 0.28]);
    }
  }
  return points;
}

/** An evenly spaced lattice cube: precise, repeatable, built to scale. */
export function monolith(budget: number): Point[] {
  const k = Math.max(2, Math.floor(Math.cbrt(budget)));
  const span = 13;
  const s = span / (k - 1);
  const points: Point[] = [];
  for (let x = 0; x < k; x++)
    for (let y = 0; y < k; y++)
      for (let z = 0; z < k; z++) {
        const edge = [x, y, z].filter((v) => v === 0 || v === k - 1).length;
        // Edges of the cube read as solid lines; the inside is finer.
        points.push([x * s - span / 2, y * s - span / 2, z * s - span / 2, edge >= 2 ? s * 0.62 : s * 0.3]);
      }
  return points;
}

/**
 * Towers of glassy cubes rising out of a misty floor behind the project
 * list, a nod to the data towers of early-2000s console menus. Heights roll
 * gently across the grid; colour runs from deep blue at the base to pale
 * cyan at the top.
 */
export function field(budget: number): Point[] {
  const height = (c: number, r: number) =>
    1 + Math.round(2.5 + 2.2 * Math.sin(c * 0.55 + r * 0.25) + 1.4 * Math.cos(r * 0.7 - c * 0.3));
  // Grow the grid until it uses the budget.
  let cols = 4;
  const count = (n: number) => {
    let total = 0;
    for (let r = 0; r < Math.ceil(n * 0.6); r++) for (let c = 0; c < n; c++) total += height(c, r);
    return total;
  };
  while (count(cols + 1) <= budget) cols++;
  const rows = Math.ceil(cols * 0.6);
  const s = 2.1;
  const points: Point[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const h = height(c, r);
      for (let y = 0; y < h; y++) {
        const t = y / 7;
        points.push([
          (c - (cols - 1) / 2) * s,
          -8 + y * s * 0.62,
          (r - (rows - 1) / 2) * s,
          s * 0.58,
          0.25 + 0.45 * t,
          0.45 + 0.45 * t,
          1,
        ]);
      }
    }
  return points;
}

/**
 * Every shape cube packed into one solid block: the boot intro gathers the
 * cubes into this, then bursts it into the first chapter.
 */
export function bootCore(total: number): Formation {
  const budget = Math.floor(total * SHAPE_SHARE);
  const k = Math.max(2, Math.floor(Math.cbrt(budget)));
  const s = 0.78;
  const points: Point[] = [];
  for (let x = 0; x < k; x++)
    for (let y = 0; y < k; y++)
      for (let z = 0; z < k; z++) points.push([(x - (k - 1) / 2) * s, (y - (k - 1) / 2) * s, (z - (k - 1) / 2) * s, s * 0.9]);
  return assemble(points, total);
}

/** Three tilted rings, like the skills section's orbit drawing. */
export function orbit(budget: number): Point[] {
  const radii = [5, 8.5, 12];
  const tilts = [0.3, -0.5, 1.1];
  const sum = radii.reduce((a, b) => a + b, 0);
  const points: Point[] = [];
  radii.forEach((radius, i) => {
    const n = Math.round((budget * radius) / sum);
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const y0 = Math.sin(a) * radius;
      points.push([x, y0 * Math.cos(tilts[i]), y0 * Math.sin(tilts[i]), 0.55]);
    }
  });
  return points;
}

const SHAPES: Record<SceneId, (budget: number) => Point[]> = {
  logo,
  sphere,
  steps,
  network,
  monolith,
  field,
  orbit,
};

/** Dust: fixed tiny cubes far behind everything, the same in every chapter. */
function dust(count: number): Point[] {
  const random = seededRandom(7);
  return Array.from({ length: count }, () => [
    (random() - 0.5) * 130,
    (random() - 0.5) * 70,
    -20 - random() * 60,
    0.12 + random() * 0.18,
  ]);
}

export function buildFormation(id: SceneId, total: number): Formation {
  return assemble(SHAPES[id](Math.floor(total * SHAPE_SHARE)), total);
}

function assemble(points: Point[], total: number): Formation {
  // Sorting left to right makes morphs sweep across rather than scramble.
  const shape = points.slice(0, total).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  // Dust is indexed by cube, so a cube that is dust in two chapters stays put.
  const scatter = dust(total);
  const all = [...shape, ...scatter.slice(shape.length)];
  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  all.forEach(([x, y, z, size], i) => {
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    sizes[i] = size;
  });
  const colored = shape.length > 0 && shape.every((p) => p.length >= 7);
  const colors = colored ? Float32Array.from(shape.flatMap((p) => p.slice(4, 7))) : undefined;
  return { positions, sizes, shapeCount: shape.length, colors };
}

/** RGBA pixels, as from a canvas's getImageData. */
export interface Pixels {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

/** Largest a logo gets, in world units. */
const LOGO_BOX = { width: 19, height: 14 };

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The cells of a logo, sampled at grid resolution: every pixel that isn't
 * background becomes a cube in the logo's own colour. The background is
 * transparency if the image has any, or else the top-left corner's colour.
 */
export function logoCells(px: Pixels): Point[] {
  const { width: cols, height: rows, data } = px;
  const bg = [data[0], data[1], data[2], data[3]];
  // Any see-through pixel means the background is transparency, even when
  // the logo itself fills the top-left corner.
  let transparentBg = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 128) {
      transparentBg = true;
      break;
    }
  }
  const size = Math.min(LOGO_BOX.width / cols, LOGO_BOX.height / rows);
  const points: Point[] = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 4;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 128) continue;
      if (!transparentBg && Math.hypot(r - bg[0], g - bg[1], b - bg[2]) < 80) continue;
      let [cr, cg, cb] = [r / 255, g / 255, b / 255];
      // Black or grey ink would vanish on the black page: draw it in soft
      // white. Dark colours keep their hue but are lifted so they show.
      const lum = luminance(cr, cg, cb);
      const saturation = Math.max(cr, cg, cb) - Math.min(cr, cg, cb);
      if (lum < 0.3 && saturation < 0.15) [cr, cg, cb] = [0.9, 0.9, 0.93];
      else if (lum < 0.18) [cr, cg, cb] = [cr, cg, cb].map((v) => Math.min(1, (v * 0.18) / Math.max(lum, 0.01) + 0.04));
      points.push([(col - (cols - 1) / 2) * size, ((rows - 1) / 2 - row) * size, 0, size * 0.86, cr, cg, cb]);
    }
  return points;
}

/**
 * A logo built from cubes. `sample(cols, rows)` draws the image at that
 * grid size; the grid is made as fine as the cube budget allows, so the
 * logo uses most of the cubes whatever its shape.
 */
export function logoFormation(sample: (cols: number, rows: number) => Pixels, aspect: number, total: number): Formation {
  const budget = Math.floor(total * SHAPE_SHARE);
  // First guess assumes the logo fills about half its box.
  let cols = Math.max(4, Math.round(Math.sqrt((budget / 0.5) * aspect)));
  let cells: Point[] = [];
  for (let attempt = 0; attempt < 8; attempt++) {
    const rows = Math.max(2, Math.round(cols / aspect));
    cells = logoCells(sample(cols, rows));
    if (cells.length <= budget) break;
    cols = Math.max(4, Math.floor(cols * Math.sqrt(budget / cells.length) * 0.97));
  }
  return assemble(cells.slice(0, budget), total);
}
