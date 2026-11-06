import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { about } from './data';
import { renderWithRouter } from './test/render';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders the story page at /', () => {
    renderWithRouter(<App />, '/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(about.headline);
    for (const id of ['story', 'projects', 'skills', 'contact']) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }
  });

  it('always shows the navbar and footer', () => {
    renderWithRouter(<App />, '/style-guide');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent(about.name);
  });

  it.each(['projects', 'skills', 'contact'])(
    'sends the old /%s page to its section',
    (section) => {
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      renderWithRouter(<App />, `/${section}`);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(about.headline);
      expect(scroll).toHaveBeenCalled();
      expect(scroll.mock.contexts[0]).toHaveProperty('id', section);
    },
  );

  it('sends unknown pages home', () => {
    renderWithRouter(<App />, '/nope');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(about.headline);
  });
});
