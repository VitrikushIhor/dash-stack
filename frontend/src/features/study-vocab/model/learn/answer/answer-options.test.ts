import { describe, expect, it } from 'vitest'
import { createLearnChoices } from './answer-options'

const card = { id: 'a', definition: 'Apple' }
const pool = [
  card,
  { id: 'b', definition: 'Banana' },
  { id: 'c', definition: 'Pear' },
  { id: 'd', definition: 'Orange' },
]

describe('createLearnChoices', () => {
  it('should_return_four_unique_definitions_when_mcq_is_possible', () => {
    const result = createLearnChoices(card, pool)

    expect(result).toHaveLength(4)
    expect(result).toContainEqual(card)
    expect(new Set(result?.map((option) => option.definition)).size).toBe(4)
    expect(pool.map((option) => option.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('should_exclude_blank_and_normalized_duplicate_answers_when_selecting', () => {
    const result = createLearnChoices(card, [
      { id: 'blank', definition: '  ' },
      { id: 'same', definition: ' APPLE ' },
      { id: 'duplicate', definition: ' banana ' },
      ...pool,
    ])

    expect(result).toHaveLength(4)
    expect(
      new Set(result?.map((option) => option.definition.trim().toLowerCase()))
        .size
    ).toBe(4)
    expect(result).not.toContainEqual({ id: 'blank', definition: '  ' })
  })

  it.each([[], pool.slice(0, 1), pool.slice(0, 3)])(
    'should_fall_back_to_typing_when_selection_is_too_small_%j',
    (...selection) => {
      expect(createLearnChoices(card, selection)).toBeNull()
    }
  )

  it('should_fall_back_to_typing_when_four_cards_lack_unique_answers', () => {
    expect(createLearnChoices(card, [card, card, pool[1], pool[2]])).toBeNull()
  })
})
