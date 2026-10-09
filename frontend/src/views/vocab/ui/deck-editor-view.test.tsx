import { describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { DeckEditorView } from './deck-editor-view'

vi.mock('@/entities/user/server', () => ({ requireAuthenticatedUser: vi.fn() }))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('Not found')
  },
}))

describe('DeckEditorView access', () => {
  it('rejects another account before rendering an owner-scoped draft', async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: 'other',
    } as Awaited<ReturnType<typeof requireAuthenticatedUser>>)
    await expect(
      DeckEditorView({
        initialDeck: { id: 'deck', ownerUserId: 'owner' } as Deck,
      })
    ).rejects.toThrow('Not found')
  })
})
