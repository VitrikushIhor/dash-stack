import { useCallback, useEffect, useRef } from 'react'
import { type createDeckEditorDraftStore } from './deck-editor-draft-store'
import {
  type DeckEditorDraftState,
  type DraftSnapshot,
} from './deck-editor-draft.schema'

export type DraftErrorContext =
  'validate' | 'restore' | 'persist' | 'clear' | 'conflict'
type DraftSession = {
  key: string
  baseline: string
  revision: string
  awaitingRestore?: string
  blocked?: boolean
}

export function useDeckDraftSession({
  key,
  revision,
  snapshot,
  read,
  onRestore,
  onError,
}: {
  key: string
  revision: string
  snapshot: DraftSnapshot
  read: ReturnType<typeof createDeckEditorDraftStore>['read']
  onRestore: (state: DeckEditorDraftState) => void
  onError?: (error: unknown, context: DraftErrorContext) => void
}) {
  const session = useRef<DraftSession | null>(null)

  const report = useCallback(
    (error: unknown, context: DraftErrorContext) => {
      try {
        onError?.(error, context)
      } catch {
        // Diagnostics must never interrupt editing or a successful save.
      }
    },
    [onError]
  )

  useEffect(() => {
    if (snapshot.data === null) {
      report(snapshot.error, 'validate')
      return
    }
    if (session.current?.key !== key) {
      session.current = { key, baseline: snapshot.serialized, revision }
      try {
        const draft = read()
        if (draft) {
          if (draft.revision !== revision) {
            session.current.blocked = true
            report(new Error('Stale editor draft'), 'conflict')
            return
          }
          session.current.awaitingRestore = JSON.stringify(draft.state)
          onRestore(draft.state)
          return
        }
      } catch (error) {
        session.current.blocked = true
        report(error, 'restore')
        return
      }
    }
    const current = session.current
    if (current.blocked) return
    if (current.awaitingRestore !== undefined) {
      if (snapshot.serialized !== current.awaitingRestore) return
      current.awaitingRestore = undefined
    }
  }, [key, snapshot, revision, onRestore, report, read])

  const acknowledge = useCallback(
    (baseline: string, savedRevision: string) => {
      session.current = { key, baseline, revision: savedRevision }
    },
    [key]
  )

  return { sessionRef: session, acknowledge, report }
}
