import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Shared slow, soft ease: luxury motion is unhurried, never bouncy. */
export const EASE = 'expo.out';

/**
 * Media query for the full experience. gsap.matchMedia reverts everything
 * made under it when the query stops matching, so reduced motion and small
 * screens fall back to the plain, static layout.
 */
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)';
export const DESKTOP_MOTION = '(prefers-reduced-motion: no-preference) and (min-width: 900px)';

export { gsap, ScrollTrigger, SplitText };
