import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../test/render';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('links to every page', () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute('href', '/skills');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Michael Verdon' })).toHaveAttribute('href', '/');
  });

  it('opens and closes the mobile menu', async () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    const list = screen.getByRole('list');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(list).not.toHaveClass('active');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(list).toHaveClass('active');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the mobile menu after choosing a page', async () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'Skills' }));
    expect(screen.getByRole('list')).not.toHaveClass('active');
  });
});
