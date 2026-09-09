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
})
