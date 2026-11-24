import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './reducedMotion';

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger effects
 * stay in sync. Skipped entirely for reduced motion; native scroll is used.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // In-page links (#story, #projects) glide instead of jumping, and stop
      // below the sticky navbar.
      anchors: { offset: -64 },
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
