import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { getDeckQuery, getMyDecksQuery } from '@/entities/deck/server'
import DeckEditPage from './[id]/edit/page'
import MyDecksPage from './page'

vi.mock('server-only', () => ({}))
vi.mock('@/entities/deck/server', () => ({
  getDeckQuery: vi.fn(),
  getMyDecksQuery: vi.fn(),
}))
vi.mock('@/views/vocab', () => ({
  DeckEditorView: ({ initialDeck }: { initialDeck: { title: string } }) => (
    <div>Edit {initialDeck.title}</div>
  ),
  MyDecksView: ({ initialDecks }: { initialDecks: unknown[] }) => (
    <div>My decks: {initialDecks.length}</div>
  ),
}))

describe('owner vocabulary route composition', () => {
  beforeEach(() => {
    vi.mocked(getMyDecksQuery).mockResolvedValue({ ok: true, data: [] })
    const deck = {
      id: 'deck',
      ownerUserId: 'owner',
      title: 'Owner deck',
      language: 'en',
      tags: [],
      visibility: 'PRIVATE',
      status: 'DRAFT',
      type: 'USER_GENERATED',
      flashcards: [],
      createdAt: '',
      updatedAt: '',
    } satisfies Deck

    vi.mocked(getDeckQuery).mockResolvedValue({
      ok: true,
      data: deck,
    })
  })

  it('should_keep_the_my_decks_server_composition', async () => {
    render(await MyDecksPage())

    expect(getMyDecksQuery).toHaveBeenCalledOnce()
    expect(screen.getByText('My decks: 0')).toBeInTheDocument()
  })

  it('should_keep_the_deck_editor_server_composition', async () => {
    render(await DeckEditPage({ params: Promise.resolve({ id: 'deck' }) }))

    expect(getDeckQuery).toHaveBeenCalledWith('deck')
    expect(screen.getByText('Edit Owner deck')).toBeInTheDocument()
  })
})
