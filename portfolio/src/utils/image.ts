/** On-brand placeholder shown until a real image is added. */
export const PLACEHOLDER_IMAGE = '/projects/placeholder.svg';

/** Returns the image path, or the placeholder when the JSON says "N/A". */
export function imageOrPlaceholder(src: string): string {
  return src !== 'N/A' ? src : PLACEHOLDER_IMAGE;
}
