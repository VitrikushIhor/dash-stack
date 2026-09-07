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
      data: { metadata: {}, cards: [], deletedCardIds: [] },
    })

    expect(result).toEqual({
      success: false,
      error: 'Deck editor save returned an incomplete response',
    })
  })
})
