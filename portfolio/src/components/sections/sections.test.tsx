import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { about, contacts, projects, skillGroups } from '../../data';
import ContactSection from './ContactSection';
import Hero from './Hero';
import ProjectsSection, { FEATURED_COUNT } from './ProjectsSection';
import SkillsSection from './SkillsSection';
import Story from './Story';

describe('Hero', () => {
  it('leads with the headline and calls to action', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(about.headline);
    expect(screen.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact');
    for (const drive of about.drives) {
      expect(screen.getByText(drive)).toBeInTheDocument();
    }
  });
});

describe('Story', () => {
  it('tells the story from about.json with a photo and timeline', () => {
    render(<Story />);
    expect(screen.getByText(about.intro)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: about.name })).toBeInTheDocument();
    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(steps).toHaveLength(about.timeline.length);
    about.timeline.forEach((step, i) => {
      expect(steps[i]).toHaveTextContent(step.title);
      expect(steps[i]).toHaveTextContent(step.place);
    });
  });
});

describe('ProjectsSection', () => {
  const cardNames = () =>
    screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

  it('shows the featured projects first', () => {
    render(<ProjectsSection />);
    expect(cardNames()).toEqual(projects.slice(0, FEATURED_COUNT).map((p) => p.name));
  });

  it('can expand to every project and collapse again', async () => {
    render(<ProjectsSection />);
    const toggle = screen.getByRole('button', { name: `Show all ${projects.length} projects` });
    await userEvent.click(toggle);
    expect(cardNames()).toEqual(projects.map((p) => p.name));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Show fewer' }));
    expect(cardNames()).toHaveLength(FEATURED_COUNT);
  });
});

describe('SkillsSection', () => {
  it('shows every skill group and skill', () => {
    render(<SkillsSection />);
    for (const group of skillGroups) {
      const heading = screen.getByRole('heading', { level: 3, name: group.title });
      const list = heading.parentElement!.querySelector('ul')!;
      expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(
        group.skills.map((s) => s.name),
      );
    }
  });
});

describe('ContactSection', () => {
  it('links every contact method plus GitHub', () => {
    render(<ContactSection />);
    for (const contact of contacts) {
      expect(screen.getByRole('link', { name: contact.name })).toHaveAttribute('href', contact.link);
    }
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/MichaelVerdon',
    );
  });

  it('opens web links in a new tab but not email links', () => {
    render(<ContactSection />);
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Email' })).not.toHaveAttribute('target');
  });
});
