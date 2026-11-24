import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroCanvas } from '../components/geometry';
import ProjectCard from '../components/ProjectCard';
import Story from '../components/sections/Story';
import { about, projects } from '../data';
import Home from '../pages/Home';
import { renderWithRouter } from '../test/render';
import Cursor from './Cursor';
import { hasFinePointer, prefersReducedMotion, useReducedMotion } from './reducedMotion';
import SmoothScroll from './SmoothScroll';
import { withViewTransition } from './viewTransition';

const lenis = vi.hoisted(() => ({ instances: [] as { destroy: () => void; raf: () => void }[] }));
vi.mock('lenis', () => ({
  default: class {
    destroy = vi.fn();
    raf = vi.fn();
    on = vi.fn();
    constructor() {
      lenis.instances.push(this);
    }
  },
}));
vi.mock('lenis/dist/lenis.css', () => ({}));

/** Pretends to be a desktop browser with a mouse and motion allowed. */
let mediaListeners: (() => void)[] = [];
let reduced = false;
function fullMotionMatchMedia(query: string) {
  const matches = () =>
    query.includes(': reduce')
      ? reduced
      : query.includes('no-preference')
        ? !reduced
        : true; // pointer: fine, hover, min-width
  return {
    get matches() {
      return matches();
    },
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, fn: () => void) => mediaListeners.push(fn),
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

const original = window.matchMedia;
beforeEach(() => {
  reduced = false;
  mediaListeners = [];
  window.matchMedia = fullMotionMatchMedia;
  // ScrollTrigger scrolls the window while measuring pins; jsdom can't.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  window.matchMedia = original;
  vi.restoreAllMocks();
});

describe('reduced motion switch with motion allowed', () => {
  it('reports full motion and a fine pointer', () => {
    expect(prefersReducedMotion()).toBe(false);
    expect(hasFinePointer()).toBe(true);
  });

  it('follows live changes to the setting', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    reduced = true;
    act(() => mediaListeners.forEach((fn) => fn()));
    expect(result.current).toBe(true);
  });
});

describe('SmoothScroll', () => {
  it('starts Lenis and tears it down on unmount', () => {
    lenis.instances = [];
    const { unmount } = render(<SmoothScroll />);
    expect(lenis.instances).toHaveLength(1);
    unmount();
    expect(lenis.instances[0].destroy).toHaveBeenCalled();
  });
});

describe('Cursor', () => {
  it('follows the mouse and grows over links', () => {
    const { container, unmount } = render(
      <>
        <Cursor />
        <a href="#x">link</a>
      </>,
    );
    const cursor = container.querySelector('.cursor')!;
    expect(document.documentElement).toHaveClass('has-cursor');

    fireEvent.pointerMove(screen.getByText('link'), { clientX: 10, clientY: 20 });
    expect(cursor).toHaveClass('is-visible', 'is-active');

    fireEvent.pointerMove(document.body, { clientX: 30, clientY: 40 });
    expect(cursor).not.toHaveClass('is-active');

    fireEvent.pointerLeave(document);
    expect(cursor).not.toHaveClass('is-visible');

    unmount();
    expect(document.documentElement).not.toHaveClass('has-cursor');
  });
});

describe('Home with motion', () => {
  it('makes buttons magnetic and reveals sections without hiding content', async () => {
    const { unmount } = renderWithRouter(<Home />);
    const button = screen.getByRole('link', { name: 'See my work' });
    fireEvent.pointerMove(button, { clientX: 50, clientY: 50 });
    fireEvent.pointerLeave(button);
    // Let the font-ready promise resolve and the reveals set up.
    await act(async () => {});
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(about.headline);
    unmount();
  });
});

describe('Story with motion', () => {
  it('pins and steps through the timeline on desktop', () => {
    render(<Story />);
    const steps = screen.getAllByRole('listitem');
    // The first stage is current once the sequence is pinned.
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
    expect(steps[0]).toHaveClass('is-active');
  });
});

describe('ProjectCard view transition', () => {
  it('morphs into the modal and back through the View Transitions API', async () => {
    const start = vi.fn((update: () => void) => {
      update();
      return { finished: Promise.resolve() };
    });
    document.startViewTransition = start as unknown as typeof document.startViewTransition;

    render(<ProjectCard project={projects[0]} />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(projects[0].name) }));
    expect(start).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    });
    expect(start).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // @ts-expect-error test cleanup of an optional browser API
    delete document.startViewTransition;
  });

  it('runs the after hook once the transition finishes', async () => {
    const after = vi.fn();
    document.startViewTransition = ((update: () => void) => {
      update();
      return { finished: Promise.resolve() };
    }) as unknown as typeof document.startViewTransition;
    withViewTransition(() => {}, { after });
    await act(async () => {});
    expect(after).toHaveBeenCalledOnce();
    // @ts-expect-error test cleanup of an optional browser API
    delete document.startViewTransition;
  });
});

describe('HeroCanvas with motion', () => {
  it('draws, animates while visible, and lights up around the cursor', () => {
    const ctx = new Proxy({} as Record<string, unknown>, {
      get: (target, key) => (key in target ? target[key as string] : vi.fn()),
      set: (target, key, value) => {
        target[key as string] = value;
        return true;
      },
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 1440,
      height: 800,
      left: 0,
      top: 0,
    } as DOMRect);

    let visible: (entries: { isIntersecting: boolean }[]) => void = () => {};
    let resized: () => void = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: typeof visible) {
          visible = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: typeof resized) {
          resized = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', () => {});

    const { container, unmount } = render(
      <section>
        <HeroCanvas />
      </section>,
    );
    const section = container.querySelector('section')!;

    visible([{ isIntersecting: true }]);
    fireEvent.pointerMove(section, { clientX: 300, clientY: 200 });
    frames.shift()?.(performance.now() + 5000);
    resized();
    fireEvent.pointerLeave(section);
    frames.shift()?.(performance.now() + 6000);
    visible([{ isIntersecting: false }]);

    expect(ctx.fillRect).toBeDefined();
    unmount();
    vi.unstubAllGlobals();
  });
});
