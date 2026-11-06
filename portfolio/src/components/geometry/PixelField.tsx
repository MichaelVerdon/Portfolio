import { useMemo } from 'react';
import { seededRandom } from './random';
import './geometry.css';

interface PixelFieldProps {
  columns?: number;
  rows?: number;
  /** Share of squares (0 to 1) that light up in the accent colour. */
  density?: number;
  seed?: number;
  className?: string;
}

/**
 * A grid of faint rounded squares where a scattered few glow and fade in
 * the accent colour. Meant as a quiet background behind hero text.
 */
export default function PixelField({
  columns = 24,
  rows = 12,
  density = 0.08,
  seed = 7,
  className = '',
}: PixelFieldProps) {
  const cells = useMemo(() => {
    const random = seededRandom(seed);
    return Array.from({ length: columns * rows }, (_, i) => ({
      x: i % columns,
      y: Math.floor(i / columns),
      lit: random() < density,
      delay: Math.round(random() * 6000),
    }));
  }, [columns, rows, density, seed]);

  return (
    <svg
      className={`pixelField ${className}`}
      viewBox={`0 0 ${columns * 10} ${rows * 10}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-testid="pixel-field"
    >
      {cells.map(({ x, y, lit, delay }) => (
        <rect
          key={`${x}-${y}`}
          x={x * 10 + 1}
          y={y * 10 + 1}
          width={8}
          height={8}
          rx={1}
          className={lit ? 'fieldPixel fieldPixel--lit' : 'fieldPixel'}
          style={lit ? { animationDelay: `${delay}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
