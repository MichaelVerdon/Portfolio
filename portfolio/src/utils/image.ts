const PLACEHOLDER = 'https://via.placeholder.com/400';

/** Returns the image path, or a placeholder when the JSON says "N/A". */
export function imageOrPlaceholder(src: string): string {
  return src !== 'N/A' ? src : PLACEHOLDER;
}
