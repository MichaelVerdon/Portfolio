import { useEffect, type RefObject } from 'react';
import { gsap } from './gsap';
import { hasFinePointer, prefersReducedMotion } from './reducedMotion';

/**
 * Makes every element matching `selector` inside `root` drift gently toward
 * the mouse and spring back on leave. Mouse only, off for reduced motion.
 */
export function useMagnetic(root: RefObject<HTMLElement | null>, selector: string, strength = 0.3) {
  useEffect(() => {
    const scope = root.current;
    if (!scope || !hasFinePointer() || prefersReducedMotion()) return;

    const cleanups = Array.from(scope.querySelectorAll<HTMLElement>(selector)).map((el) => {
      const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        x(0);
        y(0);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.set(el, { clearProps: 'transform' });
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [root, selector, strength]);
}
