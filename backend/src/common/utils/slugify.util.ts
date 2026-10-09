/**
 * Converts a string into a URL-friendly slug.
 *
 * @param text - The raw input string
 * @returns Cleaned and formatted slug string
 *
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('  Oxford 3000 -- Verbs  ') // 'oxford-3000-verbs'
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .split(/[\s-]+/)
    .map((part) => part.replace(/[^\w]/g, ''))
    .filter(Boolean)
    .join('-');
}
