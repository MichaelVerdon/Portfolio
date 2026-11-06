import './geometry.css';

interface OrbitRingsProps {
  size?: number;
  className?: string;
}

/**
 * Concentric rings with broken arcs that turn slowly at different speeds,
 * each carrying a small square "satellite".
 */
export default function OrbitRings({ size = 240, className = '' }: OrbitRingsProps) {
  const rings = [
    { r: 40, dash: '60 190', speed: 18 },
    { r: 70, dash: '140 300', speed: 28 },
    { r: 100, dash: '220 410', speed: 40 },
  ];

  return (
    <svg
      className={`orbitRings ${className}`}
      viewBox="-120 -120 240 240"
      width={size}
      height={size}
      aria-hidden="true"
      data-testid="orbit-rings"
    >
      {rings.map(({ r, dash, speed }, i) => (
        <g
          key={r}
          className="orbit"
          style={{
            animationDuration: `${speed}s`,
            animationDirection: i % 2 ? 'reverse' : 'normal',
          }}
        >
          <circle r={r} className="orbitTrack" />
          <circle r={r} className="orbitArc" strokeDasharray={dash} />
          <rect x={r - 4} y={-4} width={8} height={8} rx={1.5} className="orbitSatellite" />
        </g>
      ))}
      <rect x={-6} y={-6} width={12} height={12} rx={2} className="orbitCore" />
    </svg>
  );
}
