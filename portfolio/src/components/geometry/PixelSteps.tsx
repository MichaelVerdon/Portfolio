import './geometry.css';

interface PixelStepsProps {
  /** Number of columns in the staircase. */
  steps?: number;
  /** Size of one pixel in px. */
  size?: number;
  className?: string;
}

/**
 * A rising staircase of rounded squares, echoing the stepped mark in the
 * logo. Each column builds up in turn when it first appears.
 */
export default function PixelSteps({ steps = 6, size = 24, className = '' }: PixelStepsProps) {
  const gap = size * 0.12;
  const cell = size + gap;
  const width = steps * cell;
  const height = steps * cell;

  const squares = [];
  for (let col = 0; col < steps; col++) {
    for (let row = 0; row <= col; row++) {
      const isTop = row === col;
      squares.push(
        <rect
          key={`${col}-${row}`}
          x={col * cell}
          y={height - (row + 1) * cell}
          width={size}
          height={size}
          rx={size * 0.12}
          className={`pixel ${isTop && col === steps - 1 ? 'pixel--accent' : ''}`}
          style={{ animationDelay: `${(col * steps + row) * 25}ms` }}
        />,
      );
    }
  }

  return (
    <svg
      className={`pixelSteps ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      data-testid="pixel-steps"
    >
      {squares}
    </svg>
  );
}
