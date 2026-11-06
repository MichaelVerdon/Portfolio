import { describe, expect, it } from 'vitest';
import { imageOrPlaceholder, PLACEHOLDER_IMAGE } from './image';

describe('imageOrPlaceholder', () => {
  it('returns the path when there is one', () => {
    expect(imageOrPlaceholder('/projects/logo.png')).toBe('/projects/logo.png');
  });

  it('returns the local placeholder for "N/A"', () => {
    expect(imageOrPlaceholder('N/A')).toBe(PLACEHOLDER_IMAGE);
  });
});
