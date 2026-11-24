import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasFinePointer, prefersReducedMotion, useReducedMotion } from './reducedMotion';

type Listener = () => void;

function mockMatchMedia(matches: boolean, withListeners = true) {
  const listeners = new Set<Listener>();
  const media = {
    matches,
    ...(withListeners && {
      addEventListener: (_: string, fn: Listener) => listeners.add(fn),
      removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
    }),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
  return { media, listeners };
}

afterEach(() => vi.unstubAllGlobals());

describe('reducedMotion', () => {
  it('treats a missing matchMedia as reduced motion and a coarse pointer', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersReducedMotion()).toBe(true);
    expect(hasFinePointer()).toBe(false);
  });

  it('reads the media queries when matchMedia exists', () => {
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
    expect(hasFinePointer()).toBe(false);
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(hasFinePointer()).toBe(true);
  });

  it('follows live changes and stops listening on unmount', () => {
    const { media, listeners } = mockMatchMedia(false);
    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    media.matches = true;
    act(() => listeners.forEach((fn) => fn()));
    expect(result.current).toBe(true);

    unmount();
    expect(listeners.size).toBe(0);
  });

  it('copes with old browsers that lack addEventListener on the query', () => {
    mockMatchMedia(true, false);
    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    unmount();
  });

  it('keeps the default when matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});
