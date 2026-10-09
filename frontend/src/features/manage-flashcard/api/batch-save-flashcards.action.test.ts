import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Flashcard } from '@/entities/deck'
import { flashcardServerApi } from '@/entities/deck/server'
import { batchSaveFlashcardsAction } from './batch-save-flashcards.action'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/entities/deck/server', () => ({
  flashcardServerApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('batchSaveFlashcardsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create new cards, update existing cards, and delete removed cards', async () => {
    vi.mocked(flashcardServerApi.create).mockResolvedValueOnce([])
    vi.mocked(flashcardServerApi.update).mockResolvedValueOnce(
      {} as unknown as Flashcard
    )
    vi.mocked(flashcardServerApi.delete).mockResolvedValueOnce(
      undefined as unknown as void
    )

    const result = await batchSaveFlashcardsAction({
      deckId: 'deck-123',
      cards: [
        {
          id: 'card-1',
          term: 'ephemeral',
          definition: 'lasting for a very short time',
          isNew: false,
          position: 0,
        },
        {
          id: 'temp-12345',
          term: 'serendipity',
          definition: 'finding good things without looking for them',
          isNew: true,
          position: 1,
        },
      ],
      deletedCardIds: ['card-old-99'],
    })

    expect(result.success).toBe(true)
    expect(flashcardServerApi.delete).toHaveBeenCalledWith(
      'deck-123',
      'card-old-99'
    )
    expect(flashcardServerApi.create).toHaveBeenCalledWith('deck-123', {
      cards: [
        {
          term: 'serendipity',
          definition: 'finding good things without looking for them',
          example: undefined,
          imageUrl: undefined,
          position: 1,
        },
      ],
    })
    expect(flashcardServerApi.update).toHaveBeenCalledWith(
      'deck-123',
      'card-1',
      {
        term: 'ephemeral',
        definition: 'lasting for a very short time',
        example: undefined,
        imageUrl: undefined,
        position: 0,
      }
    )
    expect(revalidateTag).toHaveBeenCalled()
  })

  it('should ignore temp IDs in deletedCardIds', async () => {
    const result = await batchSaveFlashcardsAction({
      deckId: 'deck-123',
      cards: [],
      deletedCardIds: ['temp-999'],
    })

    expect(result.success).toBe(true)
    expect(flashcardServerApi.delete).not.toHaveBeenCalled()
  })

  it('should return failure if any operation fails', async () => {
    vi.mocked(flashcardServerApi.update).mockRejectedValueOnce(
      new Error('Database error')
    )

    const result = await batchSaveFlashcardsAction({
      deckId: 'deck-123',
      cards: [
        {
          id: 'card-1',
          term: 'ubiquitous',
          definition: 'present everywhere',
          isNew: false,
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Database error')
    }
  })
})
