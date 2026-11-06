import '@testing-library/jest-dom/vitest';
import Modal from 'react-modal';

// react-modal hides its "app element" from screen readers while a modal is open.
// Point it at a dedicated element so the modals rendered in tests stay queryable.
const appElement = document.createElement('div');
appElement.id = 'root';
document.body.appendChild(appElement);
Modal.setAppElement(appElement);
