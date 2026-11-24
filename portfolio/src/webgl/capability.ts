import { prefersReducedMotion } from '../motion/reducedMotion';

/**
 * How much 3D this visitor gets:
 * - "full": desktop-class device, the whole scene.
 * - "lite": phones, tablets and modest laptops: fewer cubes, lower resolution, no antialiasing.
 * - "off": reduced motion, data saver, very low-end hardware, or no WebGL at all.
 */
export type Tier = 'full' | 'lite' | 'off';

interface NavigatorHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function media(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function detectTier(): Tier {
  if (typeof window === 'undefined' || prefersReducedMotion()) return 'off';

  // ?webgl=off|lite|full forces a tier, handy for checking each one.
  const forced = new URLSearchParams(window.location.search).get('webgl');
  if (forced === 'off' || forced === 'lite' || forced === 'full') {
    return forced === 'off' || supportsWebGL() ? forced : 'off';
  }

  const nav = navigator as Navigator & NavigatorHints;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  if (nav.connection?.saveData || cores <= 2 || memory <= 2) return 'off';
  if (!supportsWebGL()) return 'off';

  const touch = media('(pointer: coarse)');
  const narrow = media('(max-width: 899px)');
  if (touch || narrow || cores <= 4 || memory <= 4) return 'lite';
  return 'full';
}
