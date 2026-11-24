import { useSyncExternalStore } from 'react';
import { detectTier, type Tier } from './capability';
import type { SceneId } from './chapters';

/**
 * Where the page tells the 3D scene what to show. Sections set the chapter
 * as they scroll into view; the scene (loaded later, maybe never) reads it.
 *
 * status:
 * - "off": no 3D for this visitor (reduced motion, low power, no WebGL).
 * - "loading": 3D allowed, still downloading.
 * - "running": the canvas is up.
 * - "failed": WebGL broke; sections show their 2D fallbacks.
 */
export type SceneStatus = 'off' | 'loading' | 'running' | 'failed';

type Listener = () => void;

const listeners = new Set<Listener>();
let tier: Tier | null = null;
let status: SceneStatus | null = null;
let chapter: SceneId = 'logo';
let chapterImage: string | undefined;

function emit() {
  listeners.forEach((l) => l());
}

export const sceneBus = {
  getTier(): Tier {
    tier ??= detectTier();
    return tier;
  },
  getStatus(): SceneStatus {
    status ??= sceneBus.getTier() === 'off' ? 'off' : 'loading';
    return status;
  },
  setStatus(next: SceneStatus) {
    if (next === sceneBus.getStatus()) return;
    status = next;
    emit();
  },
  getChapter(): SceneId {
    return chapter;
  },
  /** The logo image to build instead of the chapter's shape, if any. */
  getChapterImage(): string | undefined {
    return chapterImage;
  },
  /** Switch chapter. With `image`, the cubes build that logo (falling back to the chapter's shape). */
  setChapter(next: SceneId, image?: string) {
    if (next === chapter && image === chapterImage) return;
    chapter = next;
    chapterImage = image;
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Tests only: forget everything. */
  reset() {
    tier = null;
    status = null;
    chapter = 'logo';
    chapterImage = undefined;
    emit();
  },
};

/** Re-renders when the 3D scene starts, fails or is ruled out. */
export function useSceneStatus(): SceneStatus {
  return useSyncExternalStore(sceneBus.subscribe, sceneBus.getStatus, sceneBus.getStatus);
}

/** True while the 3D scene is (or is about to be) drawing the page's visuals. */
export function useWebglActive(): boolean {
  const s = useSceneStatus();
  return s === 'loading' || s === 'running';
}
