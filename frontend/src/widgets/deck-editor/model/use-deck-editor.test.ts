import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Deck, type DeckEditorSaveResponse } from '@/entities/deck'
import { saveDeckEditorAction } from '@/features/manage-deck/server'
import { useDeckEditor } from './use-deck-editor'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/features/manage-deck/server', () => ({
  saveDeckEditorAction: vi.fn(),
  publishDeckAction: vi.fn(),
  unpublishDeckAction: vi.fn(),
  archiveDeckAction: vi.fn(),
  restoreDeckAction: vi.fn(),
  deleteDeckAction: vi.fn(),
  createDeckAction: vi.fn(),
  forkDeckAction: vi.fn(),
  updateDeckAction: vi.fn(),
}))
const deck: Deck = {
  id: 'deck',
  ownerUserId: 'owner',
  title: 'Title',
  language: 'en',
  tags: [],
  visibility: 'PRIVATE',
  status: 'DRAFT',
  type: 'USER_GENERATED',
  createdAt: 'revision-1',
  updatedAt: 'revision-1',
  flashcards: [],
}

describe('useDeckEditor save', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('submits once per in-flight save and adopts server IDs for the next save', async () => {
    let resolveSave!: (
      result: Awaited<ReturnType<typeof saveDeckEditorAction>>
    ) => void
    vi.mocked(saveDeckEditorAction).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve
        })
    )
    const { result } = renderHook(() => useDeckEditor(deck))
    act(() => {
      result.current.handleSaveChanges()
      result.current.handleSaveChanges()
    })
    expect(saveDeckEditorAction).toHaveBeenCalledTimes(1)
    const saved: DeckEditorSaveResponse = {
      ...deck,
      updatedAt: 'revision-2',
      flashcards: [
        {
          id: 'server-card',
          deckId: 'deck',
          term: 'Term',
          definition: 'Definition',
          position: 0,
          createdAt: 'revision-2',
          updatedAt: 'revision-2',
        },
      ],
    }
    await act(async () => {
      resolveSave({ success: true, data: saved })
    })
    expect(result.current.flashcards.cards[0].id).toBe('server-card')
    expect(result.current.flashcards.deletedCardIds).toEqual([])
    vi.mocked(saveDeckEditorAction).mockResolvedValueOnce({
      success: true,
      data: saved,
    })
    await act(async () => result.current.handleSaveChanges())
    expect(saveDeckEditorAction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cards: [expect.objectContaining({ id: 'server-card' })],
        }),
      })
    )
  })

  it('keeps edits after a failed save and allows retry', async () => {
    vi.mocked(saveDeckEditorAction).mockResolvedValue({
      success: false,
      error: 'Unavailable',
    })
    const { result } = renderHook(() => useDeckEditor(deck))
    act(() => result.current.metadata.setTitle('Unsaved title'))
    await act(async () => result.current.handleSaveChanges())
    expect(result.current.metadata.title).toBe('Unsaved title')
    await act(async () => result.current.handleSaveChanges())
    expect(saveDeckEditorAction).toHaveBeenCalledTimes(2)
  })

  it('keeps editor cards when the save response is missing them', async () => {
    vi.mocked(saveDeckEditorAction).mockResolvedValueOnce({
      success: true,
      data: { ...deck, flashcards: undefined } as never,
    })
    const { result } = renderHook(() => useDeckEditor(deck))

    await act(async () => result.current.handleSaveChanges())

    expect(result.current.flashcards.cards).toHaveLength(2)
    expect(result.current.flashcards.cards[0].id).toBe('temp-init-1')
  })

  it('does not submit an empty title', async () => {
    const { result } = renderHook(() => useDeckEditor(deck))
    act(() => result.current.metadata.setTitle('   '))

    await act(async () => result.current.handleSaveChanges())

    expect(saveDeckEditorAction).not.toHaveBeenCalled()
  })
})
