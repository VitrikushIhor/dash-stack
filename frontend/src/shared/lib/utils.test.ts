import { describe, expect, it } from 'vitest'
import { cn, getInitials, getPageNumbers, stringToColor } from './utils'

describe('cn (className merge utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isInactive = false
    expect(cn('base', isActive && 'active', isInactive && 'inactive')).toBe(
      'base active'
    )
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle arrays and objects', () => {
    expect(cn(['foo', 'bar'], { baz: true, qux: false })).toBe('foo bar baz')
  })
})

describe('getInitials', () => {
  it('should return initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('should return first two initials for long names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('should return uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

describe('stringToColor', () => {
  it('should return HSL color string', () => {
    const color = stringToColor('test')
    expect(color).toMatch(/^hsl\(\d+, 65%, 50%\)$/)
  })

  it('should return consistent color for same string', () => {
    const color1 = stringToColor('hello')
    const color2 = stringToColor('hello')
    expect(color1).toBe(color2)
  })

  it('should return different colors for different strings', () => {
    const color1 = stringToColor('hello')
    const color2 = stringToColor('world')
    expect(color1).not.toBe(color2)
  })
})

describe('getPageNumbers', () => {
  it('should return all pages for small datasets', () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3])
    expect(getPageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('should show ellipsis at end when near beginning', () => {
    const result = getPageNumbers(2, 10)
    expect(result).toEqual([1, 2, 3, 4, '...', 10])
  })

  it('should show ellipsis at beginning when near end', () => {
    const result = getPageNumbers(9, 10)
    expect(result).toEqual([1, '...', 7, 8, 9, 10])
  })

  it('should show ellipsis on both sides when in middle', () => {
    const result = getPageNumbers(5, 10)
    expect(result).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('should always include first and last page', () => {
    const result = getPageNumbers(5, 20)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(20)
  })
})
