import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { DeckBoardHeader } from './deck-board-header'

const deck: Deck = {
  id: 'deck-1',
  ownerUserId: 'owner-1',
  title: 'Enterprise English',
  description: null,
  language: 'English',
  level: null,
  tags: [],
  visibility: 'PUBLIC',
  status: 'PUBLISHED',
  type: 'USER_GENERATED',
  cardCount: 3,
  forkCount: 2,
  creator: { displayName: 'Ada Lovelace', avatarUrl: null },
  createdAt: '2026-09-08T00:00:00.000Z',
  updatedAt: '2026-09-08T00:00:00.000Z',
}

describe('DeckBoardHeader', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should_copy_the_canonical_deck_url_without_personal_filters', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    window.history.replaceState(
      null,
      '',
      '/vocab/decks/deck-1?onlyDue=true&onlyStarred=true'
    )

    render(
      <DeckBoardHeader
        deck={deck}
        cardCount={3}
        isAuthenticated={false}
        isOwner={false}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Copy deck link' })
    )

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/vocab/decks/deck-1`
    )
  })

  it('offers_a_sign_in_path_to_fork_for_a_guest', () => {
    render(
      <DeckBoardHeader
        deck={deck}
        cardCount={3}
        isAuthenticated={false}
        isOwner={false}
      />
    )

    expect(
      screen.getByRole('link', { name: 'Sign in to fork' })
    ).toHaveAttribute('href', '/sign-in')
    expect(screen.getByText('Ada Lovelace')).toBeVisible()
    expect(screen.getByText('2 forks')).toBeVisible()
  })
})
