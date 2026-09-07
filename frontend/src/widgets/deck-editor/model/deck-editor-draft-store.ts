import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'
import {
  type DraftStoreState,
  persistedSchema,
} from './deck-editor-draft.schema'

// Each editor owns its store; no shared singleton across decks or SSR requests.
export function createDeckEditorDraftStore(name: string) {
  let hydrationError: unknown
  const store = createStore<DraftStoreState>()(
    persist<DraftStoreState>(() => ({ draft: null }), {
      name,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ draft }) => ({ draft }),
      merge: (persisted, current) =>
        persisted === undefined ? current : persistedSchema.parse(persisted),
      migrate: () => {
        throw new Error('Unsupported editor draft version')
      },
      onRehydrateStorage: () => {
        hydrationError = undefined
        return (_state, error) => {
          hydrationError = error
        }
      },
    })
  )
  const clear = () => {
    try {
      store.setState({ draft: null })
    } finally {
      store.persist?.clearStorage()
    }
  }
  const read = () => {
    if (!store.persist) throw new Error('Browser storage is unavailable')
    // The configured JSON storage hydrates synchronously.
    void store.persist.rehydrate()
    if (!store.persist.hasHydrated()) {
      throw hydrationError ?? new Error('Draft hydration failed')
    }
    return store.getState().draft
  }
  const write = (draft: DraftStoreState['draft']) => store.setState({ draft })
  return { read, write, clear }
}
