import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroCanvas } from '../components/geometry';
import { LOGO_MARK } from '../components/geometry/logoMark';
import Cursor from './Cursor';
import { hasFinePointer, prefersReducedMotion } from './reducedMotion';
import { transitionName, withViewTransition } from './viewTransition';

describe('reduced motion switch', () => {
  it('reports reduced motion when the visitor asks for it', () => {
    expect(prefersReducedMotion()).toBe(true);
    expect(hasFinePointer()).toBe(false);
  });
});

describe('withViewTransition', () => {
  afterEach(() => {
    // @ts-expect-error test cleanup of an optional browser API
    delete document.startViewTransition;
  });

  it('just applies the update when the browser has no View Transitions', () => {
    const update = vi.fn();
    withViewTransition(update);
    expect(update).toHaveBeenCalledOnce();
  });

  it('skips the transition for reduced motion even when supported', () => {
    const start = vi.fn();
    document.startViewTransition = start as unknown as typeof document.startViewTransition;
    const update = vi.fn();
    withViewTransition(update);
    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it('makes CSS-safe transition names', () => {
    expect(transitionName('project', 'React Native Firebase')).toBe('project-react-native-firebase');
    expect(transitionName('project', 'MSuite (AE)!')).toBe('project-msuite-ae');
  });
});

describe('HeroCanvas', () => {
  it('renders a decorative canvas hidden from screen readers', () => {
    render(<HeroCanvas />);
    expect(screen.getByTestId('hero-canvas')).toHaveAttribute('aria-hidden', 'true');
  });

  it('describes the logo mark as a rectangular grid', () => {
    const width = LOGO_MARK[0].length;
    expect(LOGO_MARK.every((row) => row.length === width)).toBe(true);
  });
});

describe('Cursor', () => {
  it('stays hidden and decorative without a mouse', () => {
    const { container } = render(<Cursor />);
    const cursor = container.querySelector('.cursor')!;
    expect(cursor).toHaveAttribute('aria-hidden', 'true');
    expect(cursor).not.toHaveClass('is-visible');
    expect(document.documentElement).not.toHaveClass('has-cursor');
  });
});
