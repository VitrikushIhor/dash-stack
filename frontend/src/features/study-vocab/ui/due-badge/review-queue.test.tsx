import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userKeys } from '@/entities/user'
import { vocabApi, vocabKeys } from '@/entities/vocab'
import { GlobalDueCount, ReviewQueue } from './review-queue'

afterEach(() => vi.restoreAllMocks())

describe('ReviewQueue', () => {
  it('should_link_each_due_deck_to_filtered_study_including_shared_decks', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })
    client.setQueryData(userKeys.me(), {
      id: 'learner',
      email: 'learner@example.test',
    })
    client.setQueryData(vocabKeys.dueReviews(), {
      totalDue: 3,
      perDeck: [
        { deckId: 'shared-deck', deckTitle: 'Shared vocabulary', dueCount: 3 },
      ],
    })
    render(
      <QueryClientProvider client={client}>
        <GlobalDueCount />
        <ReviewQueue />
      </QueryClientProvider>
    )
    expect(screen.getByLabelText('3 cards due for review')).toHaveTextContent(
      '3'
    )
    expect(
      screen.getByRole('link', { name: /Shared vocabulary/ })
    ).toHaveAttribute(
      'href',
      '/vocab/decks/shared-deck/flashcards?onlyDue=true'
    )
  })

  it('should_hide_personalized_reviews_without_fetching_when_user_is_guest', () => {
    const getDue = vi.spyOn(vocabApi, 'getDueReviews')
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })
    client.setQueryData(userKeys.me(), null)
    render(
      <QueryClientProvider client={client}>
        <GlobalDueCount />
        <ReviewQueue />
      </QueryClientProvider>
    )
    expect(
      screen.queryByRole('region', { name: 'Due reviews' })
    ).not.toBeInTheDocument()
    expect(getDue).not.toHaveBeenCalled()
  })

  it('should_show_empty_state_when_nothing_is_due', () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })
    client.setQueryData(userKeys.me(), {
      id: 'learner',
      email: 'learner@example.test',
    })
    client.setQueryData(vocabKeys.dueReviews(), { totalDue: 0, perDeck: [] })
    render(
      <QueryClientProvider client={client}>
        <ReviewQueue />
      </QueryClientProvider>
    )
    expect(screen.getByText('No cards due right now.')).toBeInTheDocument()
  })
})
