import { slugify } from './slugify.util';

describe('slugify utility', () => {
  it('should convert mixed case and spaces to lowercase hyphenated string', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should trim leading and trailing spaces and hyphens', () => {
    expect(slugify('  -- Oxford 3000 --  ')).toBe('oxford-3000');
  });

  it('should replace special characters and collapse multiple hyphens', () => {
    expect(slugify('Tech & Software: 101 (Basics!)')).toBe('tech-software-101-basics');
  });

  it('should return empty string for empty input', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null as any)).toBe('');
    expect(slugify(undefined as any)).toBe('');
  });
});
