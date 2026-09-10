import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { userKeys } from '@/entities/user'
import { type StudyCard, vocabApi } from '@/entities/vocab'
import { DeckBoard } from './deck-board'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/vocab/decks/deck-1',
  useRouter: () => ({ push: vi.fn() }),
}))

const deck: Deck = {
  id: 'deck-1',
  ownerUserId: 'owner-1',
  title: 'Enterprise English',
  description: 'Vocabulary for product teams',
  language: 'English',
  level: 'B2',
  tags: ['product', 'meetings'],
  visibility: 'PUBLIC',
  status: 'PUBLISHED',
  type: 'USER_GENERATED',
  cardCount: 3,
  createdAt: '2026-09-08T00:00:00.000Z',
  updatedAt: '2026-09-08T00:00:00.000Z',
}

function card(
  id: string,
  nextReviewAt: string | null,
  isStarred = false
): StudyCard {
  return {
    id,
    deckId: deck.id,
    term: `Term ${id}`,
    definition: `Definition ${id}`,
    example: null,
    imageUrl: null,
    position: Number(id),
    progress: {
      id: `progress-${id}`,
      status: 'LEARNING',
      box: 1,
      isStarred,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt,
    },
  }
}

describe('DeckBoard', () => {
  afterEach(() => vi.restoreAllMocks())
  it('should_select_due_cards_before_launching_flashcards', async () => {
    const client = new QueryClient()
    client.setQueryData(userKeys.me(), {
      id: 'owner-1',
      firstName: 'Owner',
      email: 'owner@example.test',
    })
    render(
      <QueryClientProvider client={client}>
        <NuqsTestingAdapter searchParams='?onlyDue=true'>
          <DeckBoard
            deck={deck}
            initialCardsPage={{
              data: [
                card('1', '2026-09-07T12:00:00.000Z'),
                card('2', '2026-09-09T12:00:00.000Z', true),
                card('3', null),
              ],
              meta: {
                total: 3,
                lastPage: 1,
                currentPage: 1,
                perPage: 50,
                prev: null,
                next: null,
              },
              summary: { total: 3, due: 1, starred: 1, dueAndStarred: 0 },
            }}
            isAuthenticated
            isOwner
          />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: deck.title })
    ).toBeInTheDocument()
    expect(screen.getByText('3 cards')).toBeInTheDocument()
    expect(screen.getAllByText('Term 1')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Edit deck' })).toBeInTheDocument()

    expect(screen.getByRole('checkbox', { name: /Due only/ })).toBeChecked()
    expect(screen.getByText('1 card selected')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Flashcards' })).toHaveAttribute(
      'href',
      '/vocab/decks/deck-1/flashcards?onlyDue=true'
    )
    expect(
      screen.getByRole('button', { name: 'Match requires 6 cards' })
    ).toBeDisabled()
  })

  it('should_ignore_personalized_url_filters_for_guest_launch_links', () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <NuqsTestingAdapter searchParams='?onlyDue=true&onlyStarred=true'>
          <DeckBoard
            deck={deck}
            initialCardsPage={{
              data: [card('1', null), card('2', null), card('3', null)],
              meta: {
                total: 3,
                lastPage: 1,
                currentPage: 1,
                perPage: 50,
                prev: null,
                next: null,
              },
              summary: { total: 3, due: 0, starred: 0, dueAndStarred: 0 },
            }}
            isAuthenticated={false}
            isOwner={false}
          />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )

    expect(screen.getByText('3 cards selected')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Flashcards' })).toHaveAttribute(
      'href',
      '/vocab/decks/deck-1/flashcards'
    )
  })

  it('should_load_the_next_page_before_advancing_preview', async () => {
    const client = new QueryClient()
    vi.spyOn(vocabApi, 'browseDeckCards').mockResolvedValue({
      data: [card('2', null)],
      meta: {
        total: 2,
        lastPage: 2,
        currentPage: 2,
        perPage: 50,
        prev: 1,
        next: null,
      },
      summary: { total: 2, due: 0, starred: 0, dueAndStarred: 0 },
    })
    render(
      <QueryClientProvider client={client}>
        <NuqsTestingAdapter>
          <DeckBoard
            deck={{ ...deck, cardCount: 2 }}
            initialCardsPage={{
              data: [card('1', null)],
              meta: {
                total: 2,
                lastPage: 2,
                currentPage: 1,
                perPage: 50,
                prev: null,
                next: 2,
              },
              summary: { total: 2, due: 0, starred: 0, dueAndStarred: 0 },
            }}
            isAuthenticated={false}
            isOwner={false}
          />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

    await waitFor(() => expect(screen.getAllByText('Term 2')).toHaveLength(2))
    expect(vocabApi.browseDeckCards).toHaveBeenCalledWith(
      deck.id,
      { search: '', page: 2, perPage: 50 },
      expect.any(AbortSignal)
    )
  })
})
