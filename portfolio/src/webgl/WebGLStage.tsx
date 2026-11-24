import { useEffect, useRef } from 'react';
import { gsap } from '../motion/gsap';
import { sceneBus, useSceneStatus } from './sceneBus';

/** True the first time this runs in a browser tab, so the boot intro plays once per visit. */
export function firstVisitThisSession(): boolean {
  try {
    if (sessionStorage.getItem('booted')) return false;
    sessionStorage.setItem('booted', '1');
    return true;
  } catch {
    return false;
  }
}

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
            getImage: sceneBus.getChapterImage,
            ticker: gsap.ticker,
            boot: firstVisitThisSession() && window.scrollY < 50,
            onFail: () => {
              dispose?.();
              sceneBus.setStatus('failed');
            },
          });
          dispose = () => {
            scene.dispose();
            document.documentElement.classList.remove('webgl-on');
          };
          document.documentElement.classList.add('webgl-on');
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
