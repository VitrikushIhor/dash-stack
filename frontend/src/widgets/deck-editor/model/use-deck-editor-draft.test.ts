import { StrictMode, createElement, useState } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type DeckEditorDraftState,
  useDeckEditorDraft,
} from './use-deck-editor-draft'

const initial: DeckEditorDraftState = {
  metadata: {
    title: 'Original',
    description: '',
    level: 'B1',
    visibility: 'PRIVATE',
  },
  cards: [{ id: 'card-1', term: 'Term', definition: 'Definition' }],
  deletedCardIds: [],
}
const key = 'vocab-deck-editor:v1:owner:deck'
function useEditor() {
  const [state, setState] = useState(initial)
  const draft = useDeckEditorDraft({
    ownerId: 'owner',
    deckId: 'deck',
    revision: 'revision-1',
    state,
    onRestore: setState,
  })
  return { state, setState, ...draft }
}

describe('useDeckEditorDraft', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('restores edits and deletions without overwriting them with initial state', () => {
    const edited = { ...initial, cards: [], deletedCardIds: ['card-1'] }
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        state: { draft: { revision: 'revision-1', state: edited } },
      })
    )
    const { result } = renderHook(useEditor)
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.state).toEqual(edited)
    expect(JSON.parse(localStorage.getItem(key)!).state.draft.state).toEqual(
      edited
    )
  })

  it('stores only changed state after debounce and cancels pending writes on save', () => {
    const { result } = renderHook(useEditor)
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(localStorage.getItem(key)).toBeNull()
    const edited = {
      ...initial,
      metadata: { ...initial.metadata, title: 'Edited' },
    }
    act(() => result.current.setState(edited))
    expect(localStorage.getItem(key)).toBeNull()
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(
      JSON.parse(localStorage.getItem(key)!).state.draft.state.metadata.title
    ).toBe('Edited')
    act(() => {
      result.current.markSaved(edited, 'revision-2')
      result.current.setState(edited)
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(localStorage.getItem(key)).toBeNull()
  })

  it.each([
    'invalid json',
    JSON.stringify({
      version: 1,
      state: { draft: { revision: 'old', state: initial } },
    }),
    JSON.stringify({
      version: 1,
      revision: 'revision-1',
      state: { cards: 'invalid' },
    }),
  ])('does not restore an invalid or stale draft: %s', (raw) => {
    localStorage.setItem(key, raw)
    const { result } = renderHook(useEditor)
    expect(result.current.state).toEqual(initial)
  })

  it('keeps editing and save acknowledgement working when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Full')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Denied')
    })
    const { result } = renderHook(useEditor)
    act(() => result.current.setState({ ...initial, cards: [] }))
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(() => result.current.markSaved(initial, 'revision-2')).not.toThrow()
  })

  it('preserves stale drafts through StrictMode and subsequent edits', () => {
    const raw = JSON.stringify({ version: 1, revision: 'old', state: initial })
    localStorage.setItem(key, raw)
    const { result } = renderHook(useEditor, {
      wrapper: ({ children }) => createElement(StrictMode, null, children),
    })
    act(() => result.current.setState({ ...initial, cards: [] }))
    act(() => vi.advanceTimersByTime(1000))
    expect(localStorage.getItem(key)).toBe(raw)
  })

  it('reports invalid state and throwing diagnostics without crashing the editor', () => {
    const onError = vi.fn(() => {
      throw new Error('Diagnostics unavailable')
    })
    const invalid = {
      ...initial,
      metadata: { ...initial.metadata, level: 'invalid' },
    } as unknown as DeckEditorDraftState
    const { result } = renderHook(() =>
      useDeckEditorDraft({
        ownerId: 'owner',
        deckId: 'deck',
        revision: 'revision-1',
        state: invalid,
        onRestore: () => undefined,
        onError,
      })
    )
    expect(onError).toHaveBeenCalledWith(expect.anything(), 'validate')
    expect(() => result.current.markSaved(invalid, 'revision-2')).not.toThrow()
    act(() => vi.advanceTimersByTime(1000))
    expect(localStorage.getItem(key)).toBeNull()
  })

  it('keeps the save acknowledgement callback stable on unrelated renders', () => {
    const { result, rerender } = renderHook(useEditor)
    const markSaved = result.current.markSaved
    rerender()
    expect(result.current.markSaved).toBe(markSaved)
  })

  it('rehydrates persisted edits after remount and persists the acknowledged revision', () => {
    const first = renderHook(useEditor)
    const edited = {
      ...initial,
      metadata: { ...initial.metadata, title: 'Edited' },
    }
    act(() => first.result.current.setState(edited))
    act(() => vi.advanceTimersByTime(500))
    first.unmount()
    const second = renderHook(useEditor)
    expect(second.result.current.state).toEqual(edited)
    act(() => second.result.current.markSaved(edited, 'revision-2'))
    expect(localStorage.getItem(key)).toBeNull()
    act(() => second.result.current.setState({ ...edited, cards: [] }))
    act(() => vi.advanceTimersByTime(500))
    expect(JSON.parse(localStorage.getItem(key)!)).toMatchObject({
      version: 1,
      state: { draft: { revision: 'revision-2', state: { cards: [] } } },
    })
    second.unmount()
  })

  it('survives a denied localStorage getter', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('Storage access denied')
    })
    const { result } = renderHook(useEditor)
    expect(() => result.current.markSaved(initial, 'revision-2')).not.toThrow()
  })

  it('does not resurrect a draft when Save completes before useDebounce settles', () => {
    const { result } = renderHook(useEditor)
    const edited = {
      ...initial,
      metadata: { ...initial.metadata, title: 'Saved' },
    }
    act(() => result.current.setState(edited))
    act(() => result.current.markSaved(edited, 'revision-2'))
    act(() => vi.advanceTimersByTime(500))
    expect(localStorage.getItem(key)).toBeNull()
    act(() => result.current.setState({ ...edited, cards: [] }))
    act(() => vi.advanceTimersByTime(500))
    expect(JSON.parse(localStorage.getItem(key)!)).toMatchObject({
      state: { draft: { revision: 'revision-2', state: { cards: [] } } },
    })
  })
})
