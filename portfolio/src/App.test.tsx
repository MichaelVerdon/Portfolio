import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithRouter } from './test/render';

describe('App routing', () => {
  it('renders the home page at /', () => {
    renderWithRouter(<App />, '/');
    expect(screen.getByRole('heading', { name: /my name is michael/i })).toBeInTheDocument();
  });

  it.each([
    ['/projects', 'Projects'],
    ['/skills', 'Skills'],
    ['/contact', 'Contact'],
  ])('renders the %s page', (path, heading) => {
    renderWithRouter(<App />, path);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('always shows the navbar with the logo', () => {
    renderWithRouter(<App />, '/skills');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Michael Verdon' })).toBeInTheDocument();
  });

  it('navigates between pages without a full reload', async () => {
    renderWithRouter(<App />, '/');
    await userEvent.click(screen.getByRole('link', { name: 'Projects' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Skills' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Michael Verdon' }));
    expect(screen.getByRole('heading', { name: /my name is michael/i })).toBeInTheDocument();
  });
});
