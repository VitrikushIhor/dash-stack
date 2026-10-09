import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDebounce } from '@/shared/lib'
import { createDeckEditorDraftStore } from './deck-editor-draft-store'
import {
  type DeckEditorDraftState,
  createDraftSnapshot,
} from './deck-editor-draft.schema'
import {
  type DraftErrorContext,
  useDeckDraftSession,
} from './use-deck-draft-session'

export type { DeckEditorDraftState } from './deck-editor-draft.schema'

export type { DraftErrorContext } from './use-deck-draft-session'

type UseDeckEditorDraftParams = {
  ownerId: string
  deckId: string
  revision: string
  state: DeckEditorDraftState
  onRestore: (state: DeckEditorDraftState) => void
  onError?: (error: unknown, context: DraftErrorContext) => void
}
const DRAFT_SAVE_DEBOUNCE_MS = 500

export function useDeckEditorDraft({
  ownerId,
  deckId,
  revision,
  state,
  onRestore,
  onError,
}: UseDeckEditorDraftParams) {
  const key = `vocab-deck-editor:v1:${ownerId}:${deckId}`
  const persistence = useMemo(() => createDeckEditorDraftStore(key), [key])
  const { read, write, clear } = persistence
  const snapshot = useMemo(() => createDraftSnapshot(state), [state])
  const { sessionRef, acknowledge, report } = useDeckDraftSession({
    key,
    revision,
    snapshot,
    read,
    onRestore,
    onError,
  })

  const debounced = useDebounce(snapshot, DRAFT_SAVE_DEBOUNCE_MS)
  const acknowledged = useRef<typeof snapshot | null>(null)

  useEffect(() => {
    const current = sessionRef.current

    if (
      !current ||
      current.key !== key ||
      current.blocked ||
      current.awaitingRestore !== undefined
    )
      return
    if (
      debounced !== snapshot ||
      snapshot === acknowledged.current ||
      !snapshot.data
    )
      return
    try {
      if (snapshot.serialized === current.baseline) clear()
      else write({ revision: current.revision, state: snapshot.data })
    } catch (error) {
      report(error, 'persist')
    }
  }, [key, debounced, snapshot, clear, write, report, sessionRef])

  const markSaved = useCallback(
    (saved: DeckEditorDraftState, savedRevision: string) => {
      acknowledged.current = snapshot
      const result = createDraftSnapshot(saved)

      if (!result.data) {
        report(result.error, 'validate')

        return
      }
      acknowledge(result.serialized, savedRevision)
      try {
        clear()
      } catch (error) {
        report(error, 'clear')
      }
    },
    [report, clear, snapshot, acknowledge]
  )

  return useMemo(() => ({ markSaved }), [markSaved])
}
