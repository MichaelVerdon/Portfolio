import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  TubeGeometry,
  Vector3,
  type Material,
  type Scene,
} from 'three';
import { seededRandom } from '../components/geometry/random';
import type { Tier } from './capability';
import { drawIndexFor, spiralPath, type Anchor } from './spiralPath';

/**
 * The space around the cubes:
 * - a spiral that winds down the page with the scroll, drawing itself in
 *   and running flat under each `[data-underline]` heading;
 * - icosahedrons (some solid and faceted, some wireframe) drifting at
 *   different depths for parallax;
 * - a starfield far behind everything.
 *
 * The spiral and icosahedrons are laid out in page coordinates, so they
 * scroll with the content rather than floating on top of it.
 */

const SPIRAL_COLOR = new Color('#9d94ff');
const RADIAL = 6;
/** How far down the screen the spiral has drawn itself to. */
const DRAW_TO = 0.78;

interface Icosa {
  /** Where on the page it sits, 0 top to 1 bottom. */
  at: number;
  side: -1 | 1;
  z: number;
  radius: number;
  wire: boolean;
  /** 0 moves with the page, lower drifts slower (further away). */
  parallax: number;
}

const ICOSAS: Icosa[] = [
  { at: 0.04, side: 1, z: -34, radius: 2.4, wire: false, parallax: 0.45 },
  { at: 0.1, side: -1, z: -48, radius: 4.5, wire: true, parallax: 0.3 },
  { at: 0.22, side: -1, z: -22, radius: 1.5, wire: false, parallax: 0.6 },
  { at: 0.33, side: 1, z: -70, radius: 13, wire: true, parallax: 0.2 },
  { at: 0.46, side: -1, z: -36, radius: 2.8, wire: false, parallax: 0.45 },
  { at: 0.58, side: 1, z: -26, radius: 1.7, wire: true, parallax: 0.55 },
  { at: 0.7, side: -1, z: -60, radius: 7, wire: true, parallax: 0.25 },
  { at: 0.82, side: 1, z: -30, radius: 2.5, wire: false, parallax: 0.5 },
  { at: 0.94, side: -1, z: -42, radius: 3.2, wire: true, parallax: 0.35 },
];

export class SpaceLayer {
  private spiral = new Group();
  private icosaGroup = new Group();
  private stars: Points;
  private tube?: Mesh<TubeGeometry, MeshBasicMaterial>;
  private comet: Mesh;
  private spiralMaterial = new MeshBasicMaterial({ color: SPIRAL_COLOR, toneMapped: false });
  private sampleYs = new Float32Array(0);
  private samplePoints: Vector3[] = [];
  private drawn = 0;
  private icosas: { def: Icosa; object: Group; spin: Vector3 }[] = [];
  private materials: Material[] = [];
  private docHeight = 1;
  private observer: ResizeObserver;
  private remeasureTimer = 0;

