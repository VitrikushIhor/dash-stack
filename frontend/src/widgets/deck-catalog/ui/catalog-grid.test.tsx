import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { CatalogGrid } from './catalog-grid'

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
})
