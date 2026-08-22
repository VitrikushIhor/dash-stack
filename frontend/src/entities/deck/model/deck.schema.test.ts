import { describe, expect, it } from 'vitest'
import { CreateDeckSchema, FlashcardSchema } from './deck.schema'
import { CEFRLevelEnum, DeckVisibilityEnum } from './types'

describe('CreateDeckSchema', () => {
  it('validates a valid deck input', () => {
    const validData = {
      title: 'Business English Vocabulary',
      description: 'Useful terms for meetings and negotiations',
      language: 'en',
      level: CEFRLevelEnum.B2,
      tags: ['business', 'negotiation'],
      visibility: DeckVisibilityEnum.PUBLIC,
    }

    const result = CreateDeckSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('fails when title is empty', () => {
    const invalidData = {
      title: '',
      language: 'en',
      tags: [],
      visibility: DeckVisibilityEnum.PRIVATE,
    }

    const result = CreateDeckSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('fails when title exceeds 100 characters', () => {
    const invalidData = {
      title: 'a'.repeat(101),
      language: 'en',
      tags: [],
      visibility: DeckVisibilityEnum.PRIVATE,
    }

    const result = CreateDeckSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('FlashcardSchema', () => {
  it('validates valid flashcard input', () => {
    const validCard = {
      term: 'Resilient',
      definition:
        'Able to withstand or recover quickly from difficult conditions',
      example: 'The team remained resilient during the crisis.',
      imageUrl: 'https://images.unsplash.com/photo-12345',
    }

    const result = FlashcardSchema.safeParse(validCard)
    expect(result.success).toBe(true)
  })

  it('allows empty imageUrl or omitted example', () => {
    const validCard = {
      term: 'Ephemeral',
      definition: 'Lasting for a very short time',
      imageUrl: '',
    }

    const result = FlashcardSchema.safeParse(validCard)
    expect(result.success).toBe(true)
  })

  it('fails when term or definition is empty', () => {
    const result1 = FlashcardSchema.safeParse({ term: '', definition: 'Valid' })
    const result2 = FlashcardSchema.safeParse({ term: 'Valid', definition: '' })

    expect(result1.success).toBe(false)
    expect(result2.success).toBe(false)
  })
})