  constructor(
    private scene: Scene,
    private tier: Exclude<Tier, 'off'>,
    /** World units per CSS pixel on the page plane (z = 0). */
    private worldPerPx: () => number,
    /** Half the visible width and height at a given depth, in world units. */
    private halfSize: (z: number) => { w: number; h: number },
  ) {
    const comet = new MeshBasicMaterial({ color: 0xffffff });
    this.materials.push(comet, this.spiralMaterial);
    this.comet = new Mesh(new IcosahedronGeometry(0.22, 0), comet);
    this.comet.visible = false;
    this.spiral.add(this.comet);

    this.stars = new Points(
      new BufferGeometry(),
      new PointsMaterial({
        color: 0xcfd2ff,
        size: 0.45,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    this.materials.push(this.stars.material as Material);

    this.buildIcosas();
    scene.add(this.spiral, this.icosaGroup, this.stars);

    // Re-measure the headings whenever the page changes size (fonts loading,
    // the pinned story adding its scroll space, a project list expanding).
    this.observer = new ResizeObserver(this.scheduleMeasure);
    this.observer.observe(document.body);
    this.measure();
  }

  private scheduleMeasure = () => {
    window.clearTimeout(this.remeasureTimer);
    this.remeasureTimer = window.setTimeout(() => this.measure(), 150);
  };

  private buildIcosas() {
    const lite = this.tier === 'lite';
    const random = seededRandom(5);
    ICOSAS.filter((_, i) => !lite || i % 2 === 0).forEach((def) => {
      const object = new Group();
      const geometry = new IcosahedronGeometry(def.radius, def.wire && def.radius > 5 ? 1 : 0);
      if (!def.wire) {
        const solid = new MeshStandardMaterial({ color: '#25253a', metalness: 0.5, roughness: 0.35, flatShading: true });
        this.materials.push(solid);
        object.add(new Mesh(geometry, solid));
      }
      const lines = new LineBasicMaterial({
        color: def.wire ? 0xffffff : 0xb8b2ff,
        transparent: true,
        opacity: def.wire ? 0.32 : 0.5,
      });
      this.materials.push(lines);
      object.add(new LineSegments(new EdgesGeometry(geometry), lines));
      object.rotation.set(random() * Math.PI, random() * Math.PI, 0);
      const spin = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.25);
      this.icosas.push({ def, object, spin });
      this.icosaGroup.add(object);
    });
  }

  /** Reads the headings' positions and rebuilds the spiral and starfield to fit. */
  measure() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.docHeight = Math.max(document.documentElement.scrollHeight, height);
    const scrollY = window.scrollY;

    const anchors: Anchor[] = Array.from(document.querySelectorAll<HTMLElement>('[data-underline]')).flatMap((el) => {
      // The text's own width, not the block's; the block's bottom, so line
      // reveal transforms on the text don't move the underline.
      const range = document.createRange();
      range.selectNodeContents(el);
      const text = range.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      if (!text.width || !box.height) return [];
      return [{ left: text.left, right: text.right, y: box.bottom + scrollY + 8 }];
    });

    const wpp = this.worldPerPx();
    const points = spiralPath(anchors, { width, height }).map(
      (p) => new Vector3((p.x - width / 2) * wpp, -p.y * wpp, p.z),
    );

    this.tube?.geometry.dispose();
    if (this.tube) this.spiral.remove(this.tube);
    this.tube = undefined;
    this.samplePoints = [];
    this.sampleYs = new Float32Array(0);

    if (points.length >= 2) {
      const curve = new CatmullRomCurve3(points, false, 'centripetal');
      const segments = Math.min(this.tier === 'full' ? 2400 : 1200, Math.max(300, Math.round(curve.getLength() / (wpp * 6))));
      // About 2.5px thick on screen, at the front.
      const geometry = new TubeGeometry(curve, segments, wpp * 1.25, RADIAL, false);
      this.tube = new Mesh(geometry, this.spiralMaterial);
      this.tube.frustumCulled = false;
      this.spiral.add(this.tube);
      this.samplePoints = curve.getSpacedPoints(segments);
      // Back in page pixels, for "how far down has the reader scrolled".
      this.sampleYs = Float32Array.from(this.samplePoints, (p) => -p.y / wpp);
      this.drawn = Math.min(this.drawn, segments);
    }

    this.buildStars(wpp);
  }

  private buildStars(wpp: number) {
    const count = this.tier === 'full' ? 1800 : 700;
    const random = seededRandom(9);
    const span = this.docHeight * wpp * 0.12 + 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 260;
      positions[i * 3 + 1] = 60 - random() * span;
      positions[i * 3 + 2] = -70 - random() * 90;
    }
    this.stars.geometry.dispose();
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.stars.geometry = geometry;
  }

  update(scrollY: number, now: number, dt: number) {
    const wpp = this.worldPerPx();
    const view = this.halfSize(0);

    // The spiral moves exactly with the page.
    this.spiral.position.y = view.h + scrollY * wpp;

    if (this.tube) {
      const target = drawIndexFor(this.sampleYs, scrollY + window.innerHeight * DRAW_TO);
      // Ease toward the target so it draws in smoothly, fast enough to keep up.
      this.drawn += (target - this.drawn) * (1 - Math.exp(-5 * dt));
      const segments = Math.max(0, Math.min(this.samplePoints.length - 1, Math.round(this.drawn)));
      this.tube.geometry.setDrawRange(0, segments * RADIAL * 6);
      const tip = this.samplePoints[segments];
      this.comet.visible = segments > 0 && segments < this.samplePoints.length - 1;
      if (tip) this.comet.position.copy(tip);
      this.comet.rotation.set(now * 1.3, now * 0.9, 0);
      this.comet.scale.setScalar(1 + Math.sin(now * 5) * 0.15);
    }

    // Icosahedrons: placed down the page, drifting at their own depth.
    for (const { def, object, spin } of this.icosas) {
      const size = this.halfSize(def.z);
      const pageY = def.at * this.docHeight;
      object.position.set(
        def.side * size.w * 0.86,
        (scrollY - pageY) * wpp * def.parallax * (size.h / view.h),
        def.z,
      );
      object.rotation.x += spin.x * dt;
      object.rotation.y += spin.y * dt;
      object.rotation.z += spin.z * dt;
    }

    this.stars.position.y = scrollY * wpp * 0.12;
    this.stars.rotation.z = Math.sin(now * 0.02) * 0.01;
  }

  dispose() {
    window.clearTimeout(this.remeasureTimer);
    this.observer.disconnect();
    this.scene.remove(this.spiral, this.icosaGroup, this.stars);
    this.tube?.geometry.dispose();
    this.comet.geometry.dispose();
    this.stars.geometry.dispose();
    this.icosaGroup.traverse((o) => {
      if (o instanceof Mesh || o instanceof LineSegments) o.geometry.dispose();
    });
    this.materials.forEach((m) => m.dispose());
  }
}
