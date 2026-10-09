import {
  type DraftStoreState,
  deckEditorDraftStorageSchema,
  persistedSchema,
} from './deck-editor-draft.schema'

export function createDeckEditorDraftStore(name: string) {
  const clear = () => localStorage.removeItem(name)
  const read = () => {
    const raw = localStorage.getItem(name)
    if (raw === null) return null

    const stored: unknown = JSON.parse(raw)
    return deckEditorDraftStorageSchema.parse(stored).state.draft
  }
  const write = (draft: DraftStoreState['draft']) =>
    localStorage.setItem(
      name,
      JSON.stringify({ version: 1, state: persistedSchema.parse({ draft }) })
    )

  return { read, write, clear }
}
