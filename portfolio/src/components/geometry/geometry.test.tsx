import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrbitRings, PixelField, PixelSteps } from '.';
import { seededRandom } from './random';

describe('seededRandom', () => {
  it('gives the same sequence for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays between 0 and 1', () => {
    const random = seededRandom(1);
    for (let i = 0; i < 1000; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('PixelSteps', () => {
  it('draws a staircase with one accent square on top', () => {
    render(<PixelSteps steps={4} />);
    const svg = screen.getByTestId('pixel-steps');
    // 1 + 2 + 3 + 4 squares
    expect(svg.querySelectorAll('rect')).toHaveLength(10);
    expect(svg.querySelectorAll('.pixel--accent')).toHaveLength(1);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('PixelField', () => {
  it('fills the grid and lights some squares', () => {
    render(<PixelField columns={10} rows={5} density={0.3} seed={1} />);
    const svg = screen.getByTestId('pixel-field');
    expect(svg.querySelectorAll('rect')).toHaveLength(50);
    const lit = svg.querySelectorAll('.fieldPixel--lit').length;
    expect(lit).toBeGreaterThan(0);
    expect(lit).toBeLessThan(50);
  });

  it('renders the same pattern for the same seed', () => {
    const { container: a } = render(<PixelField seed={9} />);
    const { container: b } = render(<PixelField seed={9} />);
    expect(a.innerHTML).toBe(b.innerHTML);
  });

  it('lights nothing at zero density', () => {
    render(<PixelField columns={4} rows={4} density={0} />);
    expect(screen.getByTestId('pixel-field').querySelectorAll('.fieldPixel--lit')).toHaveLength(0);
  });
});

describe('OrbitRings', () => {
  it('draws three orbits around a core', () => {
    render(<OrbitRings />);
    const svg = screen.getByTestId('orbit-rings');
    expect(svg.querySelectorAll('.orbit')).toHaveLength(3);
    expect(svg.querySelectorAll('.orbitCore')).toHaveLength(1);
  });
});
