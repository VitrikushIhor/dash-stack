import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { vocabApi } from '../api/vocab-api'
import { vocabKeys } from '../api/vocab-query-keys'
import { type DeckCardsPage } from './types'
import { useDeckCards } from './use-deck-cards'

const initialPage: DeckCardsPage = {
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
}

function createStudyCard(id: string, position: number) {
  return {
    id,
    deckId: 'deck-1',
    term: `Term ${position + 1}`,
    definition: `Definition ${position + 1}`,
    example: null,
    imageUrl: null,
    position,
    progress: {
      id: `progress-${id}`,
      status: 'NEW' as const,
      box: 1,
      isStarred: false,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    },
  } satisfies DeckCardsPage['data'][number]
}

describe('useDeckCards', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should_debounce_backend_search_and_forward_abort_signal', async () => {
    vi.useFakeTimers()
    const browse = vi
      .spyOn(vocabApi, 'browseDeckCards')
      .mockResolvedValue(initialPage)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { rerender } = renderHook(
      ({ search }) => useDeckCards('deck-1', search, initialPage),
      { initialProps: { search: '' }, wrapper }
    )

    rerender({ search: 'deploy' })
    await act(() => vi.advanceTimersByTimeAsync(299))
    expect(browse).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
      await Promise.resolve()
    })
    expect(browse).toHaveBeenCalledOnce()
    expect(browse).toHaveBeenCalledWith(
      'deck-1',
      { search: 'deploy', page: 1, perPage: 50 },
      expect.any(AbortSignal)
    )
  })

  it('should_expose_search_errors_and_retry', async () => {
    const error = new Error('Search unavailable')
    const browse = vi
      .spyOn(vocabApi, 'browseDeckCards')
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(initialPage)
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => useDeckCards('deck-1', 'broken', initialPage),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)

    await result.current.retrySearch()
    await waitFor(() => expect(result.current.isError).toBe(false))
    expect(browse).toHaveBeenCalledTimes(2)
  })

  it('should_replace_cached_initial_page_when_server_props_change', async () => {
    const client = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const first = {
      ...initialPage,
      data: [
        {
          id: 'card-1',
          deckId: 'deck-1',
          term: 'Before',
          definition: 'Old',
          example: null,
          imageUrl: null,
          position: 0,
          progress: {
            id: null,
            status: 'NEW' as const,
            box: 1,
            isStarred: false,
            correctStreak: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
          },
        },
      ],
    }
    const { result, rerender } = renderHook(
      ({ page }) => useDeckCards('deck-1', '', page),
      { initialProps: { page: first }, wrapper }
    )

    rerender({
      page: {
        ...first,
        data: [{ ...first.data[0], term: 'After', definition: 'New' }],
      },
    })

    await waitFor(() => expect(result.current.cards[0]?.term).toBe('After'))
  })

  it('should_invalidate_every_search_cache_for_the_deck', async () => {
    const client = new QueryClient()

    client.setQueryData(vocabKeys.deckCards('deck-1', 'alpha'), initialPage)
    client.setQueryData(vocabKeys.deckCards('deck-1', 'beta'), initialPage)
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => useDeckCards('deck-1', '', initialPage),
      { wrapper }
    )

    await result.current.invalidateDeckCards()

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: vocabKeys.deckCardsForDeck('deck-1'),
    })
  })

  it('should_keep_cards_visible_during_a_background_refetch', async () => {
    let resolveBrowse: ((page: DeckCardsPage) => void) | undefined

    vi.spyOn(vocabApi, 'browseDeckCards').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBrowse = resolve
        })
    )
    const client = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => useDeckCards('deck-1', '', initialPage),
      { wrapper }
    )

    const invalidation = result.current.invalidateDeckCards()

    await waitFor(() => expect(vocabApi.browseDeckCards).toHaveBeenCalledOnce())

    expect(result.current.isSearchPending).toBe(false)
    expect(result.current.cards).toEqual(initialPage.data)

    resolveBrowse?.(initialPage)
    await act(() => invalidation)
  })

  it('should_preserve_the_cards_reference_when_query_data_is_unchanged', () => {
    const client = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result, rerender } = renderHook(
      () => useDeckCards('deck-1', '', initialPage),
      { wrapper }
    )
    const cards = result.current.cards

    rerender()

    expect(result.current.cards).toBe(cards)
  })

  it('should_update_a_starred_card_in_cached_pages_without_invalidating_pagination', () => {
    const client = new QueryClient()
    const pageOne: DeckCardsPage = {
      ...initialPage,
      data: [
        {
          id: 'card-1',
          deckId: 'deck-1',
          term: 'First',
          definition: 'First definition',
          example: null,
          imageUrl: null,
          position: 0,
          progress: {
            id: 'progress-1',
            status: 'NEW',
            box: 1,
            isStarred: false,
            correctStreak: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
          },
        },
      ],
      meta: { ...initialPage.meta, total: 2, next: 2 },
      summary: { total: 2, due: 0, starred: 0, dueAndStarred: 0 },
    }
    const pageTwo: DeckCardsPage = {
      ...pageOne,
      data: [{ ...pageOne.data[0], id: 'card-2', position: 1 }],
      meta: { ...pageOne.meta, currentPage: 2, next: null, prev: 1 },
    }
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useDeckCards('deck-1', '', pageOne), {
      wrapper,
    })

    act(() => {
      client.setQueryData(vocabKeys.deckCards('deck-1', ''), {
        pages: [pageOne, pageTwo],
        pageParams: [1, 2],
      })
      result.current.setCardStarred('card-2', true)
    })

    const cached = client.getQueryData<{ pages: DeckCardsPage[] }>(
      vocabKeys.deckCards('deck-1', '')
    )

    expect(
      cached?.pages.flatMap((page) => page.data).map((card) => card.id)
    ).toEqual(['card-1', 'card-2'])
    expect(cached?.pages[1]?.data[0]?.progress.isStarred).toBe(true)
    expect(cached?.pages[0]?.summary.starred).toBe(1)
    expect(invalidate).not.toHaveBeenCalled()
  })

  it('should_update_deck_summary_in_every_search_cache_when_the_card_is_only_in_one_cache', () => {
    const client = new QueryClient()
    const searchPage: DeckCardsPage = {
      ...initialPage,
      data: [
        {
          id: 'card-140',
          deckId: 'deck-1',
          term: 'Search only',
          definition: 'Definition',
          example: null,
          imageUrl: null,
          position: 139,
          progress: {
            id: 'progress-140',
            status: 'NEW',
            box: 1,
            isStarred: false,
            correctStreak: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
          },
        },
      ],
      summary: { total: 140, due: 0, starred: 4, dueAndStarred: 0 },
    }
    const unfilteredPage: DeckCardsPage = {
      ...initialPage,
      summary: { total: 140, due: 0, starred: 4, dueAndStarred: 0 },
    }
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => useDeckCards('deck-1', '', unfilteredPage),
      { wrapper }
    )

    act(() => {
      client.setQueryData(vocabKeys.deckCards('deck-1', 'search-only'), {
        pages: [searchPage],
        pageParams: [1],
      })
      result.current.setCardStarred('card-140', true)
    })

    const unfiltered = client.getQueryData<{ pages: DeckCardsPage[] }>(
      vocabKeys.deckCards('deck-1', '')
    )
    const searched = client.getQueryData<{ pages: DeckCardsPage[] }>(
      vocabKeys.deckCards('deck-1', 'search-only')
    )

    expect(unfiltered?.pages[0]?.summary.starred).toBe(5)
    expect(searched?.pages[0]?.summary.starred).toBe(5)
    expect(searched?.pages[0]?.data[0]?.progress.isStarred).toBe(true)
  })

  it('should_preserve_subsequent_pages_when_initial_page_props_update', async () => {
    const client = new QueryClient()
    const pageOne: DeckCardsPage = {
      ...initialPage,
      meta: {
        currentPage: 1,
        perPage: 1,
        total: 2,
        lastPage: 2,
        next: 2,
        prev: null,
      },
      data: [{ ...createStudyCard('card-1', 0), term: 'First' }],
    }
    const pageTwo: DeckCardsPage = {
      ...initialPage,
      meta: {
        currentPage: 2,
        perPage: 1,
        total: 2,
        lastPage: 2,
        next: null,
        prev: 1,
      },
      data: [{ ...createStudyCard('card-2', 1), term: 'Second' }],
    }
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    client.setQueryData(vocabKeys.deckCards('deck-1', ''), {
      pages: [pageOne, pageTwo],
      pageParams: [1, 2],
    })

    const { result, rerender } = renderHook(
      ({ page }) => useDeckCards('deck-1', '', page),
      { initialProps: { page: pageOne }, wrapper }
    )

    expect(result.current.cards).toHaveLength(2)
    expect(result.current.cards[0]?.term).toBe('First')
    expect(result.current.cards[1]?.term).toBe('Second')

    const updatedPageOne: DeckCardsPage = {
      ...pageOne,
      data: [{ ...pageOne.data[0], term: 'First Updated' }],
    }

    rerender({ page: updatedPageOne })

    await waitFor(() => {
      expect(result.current.cards[0]?.term).toBe('First Updated')
    })
    expect(result.current.cards).toHaveLength(2)
    expect(result.current.cards[1]?.term).toBe('Second')
  })
})
