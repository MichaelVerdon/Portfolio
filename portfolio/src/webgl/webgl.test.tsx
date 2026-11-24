import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ContactSection from '../components/sections/ContactSection';
import Hero from '../components/sections/Hero';
import SkillsSection from '../components/sections/SkillsSection';
import Story from '../components/sections/Story';
import { about } from '../data';
import { ScrollTrigger } from '../motion/gsap';
import Home from '../pages/Home';
import { renderWithRouter } from '../test/render';
import { detectTier, supportsWebGL } from './capability';
import { CHAPTERS, isSceneId, SCENE_IDS } from './chapters';
import { buildFormation, LOGO_VOXELS, SHAPE_SHARE } from './formations';
import { drawIndexFor, spiralPath } from './spiralPath';
import { sceneBus, useSceneStatus, useWebglActive } from './sceneBus';
import WebGLStage from './WebGLStage';

const voxel = vi.hoisted(() => ({
  instances: [] as { options: { onFail: () => void; getChapter: () => string }; dispose: () => void }[],
  throwOnCreate: false,
}));
vi.mock('./VoxelScene', () => ({
  VoxelScene: class {
    dispose = vi.fn();
    constructor(
      _canvas: HTMLCanvasElement,
      public options: { onFail: () => void; getChapter: () => string },
    ) {
      if (voxel.throwOnCreate) throw new Error('no gl');
      voxel.instances.push(this);
    }
  },
}));

const original = {
  matchMedia: window.matchMedia,
  getContext: HTMLCanvasElement.prototype.getContext,
};

/** A browser with motion allowed; `matching` lists extra queries that match. */
function stubMedia(matching: string[] = []) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('no-preference') || matching.some((m) => query.includes(m)),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function stubWebGL(available: boolean) {
  HTMLCanvasElement.prototype.getContext = (() => (available ? {} : null)) as typeof original.getContext;
}

function stubNavigator(hints: Record<string, unknown>) {
  for (const [key, value] of Object.entries(hints)) {
    Object.defineProperty(navigator, key, { value, configurable: true });
  }
}

beforeEach(() => {
  sceneBus.reset();
  voxel.instances = [];
  voxel.throwOnCreate = false;
  stubNavigator({ hardwareConcurrency: 8, deviceMemory: 8, connection: undefined });
});

afterEach(() => {
  cleanup();
  window.matchMedia = original.matchMedia;
  HTMLCanvasElement.prototype.getContext = original.getContext;
  window.history.replaceState(null, '', '/');
  sceneBus.reset();
});

describe('formations', () => {
  it.each(SCENE_IDS)('builds the %s formation for any cube count', (id) => {
    for (const total of [420, 900]) {
      const f = buildFormation(id, total);
      expect(f.positions).toHaveLength(total * 3);
      expect(f.sizes).toHaveLength(total);
      expect(f.shapeCount).toBeGreaterThan(total * SHAPE_SHARE * 0.4);
      expect(f.shapeCount).toBeLessThanOrEqual(Math.floor(total * SHAPE_SHARE));
      expect(Array.from(f.positions).every(Number.isFinite)).toBe(true);
      expect(Array.from(f.sizes).every((s) => s > 0)).toBe(true);
    }
  });

  it('builds the logo from the filled squares of the mark', () => {
    const cells = LOGO_VOXELS.flat().filter(Boolean).length;
    const f = buildFormation('logo', 900);
    expect(f.shapeCount % (cells * 2)).toBe(0);
  });

  it('keeps dust cubes in place between chapters', () => {
    const a = buildFormation('sphere', 900);
    const b = buildFormation('monolith', 900);
    const last = 899 * 3;
    expect(a.positions.slice(last, last + 3)).toEqual(b.positions.slice(last, last + 3));
  });
});

describe('chapters', () => {
  it('recognises chapter names', () => {
    expect(isSceneId('sphere')).toBe(true);
    expect(isSceneId('nope')).toBe(false);
    expect(isSceneId(undefined)).toBe(false);
    for (const id of SCENE_IDS) expect(CHAPTERS[id].label).not.toBe('');
  });
});

describe('detectTier', () => {
  it('is off for reduced motion (the test default)', () => {
    expect(detectTier()).toBe('off');
  });

  it('is full on a capable desktop', () => {
    stubMedia();
    stubWebGL(true);
    expect(detectTier()).toBe('full');
  });

  it('is lite on touch screens and modest hardware', () => {
    stubMedia(['pointer: coarse']);
    stubWebGL(true);
    expect(detectTier()).toBe('lite');
    stubMedia();
    stubNavigator({ hardwareConcurrency: 4 });
    expect(detectTier()).toBe('lite');
  });

  it('is off for data saver, very low-end devices or no WebGL', () => {
    stubMedia();
    stubWebGL(true);
    stubNavigator({ connection: { saveData: true } });
    expect(detectTier()).toBe('off');
    stubNavigator({ connection: undefined, deviceMemory: 2 });
    expect(detectTier()).toBe('off');
    stubNavigator({ deviceMemory: 8 });
    stubWebGL(false);
    expect(detectTier()).toBe('off');
  });

  it('can be forced with ?webgl=, even with reduced motion on', () => {
    stubWebGL(true);
    window.history.replaceState(null, '', '/?webgl=full');
    expect(detectTier()).toBe('full');
    stubMedia();
    window.history.replaceState(null, '', '/?webgl=lite');
    expect(detectTier()).toBe('lite');
    window.history.replaceState(null, '', '/?webgl=off');
    expect(detectTier()).toBe('off');
    stubWebGL(false);
    window.history.replaceState(null, '', '/?webgl=full');
    expect(detectTier()).toBe('off');
  });

  it('treats a throwing canvas as no WebGL', () => {
    HTMLCanvasElement.prototype.getContext = (() => {
      throw new Error('blocked');
    }) as typeof original.getContext;
    expect(supportsWebGL()).toBe(false);
  });
});

