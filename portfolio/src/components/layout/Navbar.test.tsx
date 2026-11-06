import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../../test/render';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('links the logo home and each link to its section', () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    expect(screen.getByRole('link', { name: 'Michael Verdon' })).toHaveAttribute('href', '/');
    for (const [name, href] of [
      ['Story', '/#story'],
      ['Projects', '/#projects'],
      ['Skills', '/#skills'],
      ['Contact', '/#contact'],
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('opens and closes the mobile menu', async () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    const list = screen.getByRole('list');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(list).toHaveClass('is-open');
    await userEvent.click(toggle);
    expect(list).not.toHaveClass('is-open');
  });

  it('closes the mobile menu after choosing a section', async () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'Skills' }));
    expect(screen.getByRole('list')).not.toHaveClass('is-open');
  });

  it('closes the mobile menu when the logo is clicked', async () => {
    renderWithRouter(<Navbar logo="/logo.png" />);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    await userEvent.click(screen.getByRole('link', { name: 'Michael Verdon' }));
    expect(screen.getByRole('list')).not.toHaveClass('is-open');
  });
});
