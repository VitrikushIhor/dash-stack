import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type StudyCard } from '@/entities/vocab'
import { DeckCardList } from './deck-card-list'

const { useVirtualizerMock } = vi.hoisted(() => ({
  useVirtualizerMock: vi.fn(),
}))

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: useVirtualizerMock,
}))

function createCard(index: number): StudyCard {
  return {
    id: `card-${index}`,
    deckId: 'deck-1',
    term: `Term ${index}`,
    definition: `Definition ${index}`,
    example: null,
    imageUrl: null,
    position: index,
    progress: {
      id: null,
      status: 'NEW',
      box: 1,
      isStarred: false,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    },
  }
}

describe('DeckCardList', () => {
  it('should_show_an_empty_deck_message_when_there_are_no_cards_or_search', () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 0,
      getVirtualItems: () => [],
      measureElement: vi.fn(),
    })

    render(
      <DeckCardList
        totalCardCount={0}
        cards={[]}
        filteredTotalCardCount={0}
        hasNextPage={false}
        isAuthenticated={false}
        isFetchingNextPage={false}
        isNextPageError={false}
        isSearchError={false}
        isSearchPending={false}
        onLoadMore={vi.fn()}
        onRetryNextPage={vi.fn()}
        onRetrySearch={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search=''
      />
    )

    expect(
      screen.getByRole('heading', { name: 'This deck has no cards yet.' })
    ).toBeInTheDocument()
    expect(
      screen.queryByText('No cards match this search.')
    ).not.toBeInTheDocument()
  })

  it('should_show_card_skeletons_while_searching', () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 0,
      getVirtualItems: () => [],
      measureElement: vi.fn(),
    })

    render(
      <DeckCardList
        totalCardCount={3}
        cards={[]}
        filteredTotalCardCount={0}
        hasNextPage={false}
        isAuthenticated={false}
        isFetchingNextPage={false}
        isNextPageError={false}
        isSearchError={false}
        isSearchPending
        onLoadMore={vi.fn()}
        onRetryNextPage={vi.fn()}
        onRetrySearch={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search='term'
      />
    )

    const status = screen.getByRole('status', { name: 'Searching cards' })

    expect(status.children).toHaveLength(3)
  })

  it('should_virtualize_lists_with_more_than_fifty_cards', () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 1000,
      getVirtualItems: () => [
        { index: 0, key: 'card-0', start: 0 },
        { index: 1, key: 'card-1', start: 100 },
      ],
      measureElement: vi.fn(),
    })
    const cards = Array.from({ length: 51 }, (_, index) => createCard(index))

    render(
      <DeckCardList
        totalCardCount={cards.length}
        cards={cards}
        filteredTotalCardCount={cards.length}
        hasNextPage={false}
        isAuthenticated={false}
        isFetchingNextPage={false}
        isNextPageError={false}
        isSearchError={false}
        isSearchPending={false}
        onLoadMore={vi.fn()}
        onRetryNextPage={vi.fn()}
        onRetrySearch={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search=''
      />
    )

    expect(useVirtualizerMock).toHaveBeenCalledWith(
      expect.objectContaining({ count: 51, enabled: true })
    )
    expect(screen.getByText('Term 0')).toBeInTheDocument()
    expect(screen.queryByText('Term 50')).not.toBeInTheDocument()
  })

  it('should_show_search_error_with_retry_action', async () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 0,
      getVirtualItems: () => [],
      measureElement: vi.fn(),
    })
    const retry = vi.fn()

    render(
      <DeckCardList
        totalCardCount={0}
        cards={[]}
        filteredTotalCardCount={0}
        hasNextPage={false}
        isAuthenticated={false}
        isFetchingNextPage={false}
        isNextPageError={false}
        isSearchError
        isSearchPending={false}
        onLoadMore={vi.fn()}
        onRetryNextPage={vi.fn()}
        onRetrySearch={retry}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search='broken'
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load cards.')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('should_keep_loaded_cards_visible_when_next_page_fails', async () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 1000,
      getVirtualItems: () => [{ index: 0, key: 'card-0', start: 0 }],
      measureElement: vi.fn(),
    })
    const retry = vi.fn()

    render(
      <DeckCardList
        totalCardCount={51}
        cards={[createCard(0)]}
        filteredTotalCardCount={51}
        hasNextPage
        isAuthenticated={false}
        isFetchingNextPage={false}
        isNextPageError
        isSearchError={false}
        isSearchPending={false}
        onLoadMore={vi.fn()}
        onRetryNextPage={retry}
        onRetrySearch={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search=''
      />
    )

    expect(screen.getByText('Term 0')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not load more cards'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('should_show_a_card_skeleton_while_loading_the_next_page', () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 1000,
      getVirtualItems: () => [{ index: 0, key: 'card-0', start: 0 }],
      measureElement: vi.fn(),
    })

    render(
      <DeckCardList
        totalCardCount={51}
        cards={[createCard(0)]}
        filteredTotalCardCount={51}
        hasNextPage
        isAuthenticated={false}
        isFetchingNextPage
        isNextPageError={false}
        isSearchError={false}
        isSearchPending={false}
        onLoadMore={vi.fn()}
        onRetryNextPage={vi.fn()}
        onRetrySearch={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search=''
      />
    )

    const status = screen.getByRole('status', {
      name: 'Loading more cards',
    })

    expect(status.children).toHaveLength(1)
    expect(screen.queryByText('Loading more cards…')).not.toBeInTheDocument()
  })

  it('should_disable_a_pending_star_in_a_non_virtualized_list', () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 0,
      getVirtualItems: () => [],
      measureElement: vi.fn(),
    })
    const card = createCard(0)

    render(
      <DeckCardList
        pendingStars={new Set([card.id])}
        totalCardCount={1}
        cards={[card]}
        filteredTotalCardCount={1}
        hasNextPage={false}
        isAuthenticated
        isFetchingNextPage={false}
        isNextPageError={false}
        isSearchError={false}
        isSearchPending={false}
        onLoadMore={vi.fn()}
        onRetryNextPage={vi.fn()}
        onRetrySearch={vi.fn()}
        onSearchChange={vi.fn()}
        onToggleStar={vi.fn()}
        search=''
      />
    )

    expect(screen.getByRole('button', { name: 'Star card' })).toBeDisabled()
    expect(screen.getByLabelText('Saving star')).toBeInTheDocument()
  })
})
