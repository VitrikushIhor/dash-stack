import { describe, expect, it } from 'vitest'
import { normalizeDeckTag } from './normalize-deck-tag'

describe('normalizeDeckTag', () => {
  it('trims, lowercases, and removes a leading hash', () => {
    expect(normalizeDeckTag('  #Daily Use  ')).toBe('daily use')
  })
})
