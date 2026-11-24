import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Fog,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { seededRandom } from "../components/geometry/random";
import type { Tier } from "./capability";
import { CHAPTERS, type ChapterLayout, type SceneId } from "./chapters";
import {
  bootCore,
  buildFormation,
  LOGO_BOX,
  logoFormation,
  type Formation,
} from "./formations";
import { SpaceLayer } from "./SpaceLayer";

/**
 * The 3D story: a few hundred rounded cubes (the logo's pixels) that fly
 * between formations as the visitor scrolls through Michael's career.
 *
 * Plain three.js with one instanced mesh, so the whole scene is a single
 * draw call. Loaded lazily by WebGLStage; never part of the first bundle.
 */

// Enough cubes that a logo built from them reads clearly.
const CUBES: Record<Exclude<Tier, "off">, number> = { full: 1400, lite: 640 };
const MORPH_SECONDS = 1.9;
const INTRO_SECONDS = 2.6;
const CAMERA_Z = 60;
const FOV = 30;
const INK = new Color("#f2f2f2");
const ACCENT = new Color("#7c6fff");

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** Frame-rate independent easing toward a target. */
const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

interface SceneOptions {
  tier: Exclude<Tier, "off">;
  getChapter: () => SceneId;
  /** A logo image to build from cubes instead of the chapter's own shape. */
  getImage?: () => string | undefined;
  /** WebGL stopped working (context lost); the page falls back to 2D. */
  onFail: () => void;
  /**
   * Frame clock to render on. Passing GSAP's ticker renders right after
   * Lenis has moved the page, so the spiral stays glued to the text.
   * Defaults to requestAnimationFrame.
   */
  ticker?: { add: (fn: () => void) => void; remove: (fn: () => void) => void };
  /**
   * Play the boot intro: the cubes gather into one spinning block in the
   * middle of the screen, then burst out into the first chapter.
   */
  boot?: boolean;
}

/** Boot intro timings, in seconds from start. */
const BOOT = { gather: 1.3, burst: 2.2 };

