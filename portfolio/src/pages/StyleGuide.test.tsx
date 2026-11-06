import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { renderWithRouter } from '../test/render';

describe('Style guide page', () => {
  it('is reachable at /style-guide', () => {
    renderWithRouter(<App />, '/style-guide');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/software engineer/i);
  });

  it('shows every section of the design system', () => {
    renderWithRouter(<App />, '/style-guide');
    for (const name of [/logo stays/i, /monochrome/i, /space grotesk/i, /4px grid/i, /buttons/i, /abstract shapes/i]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('shows all three geometric visuals', () => {
    renderWithRouter(<App />, '/style-guide');
    expect(screen.getAllByTestId('pixel-steps').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('pixel-field').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('orbit-rings').length).toBeGreaterThan(0);
  });

  it('is not linked from the navbar yet', () => {
    renderWithRouter(<App />, '/');
    expect(screen.queryByRole('link', { name: /style guide/i })).not.toBeInTheDocument();
  });
});
