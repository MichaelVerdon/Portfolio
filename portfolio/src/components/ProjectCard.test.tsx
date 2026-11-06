import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Project } from '../types/content';
import ProjectCard from './ProjectCard';

const project: Project = {
  name: 'Test Project',
  src: '/projects/test.png',
  link: 'https://github.com/MichaelVerdon/test',
  desc: 'A project used in tests.',
  tech: 'TypeScript, React, Vite, Vitest, Node',
};

async function openModal() {
  await userEvent.click(screen.getByRole('button', { name: /test project/i }));
  return screen.getByRole('dialog');
}

describe('ProjectCard', () => {
  it('shows the name, description and first three tech tags', () => {
    render(<ProjectCard project={project} />);
    const card = screen.getByRole('button', { name: /test project/i });
    expect(within(card).getByRole('heading', { name: 'Test Project' })).toBeInTheDocument();
    expect(card).toHaveTextContent(project.desc);
    expect(within(card).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'TypeScript',
      'React',
      'Vite',
      '+2',
    ]);
  });

  it('shows no "+" tag when there are three tags or fewer', () => {
    render(<ProjectCard project={{ ...project, tech: 'Python, Flask' }} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('opens a dialog with all the details and a source link', async () => {
    render(<ProjectCard project={project} />);
    const dialog = await openModal();
    expect(dialog).toHaveTextContent(project.desc);
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(5);
    const source = within(dialog).getByRole('link', { name: /view source/i });
    expect(source).toHaveAttribute('href', project.link);
    expect(source).toHaveAttribute('target', '_blank');
  });

  it('hides the source link when the project has no public repo', async () => {
    render(<ProjectCard project={{ ...project, link: '/' }} />);
    const dialog = await openModal();
    expect(within(dialog).queryByRole('link')).not.toBeInTheDocument();
  });

  it('fills the frame for cover images only', async () => {
    const { rerender, container } = render(<ProjectCard project={project} />);
    expect(container.querySelector('.projectCard-image')).not.toHaveClass('is-cover');
    rerender(<ProjectCard project={{ ...project, imageFit: 'cover' }} />);
    expect(container.querySelector('.projectCard-image')).toHaveClass('is-cover');
  });

  it('closes with the close button', async () => {
    render(<ProjectCard project={project} />);
    await openModal();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<ProjectCard project={project} />);
    await openModal();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