export class VoxelScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 400);
  private world = new Group(); // placed per chapter
  private spinner = new Group(); // turns on the spot
  private mesh: InstancedMesh;
  private space: SpaceLayer;
  private material: MeshStandardMaterial;
  private count: number;
  private formations = new Map<SceneId, Formation>();
  /** Logo formations by image URL, once loaded (or 'failed'). */
  private logos = new Map<string, Formation | "loading" | "failed">();
  /** The formation the cubes are heading for: a chapter id or a logo URL. */
  private shownKey: string;

  // Morph state: every cube travels from `from` to `to`.
  private fromPos: Float32Array;
  private fromSize: Float32Array;
  private toPos: Float32Array;
  private toSize: Float32Array;
  private livePos: Float32Array;
  private liveSize: Float32Array;
  private defaultColors: Float32Array;
  private fromColors: Float32Array;
  private toColors: Float32Array;
  private liveColors: Float32Array;
  private delays: Float32Array;
  private axes: Vector3[];
  private morphStart = 0;
  private morphSeconds = INTRO_SECONDS;
  private chapter: SceneId;
  private shapeCount = 0;

  // Smoothed layout and input.
  private layout: ChapterLayout;
  private spin = 0;
  private wave = 0;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private lastScroll = window.scrollY;
  private scrollVelocity = 0;
  private narrow = false;

  private frame = 0;
  private last = performance.now();
  private slowFrames = 0;
  private dpr: number;
  private disposed = false;
  /** Boot intro stage: gathering into the block, then done. */
  private booting: false | { start: number } = false;
  private glass = 0;
  private glassy = false;

  private matrix = new Matrix4();
  private color = new Color();
  private quat = new Quaternion();
  private vec = new Vector3();
  private scaleVec = new Vector3();

  constructor(
    private canvas: HTMLCanvasElement,
    private options: SceneOptions,
  ) {
    const { tier } = options;
    this.count = CUBES[tier];
    this.dpr = Math.min(
      window.devicePixelRatio || 1,
      tier === "full" ? 1.75 : 1.25,
    );

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: tier === "full",
      alpha: true,
      powerPreference: tier === "full" ? "high-performance" : "low-power",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setPixelRatio(this.dpr);

    // Looking straight ahead, so the page plane (z = 0) maps 1:1 to the screen.
    this.camera.position.set(0, 0, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);
    // Deep blue haze: far things fade into a console-menu void, not to black.
    this.scene.fog = new Fog(0x050816, CAMERA_Z + 4, CAMERA_Z + 85);

    // Light: a cool white key, a soft fill and an indigo rim from behind.
    this.scene.add(new AmbientLight(0xffffff, 0.35));
    const key = new DirectionalLight(0xffffff, 2.4);
    key.position.set(12, 18, 20);
    const rim = new DirectionalLight(ACCENT, 4);
    rim.position.set(-18, 6, -14);
    const fill = new DirectionalLight(0x9fb4ff, 0.6);
    fill.position.set(-10, -12, 16);
    this.scene.add(key, rim, fill);

    const geometry = new RoundedBoxGeometry(
      1,
      1,
      1,
      tier === "full" ? 3 : 2,
      0.12,
    );
    this.material = new MeshStandardMaterial({
      roughness: 0.32,
      metalness: 0.15,
      emissive: 0x3a5bff,
      emissiveIntensity: 0,
    });
    this.mesh = new InstancedMesh(geometry, this.material, this.count);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    const random = seededRandom(3);
    const color = new Color();
    this.delays = new Float32Array(this.count);
    this.defaultColors = new Float32Array(this.count * 3);
    this.axes = [];
    for (let i = 0; i < this.count; i++) {
      const accent = random() < 0.04;
      color
        .copy(accent ? ACCENT : INK)
        .multiplyScalar(accent ? 1.4 : 0.75 + random() * 0.25);
      this.mesh.setColorAt(i, color);
      color.toArray(this.defaultColors, i * 3);
      this.delays[i] = random();
      this.axes.push(
        new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      );
    }

    this.spinner.add(this.mesh);
    this.world.add(this.spinner);
    this.scene.add(this.world);

    // Start as a scattered cloud, then assemble the first chapter.
    this.chapter = options.getChapter();
    this.shownKey = this.chapter;
    const first = this.formation(this.chapter);
    this.liveColors = this.defaultColors.slice();
    this.fromColors = this.defaultColors.slice();
    this.toColors = this.defaultColors.slice();
    this.fromPos = new Float32Array(this.count * 3);
    this.fromSize = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      this.fromPos[i * 3] = (random() - 0.5) * 90;
      this.fromPos[i * 3 + 1] = (random() - 0.5) * 50;
      this.fromPos[i * 3 + 2] = (random() - 0.5) * 60 - 10;
      this.fromSize[i] = 0;
    }
    const start = options.boot ? bootCore(this.count) : first;
    this.toPos = start.positions;
    this.toSize = start.sizes;
    this.shapeCount = start.shapeCount;
    this.livePos = this.fromPos.slice();
    this.liveSize = this.fromSize.slice();

    this.resize();
    this.layout = { ...this.targetLayout() };
    this.morphStart = performance.now() / 1000;
    if (options.boot) {
      this.booting = { start: this.morphStart };
      this.morphSeconds = BOOT.gather;
      // The block forms dead centre, then the first chapter glides into place.
      this.layout = { ...this.layout, x: 0, y: 0, z: 6, scale: 1, dim: 1.5 };
    }

    this.space = new SpaceLayer(
      this.scene,
      tier,
      () => this.worldPerPx(),
      (z) => this.halfSize(z),
    );

    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    if (options.ticker) {
      options.ticker.add(this.onTicker);
    } else {
      document.addEventListener("visibilitychange", this.onVisibility);
      this.frame = requestAnimationFrame(this.loop);
    }
  }

  /** Half the visible width and height at depth z, in world units. */
  private halfSize(z: number) {
    const h = Math.tan((FOV * Math.PI) / 360) * (CAMERA_Z - z);
    return { w: h * this.camera.aspect, h };
  }

  /** World units per CSS pixel on the page plane. */
  private worldPerPx() {
    return (this.halfSize(0).h * 2) / window.innerHeight;
  }

  private onTicker = () => this.tick(performance.now());

  private loop = (now: number) => {
    this.tick(now);
    if (!this.disposed) this.frame = requestAnimationFrame(this.loop);
  };

  private formation(id: SceneId): Formation {
    let f = this.formations.get(id);
    if (!f) {
      f = buildFormation(id, this.count);
      this.formations.set(id, f);
    }
    return f;
  }

  private targetLayout(): ChapterLayout {
    const c = CHAPTERS[this.chapter];
    const layout = this.narrow ? c.narrow : c.wide;
    if (this.shownKey === this.chapter) return layout;
    // Logos face the camera rather than spinning, and sit in the middle of
    // the story's figure box when it is on screen.
    return { ...layout, spin: false, ...this.figureBox() };
  }

  /** Centre and fit a logo to the story's figure box, when it is on screen. */
  private figureBox(): Partial<ChapterLayout> {
    const box = document.querySelector(".story-scene")?.getBoundingClientRect();
    if (
      !box ||
      box.width < 40 ||
      box.bottom < 0 ||
      box.top > window.innerHeight
    )
      return {};
    const half = this.halfSize(0);
    const perPx = (half.h * 2) / window.innerHeight;
    const fit = Math.min(
      (box.width * perPx * 0.72) / LOGO_BOX.width,
      (box.height * perPx * 0.62) / LOGO_BOX.height,
    );
    return {
      x: ((box.left + box.width / 2) / window.innerWidth) * 2 - 1,
      y: 1 - ((box.top + box.height / 2) / window.innerHeight) * 2,
      z: 0,
      scale: Math.min(1, fit),
    };
  }

  /**
   * The formation to show: the chapter's logo when it has one and it has
   * loaded, otherwise the chapter's own shape. Starts loading logos on
   * first request.
   */
  private wanted(
    id: SceneId,
    image: string | undefined,
  ): { key: string; formation: Formation } {
    if (image) {
      const logo = this.logos.get(image);
      if (logo === undefined) this.loadLogo(image);
      else if (logo !== "loading" && logo !== "failed")
        return { key: image, formation: logo };
    }
    return { key: id, formation: this.formation(id) };
  }

  private loadLogo(url: string) {
    this.logos.set(url, "loading");
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const aspect =
        img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight
          : 1;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        this.logos.set(url, "failed");
        return;
      }
      const sample = (cols: number, rows: number) => {
        canvas.width = cols;
        canvas.height = rows;
        ctx.clearRect(0, 0, cols, rows);
        ctx.drawImage(img, 0, 0, cols, rows);
        return ctx.getImageData(0, 0, cols, rows);
      };
      const formation = logoFormation(sample, aspect, this.count);
      this.logos.set(url, formation.shapeCount > 0 ? formation : "failed");
    };
    img.onerror = () => this.logos.set(url, "failed");
    img.src = url;
  }

  /** Start flying every cube from wherever it is now to the new chapter. */
  private goTo(id: SceneId, key: string, next: Formation) {
    this.chapter = id;
    this.shownKey = key;
    this.fromColors = this.liveColors.slice();
    this.toColors = this.defaultColors.slice();
    if (next.colors) {
      // Logo colours are sRGB; the renderer works in linear light.
      for (let i = 0; i < next.colors.length; i += 3) {
        this.color
          .fromArray(next.colors, i)
          .convertSRGBToLinear()
          .toArray(this.toColors, i);
      }
    }
    this.fromPos = this.livePos.slice();
    this.fromSize = this.liveSize.slice();
    this.toPos = next.positions;
    this.toSize = next.sizes;
    this.shapeCount = next.shapeCount;
    this.morphStart = performance.now() / 1000;
    this.morphSeconds = MORPH_SECONDS;
  }

  private resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.narrow = w < 900;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.space?.measure();
  };

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.options.onFail();
  };

  private onVisibility = () => {
    cancelAnimationFrame(this.frame);
    if (!document.hidden && !this.disposed) {
      this.last = performance.now();
      this.frame = requestAnimationFrame(this.loop);
    }
  };

  private tick(nowMs: number) {
    if (this.disposed) return;
    const dt = Math.min(0.05, (nowMs - this.last) / 1000);
    this.last = nowMs;
    const now = nowMs / 1000;

    // Drop resolution if the device is struggling.
    if (dt > 1 / 40) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 45 && this.dpr > 1) {
      this.dpr = 1;
      this.renderer.setPixelRatio(1);
      this.resize();
      this.slowFrames = 0;
    }

    const id = this.options.getChapter();
    if (this.booting && now - this.booting.start > BOOT.burst) {
      this.booting = false;
      this.shownKey = ""; // forces the burst into the current chapter below
    }
    if (!this.booting) {
      const next = this.wanted(id, this.options.getImage?.());
      if (next.key !== this.shownKey || id !== this.chapter)
        this.goTo(id, next.key, next.formation);
    }

    // Scroll speed nudges the spin, so the scene feels tied to the page.
    const scroll = window.scrollY;
    const delta = scroll - this.lastScroll;
    this.lastScroll = scroll;
    this.scrollVelocity = damp(
      this.scrollVelocity,
      delta / Math.max(dt, 1 / 120),
      6,
      dt,
    );

    this.updateLayout(dt);
    this.updateCubes(now);
    this.space.update(scroll, now, dt);
    this.renderer.render(this.scene, this.camera);
  }

  private updateLayout(dt: number) {
    // While booting, the block glows where the logo will land.
    const target = this.booting
      ? { ...this.targetLayout(), scale: 1, dim: 1.5, spin: true, glass: 0 }
      : this.targetLayout();
    const l = this.layout;
    for (const key of ["x", "y", "z", "scale", "dim"] as const)
      l[key] = damp(l[key], target[key], 2.6, dt);

    const dist = CAMERA_Z - l.z;
    const halfH = Math.tan((FOV * Math.PI) / 360) * dist;
    const halfW = halfH * this.camera.aspect;
    this.world.position.set(l.x * halfW, l.y * halfH, l.z);
    // Keep shapes a sensible size on tall phone screens.
    const fit = this.narrow ? Math.min(1, this.camera.aspect * 1.15) : 1;
    this.world.scale.setScalar(l.scale * fit);
    this.material.color.setScalar(l.dim);

    // Glassy chapters: see-through cubes that glow where they overlap.
    this.glass = damp(this.glass, target.glass ?? 0, 2.4, dt);
    const glassy = this.glass > 0.02;
    if (glassy !== this.glassy) {
      this.glassy = glassy;
      this.material.transparent = glassy;
      this.material.depthWrite = !glassy;
      this.material.needsUpdate = true;
    }
    this.material.opacity = 1 - this.glass * 0.6;
    this.material.emissiveIntensity = this.glass * 0.35;

    // Pointer tilt, eased for weight.
    this.pointer.sx = damp(this.pointer.sx, this.pointer.x, 3, dt);
    this.pointer.sy = damp(this.pointer.sy, this.pointer.y, 3, dt);
    this.world.rotation.y = this.pointer.sx * 0.28;
    this.world.rotation.x =
      this.pointer.sy * 0.16 + (this.chapter === "field" ? 0.24 : 0.12);

    // Spin, plus a push from scrolling. Chapters that face the camera
    // (the logo) unwind to the nearest whole turn.
    const push = Math.max(-1, Math.min(1, this.scrollVelocity / 2500));
    if (this.booting) {
      this.spin += dt * 2.4; // the block spins up before it bursts
    } else if (target.spin) {
      this.spin += dt * 0.14 + push * dt * 1.6;
    } else {
      const home = Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2;
      this.spin = damp(this.spin, home, 2.2, dt);
    }
    this.spinner.rotation.y = this.spin;
    this.spinner.rotation.z = push * 0.08;
    this.wave = damp(this.wave, this.chapter === "field" ? 1 : 0, 2, dt);
  }

  private updateCubes(now: number) {
    const elapsed = now - this.morphStart;
    const stagger = 0.45; // share of the morph spent staggering starts
    const travel = 1 - stagger;
    const pos = this.livePos;
    const size = this.liveSize;
    const settled = elapsed > this.morphSeconds + 0.1;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      // Cubes later in the list (further right) leave a little later.
      const order =
        i < this.shapeCount ? i / Math.max(1, this.shapeCount) : this.delays[i];
      const start = (order * 0.7 + this.delays[i] * 0.3) * stagger;
      const p = settled
        ? 1
        : easeInOutCubic(
            clamp01((elapsed / this.morphSeconds - start) / travel),
          );

      for (let a = 0; a < 3; a++)
        pos[i3 + a] =
          this.fromPos[i3 + a] +
          (this.toPos[i3 + a] - this.fromPos[i3 + a]) * p;
      // An arc mid-flight, so cubes swoop rather than slide.
      const arc = Math.sin(p * Math.PI);
      pos[i3 + 2] += arc * 6 * (this.delays[i] - 0.3);
      size[i] = this.fromSize[i] + (this.toSize[i] - this.fromSize[i]) * p;
      if (!settled) {
        const c = this.liveColors;
        for (let a = 0; a < 3; a++)
          c[i3 + a] =
            this.fromColors[i3 + a] +
            (this.toColors[i3 + a] - this.fromColors[i3 + a]) * p;
        this.mesh.setColorAt(i, this.color.fromArray(c, i3));
      }

      let y = pos[i3 + 1];
      if (this.wave > 0.001 && i < this.shapeCount) {
        const x = pos[i3];
        const z = pos[i3 + 2];
        y +=
          this.wave *
          (Math.sin(x * 0.22 + now * 0.9) * 0.9 +
            Math.cos(z * 0.35 + now * 0.7) * 0.6);
      } else if (i >= this.shapeCount) {
        y += Math.sin(now * 0.3 + this.delays[i] * 20) * 0.4; // dust drifts
      }

      // Tumble in flight; settle perfectly square on arrival.
      this.quat.setFromAxisAngle(
        this.axes[i],
        arc * Math.PI * (0.6 + this.delays[i]),
      );
      this.vec.set(pos[i3], y, pos[i3 + 2]);
      this.scaleVec.setScalar(Math.max(0.0001, size[i]));
      this.matrix.compose(this.vec, this.quat, this.scaleVec);
      this.mesh.setMatrixAt(i, this.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    if (!settled && this.mesh.instanceColor)
      this.mesh.instanceColor.needsUpdate = true;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.options.ticker?.remove(this.onTicker);
    this.space.dispose();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointer);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
    this.renderer.dispose();
  }
}
