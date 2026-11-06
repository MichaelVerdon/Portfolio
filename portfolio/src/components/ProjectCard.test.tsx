import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Project } from '../types/content';
import ProjectCard from './ProjectCard';

const project: Project = {
  name: 'Test Project',
  src: '/projects/test.png',
  link: 'https://github.com/MichaelVerdon/test',
  desc: 'A project used in tests.',
  tech: 'TypeScript, React',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ProjectCard', () => {
  it('shows the name and image, with details hidden', () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Project' })).toHaveAttribute('src', project.src);
    expect(screen.queryByText(project.desc)).not.toBeInTheDocument();
  });

  it('opens a modal with the description and tech when clicked', async () => {
    render(<ProjectCard project={project} />);
    await userEvent.click(screen.getByText('Click for more info'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(project.desc);
    expect(dialog).toHaveTextContent(project.tech);
  });

  it('closes the modal on Escape', async () => {
    render(<ProjectCard project={project} />);
    await userEvent.click(screen.getByText('Click for more info'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the source code link from the modal', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ProjectCard project={project} />);
    await userEvent.click(screen.getByText('Click for more info'));
    await userEvent.click(screen.getByRole('img', { name: 'GitHub' }));
    expect(open).toHaveBeenCalledWith(project.link);
  });

  it('uses a placeholder image when the source is "N/A"', () => {
    render(<ProjectCard project={{ ...project, src: 'N/A' }} />);
    expect(screen.getByRole('img', { name: 'Test Project' }).getAttribute('src')).toMatch(
      /^https:\/\//,
    );
  });
});
