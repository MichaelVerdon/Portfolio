import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SkillCard from './SkillCard';

describe('SkillCard', () => {
  it('shows the skill name and icon', () => {
    render(<SkillCard skill={{ name: 'Rust', src: '/languages/rust.svg' }} />);
    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Rust' })).toHaveAttribute('src', '/languages/rust.svg');
  });
});
