import { useEffect, useRef } from 'react';
import { gsap } from './gsap';
import { hasFinePointer, prefersReducedMotion } from './reducedMotion';

const INTERACTIVE = 'a, button, [role="button"]';

/**
 * A small square cursor (a nod to the logo's pixels) that trails the mouse
 * and grows over links and buttons. The real cursor stays visible, so this
 * is purely decorative. Mouse only, and off for reduced motion.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;

    document.documentElement.classList.add('has-cursor');
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      el.classList.add('is-visible');
      x(e.clientX);
      y(e.clientY);
      const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      el.classList.toggle('is-active', Boolean(target));
    };
    const onLeave = () => el.classList.remove('is-visible');

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
