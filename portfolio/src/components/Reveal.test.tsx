import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Reveal from './Reveal';

type Callback = (entries: { isIntersecting: boolean }[]) => void;

function mockObserver() {
  const instances: { callback: Callback; disconnect: ReturnType<typeof vi.fn> }[] = [];
  class MockIntersectionObserver {
    disconnect = vi.fn();
    observe = vi.fn();
    constructor(public callback: Callback) {
      instances.push(this);
    }
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  return instances;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reveal', () => {
  it('shows content straight away without IntersectionObserver', () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).toHaveClass('is-visible');
  });

  it('waits until the content scrolls into view', () => {
    const observers = mockObserver();
    render(<Reveal delay={200}>Hello</Reveal>);
    const el = screen.getByText('Hello');
    expect(el).not.toHaveClass('is-visible');
    expect(el).toHaveStyle({ transitionDelay: '200ms' });

    act(() => observers[0].callback([{ isIntersecting: false }]));
    expect(el).not.toHaveClass('is-visible');

    act(() => observers[0].callback([{ isIntersecting: true }]));
    expect(el).toHaveClass('is-visible');
    expect(observers[0].disconnect).toHaveBeenCalled();
  });
});
