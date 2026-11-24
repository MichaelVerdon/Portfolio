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
}

type Point = [number, number, number, number]; // x, y, z, size

/** The stepped mark from the logo, filled in (1 = square). 7 columns by 3 rows. */
export const LOGO_VOXELS: number[][] = [
  [0, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1],
];

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

/** A wide floor of cubes that ripples behind the project list. */
export function field(budget: number): Point[] {
  const cols = Math.max(2, Math.round(Math.sqrt(budget * 2.4)));
  const rows = Math.max(2, Math.floor(budget / cols));
  const s = 2.3;
  const points: Point[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      points.push([(c - (cols - 1) / 2) * s, -8, (r - (rows - 1) / 2) * s, 0.9]);
    }
  return points;
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
  const budget = Math.floor(total * SHAPE_SHARE);
  // Sorting left to right makes morphs sweep across rather than scramble.
  const shape = SHAPES[id](budget)
    .slice(0, total)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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
  return { positions, sizes, shapeCount: shape.length };
}
