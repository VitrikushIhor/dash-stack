import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deckServerApi } from '@/entities/deck/server'
import { saveDeckEditorAction } from './save-deck-editor.action'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('@/entities/deck/server', () => ({
  deckServerApi: { saveEditor: vi.fn() },
}))

describe('saveDeckEditorAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects a successful transport response without flashcards', async () => {
    vi.mocked(deckServerApi.saveEditor).mockResolvedValueOnce({
      id: 'deck-1',
    } as never)

    const result = await saveDeckEditorAction({
      id: 'deck-1',
      data: {
        operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
        expectedUpdatedAt: '2026-09-20T12:00:00.000Z',
        metadata: {},
        cards: [],
        deletedCardIds: [],
      },
    })

    expect(result).toEqual({
      success: false,
      error: 'Deck editor save returned an incomplete response',
    })
  })
})
