import {
  CanvasTexture,
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
import { buildStrands, progressAt, type Anchor, type Strand } from './strands';

/**
 * The space around the cubes:
 * - curly strands (after lusion.co's curly tubes) that sweep in from
 *   different edges as you scroll, each running flat under one
 *   `[data-underline]` heading before curling away (see strands.ts);
 * - icosahedrons (some solid and faceted, some wireframe) drifting at
 *   different depths for parallax;
 * - a starfield far behind everything.
 *
 * The strands and icosahedrons are laid out in page coordinates, so they
 * scroll with the content rather than floating on top of it.
 */

const STRAND_COLOR = new Color('#9d94ff');
const RADIAL = 6;

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
  private strandGroup = new Group();
  private strands: {
    def: Strand;
    mesh: Mesh<TubeGeometry, MeshBasicMaterial>;
    comet: Mesh;
    samples: Vector3[];
    segments: number;
    /** Where the underline ends, as a fraction of the strand. */
    underline: number;
    head: number;
    tail: number;
  }[] = [];
  private icosaGroup = new Group();
  private stars: Points;
  /** Soft lights drifting slowly upward through the haze. */
  private motes: Points;
  private moteSpeeds: Float32Array;
  private strandMaterial = new MeshBasicMaterial({ color: STRAND_COLOR, toneMapped: false });
  private cometMaterial = new MeshBasicMaterial({ color: 0xffffff });
  private cometGeometry = new IcosahedronGeometry(0.22, 0);
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
    this.materials.push(this.strandMaterial, this.cometMaterial);

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
    this.moteSpeeds = new Float32Array(0);
    this.motes = this.buildMotes();
    this.materials.push(this.motes.material as Material);
    scene.add(this.strandGroup, this.icosaGroup, this.stars, this.motes);

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

  /** Reads the headings' positions and rebuilds the strands and starfield to fit. */
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

    this.clearStrands();
    const wpp = this.worldPerPx();
    const maxSegments = this.tier === 'full' ? 900 : 450;
    for (const def of buildStrands(anchors, { width, height })) {
      const points = def.points.map((p) => new Vector3((p.x - width / 2) * wpp, -p.y * wpp, p.z));
      const curve = new CatmullRomCurve3(points, false, 'centripetal');
      const segments = Math.min(maxSegments, Math.max(120, Math.round(curve.getLength() / (wpp * 5))));
      // About 2.5px thick on screen, at the front.
      const mesh = new Mesh(new TubeGeometry(curve, segments, wpp * 1.25, RADIAL, false), this.strandMaterial);
      mesh.frustumCulled = false;
      const samples = curve.getSpacedPoints(segments);
      let underline = 0.5;
      if (def.underlineEnd !== undefined) {
        const target = points[def.underlineEnd];
        let best = Infinity;
        samples.forEach((p, i) => {
          const d = p.distanceToSquared(target);
          if (d < best) {
            best = d;
            underline = i / segments;
          }
        });
      }
      const comet = new Mesh(this.cometGeometry, this.cometMaterial);
      comet.visible = false;
      this.strandGroup.add(mesh, comet);
      this.strands.push({ def, mesh, comet, samples, segments, underline, head: 0, tail: 0 });
    }

    this.buildStars(wpp);
  }

  private clearStrands() {
    for (const s of this.strands) {
      s.mesh.geometry.dispose();
      this.strandGroup.remove(s.mesh, s.comet);
    }
    this.strands = [];
  }

  private buildMotes(): Points {
    const count = this.tier === 'full' ? 140 : 60;
    const random = seededRandom(13);
    const positions = new Float32Array(count * 3);
    this.moteSpeeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 130;
      positions[i * 3 + 1] = (random() - 0.5) * 70;
      positions[i * 3 + 2] = -10 - random() * 70;
      this.moteSpeeds[i] = 0.4 + random() * 1.2;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    // A soft round glow, drawn once.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.3, 'rgba(170,190,255,0.5)');
      g.addColorStop(1, 'rgba(120,140,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    }
    const material = new PointsMaterial({
      color: 0x9fb8ff,
      size: 1.6,
      map: new CanvasTexture(canvas),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });
    return new Points(geometry, material);
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

    // Strands move exactly with the page.
    this.strandGroup.position.y = view.h + scrollY * wpp;
    const ease = 1 - Math.exp(-6 * dt);
    for (const s of this.strands) {
      s.head += (progressAt(s.def.head, scrollY, s.underline) - s.head) * ease;
      s.tail += (progressAt(s.def.tail, scrollY, s.underline) - s.tail) * ease;
      const from = Math.round(Math.min(s.tail, s.head) * s.segments);
      const to = Math.round(s.head * s.segments);
      const visible = to - from > 1;
      s.mesh.visible = visible;
      s.mesh.geometry.setDrawRange(from * RADIAL * 6, Math.max(0, to - from) * RADIAL * 6);
      s.comet.visible = visible && to < s.segments;
      if (s.comet.visible) {
        s.comet.position.copy(s.samples[to]);
        s.comet.rotation.set(now * 1.3, now * 0.9, 0);
        s.comet.scale.setScalar(1 + Math.sin(now * 5 + from) * 0.15);
      }
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

    // Motes rise and wrap round, with a touch of scroll parallax.
    const motes = this.motes.geometry.getAttribute('position') as BufferAttribute;
    for (let i = 0; i < this.moteSpeeds.length; i++) {
      let y = motes.getY(i) + this.moteSpeeds[i] * dt;
      if (y > 36) y -= 72;
      motes.setY(i, y);
    }
    motes.needsUpdate = true;
    this.motes.position.y = scrollY * wpp * 0.05;
    this.stars.rotation.z = Math.sin(now * 0.02) * 0.01;
  }

  dispose() {
    window.clearTimeout(this.remeasureTimer);
    this.observer.disconnect();
    this.clearStrands();
    this.scene.remove(this.strandGroup, this.icosaGroup, this.stars, this.motes);
    this.cometGeometry.dispose();
    this.stars.geometry.dispose();
    this.motes.geometry.dispose();
    (this.motes.material as PointsMaterial).map?.dispose();
    this.icosaGroup.traverse((o) => {
      if (o instanceof Mesh || o instanceof LineSegments) o.geometry.dispose();
    });
    this.materials.forEach((m) => m.dispose());
  }
}
