import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDeckMetadataQuery } from '@/entities/deck/server'
import { getCurrentUser } from '@/entities/user/server'
import { getDeckCardsQuery } from '@/entities/vocab/server'
import { getDeckBoardData } from './get-deck-board-data'

vi.mock('@/entities/deck/server', () => ({ getDeckMetadataQuery: vi.fn() }))
vi.mock('@/entities/user/server', () => ({ getCurrentUser: vi.fn() }))
vi.mock('@/entities/vocab/server', () => ({ getDeckCardsQuery: vi.fn() }))

describe('getDeckBoardData', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_load_metadata_without_the_unbounded_flashcard_relation', async () => {
    vi.mocked(getDeckMetadataQuery).mockResolvedValue({
      ok: true,
      data: {
        id: 'deck-1',
        ownerUserId: 'owner-1',
        title: 'Deck',
        language: 'en',
        tags: [],
        visibility: 'PRIVATE',
        status: 'DRAFT',
        type: 'USER_GENERATED',
        createdAt: '',
        updatedAt: '',
      },
    })
    vi.mocked(getDeckCardsQuery).mockResolvedValue({
      ok: true,
      data: {
        data: [],
        meta: {
          total: 0,
          lastPage: 1,
          currentPage: 1,
          perPage: 50,
          prev: null,
          next: null,
        },
        summary: { total: 0, due: 0, starred: 0, dueAndStarred: 0 },
      },
    })
    vi.mocked(getCurrentUser).mockResolvedValue({
      data: null,
      error: null,
      statusCode: null,
    })

    await getDeckBoardData('deck-1')

    expect(getDeckMetadataQuery).toHaveBeenCalledWith('deck-1')
    expect(getDeckCardsQuery).toHaveBeenCalledWith({
      deckId: 'deck-1',
      page: 1,
      perPage: 50,
    })
  })
})
