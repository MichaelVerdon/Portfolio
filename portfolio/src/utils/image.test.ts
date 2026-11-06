import { describe, expect, it } from 'vitest';
import { imageOrPlaceholder } from './image';

describe('imageOrPlaceholder', () => {
  it('returns the path when there is one', () => {
    expect(imageOrPlaceholder('/projects/logo.png')).toBe('/projects/logo.png');
  });

  it('returns a placeholder for "N/A"', () => {
    expect(imageOrPlaceholder('N/A')).toMatch(/^https:\/\//);
  });
});
