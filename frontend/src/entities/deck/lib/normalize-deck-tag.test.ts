import { describe, expect, it } from 'vitest'
import {
  addDeckTag,
  normalizeDeckTag,
  removeDeckTag,
} from './normalize-deck-tag'

describe('normalizeDeckTag', () => {
  it('trims, lowercases, and removes a leading hash', () => {
    expect(normalizeDeckTag('  #Daily Use  ')).toBe('daily use')
  })
})

describe('deck tag collection', () => {
  it('should_add_normalized_tag_when_unique', () => {
    expect(addDeckTag(['verbs'], '  #Daily Use  ')).toEqual([
      'verbs',
      'daily use',
    ])
  })

  it('should_preserve_tags_when_tag_is_empty_or_duplicate', () => {
    const tags = ['verbs']

    expect(addDeckTag(tags, ' #VERBS ')).toBe(tags)
    expect(addDeckTag(tags, ' # ')).toBe(tags)
  })

  it('should_remove_only_matching_tag', () => {
    expect(removeDeckTag(['verbs', 'daily use'], 'verbs')).toEqual([
      'daily use',
    ])
  })
})
