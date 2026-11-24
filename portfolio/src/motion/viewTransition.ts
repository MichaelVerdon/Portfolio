import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './reducedMotion';

interface TransitionHooks {
  /** Runs just before the browser snapshots the old state. */
  before?: () => void;
  /** Runs once the transition has finished (or straight away without one). */
  after?: () => void;
}

/**
 * Runs a React state update inside a View Transition, so elements sharing a
 * `view-transition-name` morph between their old and new positions.
 * Browsers without the API, and reduced motion, just apply the update.
 */
export function withViewTransition(update: () => void, { before, after }: TransitionHooks = {}) {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    update();
    after?.();
    return;
  }
  before?.();
  const transition = document.startViewTransition(() => flushSync(update));
  transition.finished.finally(() => after?.());
}

/** A CSS-safe view-transition-name for a piece of content. */
export function transitionName(prefix: string, label: string) {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
