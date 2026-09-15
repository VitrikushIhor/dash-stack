import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { CatalogGrid } from './catalog-grid'

vi.mock('@/features/manage-deck', () => ({
  ForkDeckButton: ({ deckId }: { deckId: string }) => (
    <button>Fork {deckId}</button>
  ),
}))

const deck: Deck = {
  id: 'deck-1',
  ownerUserId: 'owner-1',
  title: 'Enterprise English',
  description: 'Vocabulary for product teams',
  language: 'en',
  level: 'B2',
  tags: ['product'],
  visibility: 'PUBLIC',
  status: 'PUBLISHED',
  type: 'USER_GENERATED',
  cardCount: 12,
  forkCount: 3,
  creator: { displayName: 'Ada Lovelace', avatarUrl: null },
  createdAt: '2026-09-08T00:00:00.000Z',
  updatedAt: '2026-09-08T00:00:00.000Z',
}

describe('CatalogGrid', () => {
  it('should_open_the_deck_board_before_starting_a_study_session', () => {
    render(<CatalogGrid decks={[deck]} onResetFilters={vi.fn()} />)

    expect(screen.getByRole('link', { name: deck.title })).toHaveAttribute(
      'href',
      '/vocab/decks/deck-1'
    )
    expect(screen.getByRole('link', { name: 'Open deck' })).toHaveAttribute(
      'href',
      '/vocab/decks/deck-1'
    )
  })

  it('offers_fork_to_authenticated_users_and_sign_in_to_guests', () => {
    const { rerender } = render(
      <CatalogGrid decks={[deck]} isAuthenticated onResetFilters={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Fork deck-1' })).toBeVisible()

    rerender(
      <CatalogGrid
        decks={[deck]}
        isAuthenticated={false}
        onResetFilters={vi.fn()}
      />
    )
    expect(
      screen.getByRole('link', { name: 'Sign in to fork' })
    ).toHaveAttribute('href', '/sign-in')
  })

  it('shows_real_creator_and_fork_count_with_avatar_fallback', () => {
    render(<CatalogGrid decks={[deck]} onResetFilters={vi.fn()} />)

    expect(screen.getByText('Ada Lovelace')).toBeVisible()
    expect(screen.getByText('3 forks')).toBeVisible()
    expect(screen.getByText('AL')).toBeVisible()
  })
})
