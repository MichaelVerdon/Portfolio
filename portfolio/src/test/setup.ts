import '@testing-library/jest-dom/vitest';
import Modal from 'react-modal';

// react-modal hides its "app element" from screen readers while a modal is open.
// Point it at a dedicated element so the modals rendered in tests stay queryable.
const appElement = document.createElement('div');
appElement.id = 'root';
document.body.appendChild(appElement);
Modal.setAppElement(appElement);

// jsdom has no matchMedia. Stub it as a visitor who prefers reduced motion,
// so the motion layer (GSAP, Lenis, canvas animation) stays off in tests and
// components render their static, fully visible fallback.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom can't draw on a canvas; return no context so the hero canvas quietly
// skips drawing instead of logging "not implemented" errors.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
