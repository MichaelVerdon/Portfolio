import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { contacts, projects, skillGroups } from '../data';
import Contact from './Contact';
import Home from './Home';
import Projects from './Projects';
import Skills from './Skills';

describe('Home page', () => {
  it('introduces Michael with a photo', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /my name is michael/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Michael Verdon' })).toBeInTheDocument();
  });

  it('links to GitHub', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Home />);
    await userEvent.click(screen.getByRole('img', { name: 'GitHub' }));
    expect(open).toHaveBeenCalledWith('https://github.com/MichaelVerdon');
    open.mockRestore();
  });
});

describe('Projects page', () => {
  it('shows a card for every project in projects.json', () => {
    render(<Projects />);
    for (const project of projects) {
      expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument();
    }
  });
});

describe('Skills page', () => {
  it('shows every skill group and skill', () => {
    render(<Skills />);
    for (const group of skillGroups) {
      expect(screen.getByRole('heading', { level: 2, name: group.title })).toBeInTheDocument();
      for (const skill of group.skills) {
        expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('Contact page', () => {
  it('shows every contact method', () => {
    render(<Contact />);
    for (const contact of contacts) {
      expect(screen.getByRole('img', { name: contact.name })).toBeInTheDocument();
    }
  });
});
