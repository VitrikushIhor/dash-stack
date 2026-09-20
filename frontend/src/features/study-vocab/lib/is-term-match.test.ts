import { describe, expect, it } from 'vitest'
import { isTermMatch } from './is-term-match'

describe('isTermMatch', () => {
  it('returns true for exact matches (case-insensitive and trimmed)', () => {
    expect(isTermMatch('Apple', 'apple')).toBe(true)
    expect(isTermMatch('  apple  ', 'APPLE')).toBe(true)
    expect(isTermMatch('hello world', 'HELLO WORLD')).toBe(true)
  })

  it('returns false for mismatched terms', () => {
    expect(isTermMatch('banana', 'apple')).toBe(false)
    expect(isTermMatch('app', 'apple')).toBe(false)
    expect(isTermMatch('', 'apple')).toBe(false)
    expect(isTermMatch('   ', 'apple')).toBe(false)
  })

  it('handles compound terms with parentheses forms (e.g. irregular verbs)', () => {
    const term = 'buy (bought, bought)'

    // Full match
    expect(isTermMatch('buy (bought, bought)', term)).toBe(true)
    // Base form
    expect(isTermMatch('buy', term)).toBe(true)
    expect(isTermMatch('BUY', term)).toBe(true)
    // Parenthesized form
    expect(isTermMatch('bought', term)).toBe(true)
    expect(isTermMatch('BOUGHT', term)).toBe(true)

    // Negative case
    expect(isTermMatch('selling', term)).toBe(false)
  })

  it('handles single form in parentheses', () => {
    const term = 'run (ran)'

    expect(isTermMatch('run', term)).toBe(true)
    expect(isTermMatch('ran', term)).toBe(true)
    expect(isTermMatch('running', term)).toBe(false)
  })

  it('accepts an exact comma-separated variant without accepting a prefix', () => {
    expect(isTermMatch('thought', 'thought, thought')).toBe(true)
    expect(isTermMatch('written', 'write, wrote, written')).toBe(true)
    expect(isTermMatch('wri', 'write, wrote, written')).toBe(false)
  })
})