describe('sceneBus', () => {
  it('tracks chapter and status and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = sceneBus.subscribe(listener);
    expect(sceneBus.getStatus()).toBe('off');
    sceneBus.setChapter('logo'); // unchanged: no event
    sceneBus.setStatus('off');
    expect(listener).not.toHaveBeenCalled();
    sceneBus.setChapter('sphere');
    sceneBus.setStatus('running');
    expect(sceneBus.getChapter()).toBe('sphere');
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('exposes status to React', () => {
    const { result } = renderHook(() => [useSceneStatus(), useWebglActive()] as const);
    expect(result.current).toEqual(['off', false]);
    act(() => sceneBus.setStatus('loading'));
    expect(result.current).toEqual(['loading', true]);
  });
});

describe('WebGLStage', () => {
  it('renders nothing when 3D is off', () => {
    const { container } = render(<WebGLStage />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lazy-loads the scene, then disposes it on unmount', async () => {
    stubMedia();
    stubWebGL(true);
    const { unmount } = render(<WebGLStage />);
    expect(screen.getByTestId('webgl-stage')).not.toHaveClass('is-running');
    await waitFor(() => expect(sceneBus.getStatus()).toBe('running'));
    expect(screen.getByTestId('webgl-stage')).toHaveClass('is-running');
    const scene = voxel.instances[0];
    expect(scene.options.getChapter()).toBe('logo');
    unmount();
    expect(scene.dispose).toHaveBeenCalled();
  });

  it('falls back to 2D when WebGL is lost', async () => {
    stubMedia();
    stubWebGL(true);
    render(<WebGLStage />);
    await waitFor(() => expect(voxel.instances).toHaveLength(1));
    act(() => voxel.instances[0].options.onFail());
    expect(sceneBus.getStatus()).toBe('failed');
    expect(screen.queryByTestId('webgl-stage')).not.toBeInTheDocument();
  });

  it('falls back to 2D when the scene cannot start', async () => {
    stubMedia();
    stubWebGL(true);
    voxel.throwOnCreate = true;
    render(<WebGLStage />);
    await waitFor(() => expect(sceneBus.getStatus()).toBe('failed'));
  });
});

describe('sections with 3D on', () => {
  beforeEach(() => sceneBus.setStatus('loading'));

  it('let the cubes replace the 2D drawings', () => {
    const { container } = renderWithRouter(
      <>
        <Hero />
        <SkillsSection />
        <ContactSection />
      </>,
    );
    expect(screen.queryByTestId('hero-canvas')).not.toBeInTheDocument();
    expect(container.querySelector('.hero--3d')).toBeInTheDocument();
    expect(container.querySelector('.skills-orbit')).not.toBeInTheDocument();
    expect(container.querySelector('.contact-field')).not.toBeInTheDocument();
  });

  it('frames the scene beside the story with a caption', () => {
    const { container } = render(<Story />);
    expect(container.querySelector('.story--3d')).toBeInTheDocument();
    expect(container.querySelector('.story-scene')).toBeInTheDocument();
    const last = about.timeline[about.timeline.length - 1];
    expect(screen.getByText(CHAPTERS[last.scene!].label)).toBeInTheDocument();
  });

  it('switch chapters as sections scroll past', () => {
    const create = vi.spyOn(ScrollTrigger, 'create');
    renderWithRouter(<Home />);
    const configs = create.mock.calls.map(([c]) => c);
    expect(configs.length).toBeGreaterThanOrEqual(4);
    const projects = configs.find((c) => (c.trigger as HTMLElement).id === 'projects')!;
    projects.onToggle!({ isActive: false } as ScrollTrigger);
    expect(sceneBus.getChapter()).toBe('logo');
    projects.onToggle!({ isActive: true } as ScrollTrigger);
    expect(sceneBus.getChapter()).toBe('field');
    create.mockRestore();
  });
});

describe('spiralPath', () => {
  const view = { width: 1440, height: 900 };

  it('is empty without headings to underline', () => {
    expect(spiralPath([], view)).toEqual([]);
    expect(spiralPath([{ left: 10, right: 10, y: 50 }], view)).toEqual([]);
  });

  it('runs flat on the page under each heading, in page order', () => {
    const anchors = [
      { left: 200, right: 700, y: 2400 },
      { left: 168, right: 900, y: 600 },
    ];
    const path = spiralPath(anchors, view);
    for (const a of anchors) {
      const under = path.filter((p) => p.y === a.y && p.z === 0).map((p) => p.x);
      expect(under).toEqual([a.left, (a.left + a.right) / 2, a.right]);
    }
    const ys = path.map((p) => p.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
    expect(Math.min(...path.map((p) => p.z))).toBeLessThan(-20);
  });

  it('adds turns across long gaps', () => {
    const short = spiralPath([{ left: 0, right: 100, y: 0 }, { left: 0, right: 100, y: 900 }], view);
    const long = spiralPath([{ left: 0, right: 100, y: 0 }, { left: 0, right: 100, y: 5000 }], view);
    expect(long.length).toBeGreaterThan(short.length);
  });

  it('finds how far down to draw', () => {
    const ys = [0, 10, 20, 30];
    expect(drawIndexFor(ys, -5)).toBe(0);
    expect(drawIndexFor(ys, 15)).toBe(2);
    expect(drawIndexFor(ys, 99)).toBe(4);
  });
});
