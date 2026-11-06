import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ContactCard from './ContactCard';

describe('ContactCard', () => {
  it('opens the contact link when the icon is clicked', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <ContactCard
        contact={{ name: 'Email', img: '/contact/gmail.svg', link: 'mailto:test@example.com' }}
      />,
    );
    await userEvent.click(screen.getByRole('img', { name: 'Email' }));
    expect(open).toHaveBeenCalledWith('mailto:test@example.com');
    open.mockRestore();
  });
});
