import { useEffect, useRef } from 'react';
import { sceneBus, useSceneStatus } from './sceneBus';

type IdleCallback = (cb: () => void, opts?: { timeout: number }) => number;

/**
 * A fixed, full-screen canvas behind the page that hosts the 3D story.
 * three.js is only downloaded once the page has painted and gone idle, and
 * never for visitors on the "off" tier, who keep the 2D visuals.
 */
export default function WebGLStage() {
  const ref = useRef<HTMLCanvasElement>(null);
  const status = useSceneStatus();
  const tier = sceneBus.getTier();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || tier === 'off') return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = () =>
      import('./VoxelScene')
        .then(({ VoxelScene }) => {
          if (cancelled) return;
          const scene = new VoxelScene(canvas, {
            tier,
            getChapter: sceneBus.getChapter,
            onFail: () => {
              scene.dispose();
              sceneBus.setStatus('failed');
            },
          });
          dispose = () => scene.dispose();
          sceneBus.setStatus('running');
        })
        .catch(() => {
          if (!cancelled) sceneBus.setStatus('failed');
        });

    const idle: IdleCallback =
      (window as Window & { requestIdleCallback?: IdleCallback }).requestIdleCallback ??
      ((cb) => window.setTimeout(cb, 120));
    idle(start, { timeout: 1200 });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [tier]);

  if (tier === 'off' || status === 'failed') return null;
  return (
    <canvas
      ref={ref}
      className={`webglStage ${status === 'running' ? 'is-running' : ''}`}
      aria-hidden="true"
      data-testid="webgl-stage"
    />
  );
}
