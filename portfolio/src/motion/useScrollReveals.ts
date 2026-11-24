import { useEffect, type RefObject } from 'react';
import { EASE, FULL_MOTION, gsap, SplitText } from './gsap';
import { prefersReducedMotion } from './reducedMotion';

/**
 * Scroll-driven reveals for a page:
 * - `[data-split]` headings rise in line by line from behind a mask.
 * - `[data-reveal]` blocks fade up as they enter.
 * Content is fully visible in the HTML; the hidden start state is only set
 * here, from JavaScript, and only when motion is allowed.
 */
export function useScrollReveals(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = root.current;
    if (!scope || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    let splits: SplitText[] = [];

    // Wait for the web fonts so lines are split where they really break.
    const ready = document.fonts?.ready ?? Promise.resolve();
    let cancelled = false;

    ready.then(() => {
      if (cancelled) return;
      mm.add(FULL_MOTION, () => {
        splits = gsap.utils.toArray<HTMLElement>('[data-split]', scope).map((el) => {
          const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1.4,
            ease: EASE,
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
          return split;
        });

        gsap.utils.toArray<HTMLElement>('[data-reveal]', scope).forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 40,
            duration: 1.2,
            ease: EASE,
            delay: Number(el.dataset.revealDelay ?? 0),
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });

        return () => splits.forEach((s) => s.revert());
      });
    });

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, [root]);
}
