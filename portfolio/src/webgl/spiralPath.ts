/**
 * The path of the spiral that winds down the page. Pure maths, no three.js.
 *
 * The spiral is a coil around the page: each time it swings to the front it
 * runs flat under a key heading (an "anchor"), underlining it, then loops
 * back into the distance and round again to the next one. Long gaps
 * between headings get extra turns so the coil keeps an even pitch.
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

/** How deep the back of each loop goes. */
export const LOOP_DEPTH = 26;

export function spiralPath(input: Anchor[], view: View): PathPoint[] {
  const anchors = [...input].filter((a) => a.right > a.left).sort((a, b) => a.y - b.y);
  if (anchors.length === 0) return [];

  const { width, height } = view;
  const margin = Math.min(80, Math.max(16, width * 0.04));
  const leftX = margin;
  const rightX = width - margin;
  const midX = width / 2;
  const points: PathPoint[] = [];

  /** Behind the page from the right edge round to the left, between y0 and y1. */
  const backLoop = (y0: number, y1: number) => {
    const d = y1 - y0;
    points.push(
      { x: rightX, y: y0 + d * 0.2, z: -10 },
      { x: midX, y: y0 + d * 0.5, z: -LOOP_DEPTH },
      { x: leftX, y: y0 + d * 0.8, z: -10 },
    );
  };

  // Lead in from the upper left, out of the distance.
  const first = anchors[0];
  points.push({ x: leftX, y: Math.max(0, first.y - height * 0.35), z: -18 });

  anchors.forEach((a, i) => {
    // The underline itself: flat, on the page plane.
    points.push({ x: a.left, y: a.y, z: 0 }, { x: (a.left + a.right) / 2, y: a.y, z: 0 }, { x: a.right, y: a.y, z: 0 });

    const next = anchors[i + 1];
    if (!next) return;
    const gap = next.y - a.y;
    const turns = Math.max(1, Math.round(gap / (height * 1.1)));
    for (let t = 0; t < turns; t++) {
      const y0 = a.y + (gap * t) / turns;
      const y1 = a.y + (gap * (t + 1)) / turns;
      backLoop(y0, y1);
      // Extra turns swing past the front just behind the page, underlining nothing.
      if (t < turns - 1) points.push({ x: midX, y: y1, z: -3 });
    }
  });

  // Trail off into the distance after the last heading.
  const last = anchors[anchors.length - 1];
  points.push(
    { x: rightX, y: last.y + height * 0.25, z: -10 },
    { x: midX, y: last.y + height * 0.5, z: -LOOP_DEPTH },
    { x: leftX, y: last.y + height * 0.75, z: -45 },
  );
  return points;
}

/** Index of the first sample below `y`, so the spiral is drawn down to there. */
export function drawIndexFor(sampleYs: ArrayLike<number>, y: number): number {
  let lo = 0;
  let hi = sampleYs.length;
  // The path only ever heads down the page, so the samples are (near enough) sorted.
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sampleYs[mid] <= y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
