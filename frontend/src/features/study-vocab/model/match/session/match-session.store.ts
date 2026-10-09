import { getErrorMessage } from '@/shared/api'
import { createControllerStore } from '../../shared/controller-store'
import { createSessionLifecycle } from '../../shared/session-lifecycle'
import {
  type MatchSessionScope,
  MatchSessionStatus,
  type MatchSessionStore,
} from './match-session.contract'

export function createMatchSessionStore(scope: MatchSessionScope) {
  const { userId } = scope
  const lifecycle = createSessionLifecycle()
  let revision = 0
  let creationStarted = false
  let completionStarted = false
  const initialStatus = getInitialStatus(userId)

  return createControllerStore<MatchSessionStore>((set, get) => ({
    scope,
    status: initialStatus,
    session: null,
    completion: null,
    error: null,
    restartVersion: 0,
    activate: lifecycle.activate,
    deactivate: lifecycle.deactivate,
    isCurrent: (requestRevision) =>
      lifecycle.current() !== null && revision === requestRevision,
    beginCreation: () => {
      if (!userId || lifecycle.current() === null || creationStarted)
        return null
      creationStarted = true
      set({ status: MatchSessionStatus.LOADING, error: null })

      return revision
    },
    beginCompletion: () => {
      if (!get().session || lifecycle.current() === null || completionStarted)
        return null
      completionStarted = true
      set({ status: MatchSessionStatus.COMPLETING, error: null })

      return revision
    },
    receiveSession: (session, requestRevision) => {
      if (get().isCurrent(requestRevision))
        set({ session, status: MatchSessionStatus.PLAYING })
    },
    receiveCompletion: (completion, requestRevision) => {
      if (get().isCurrent(requestRevision))
        set({ completion, status: MatchSessionStatus.COMPLETE })
    },
    fail: (error, requestRevision) => {
      if (!get().isCurrent(requestRevision)) return
      if (get().session) completionStarted = false
      else creationStarted = false
      set({ error: getErrorMessage(error), status: MatchSessionStatus.ERROR })
    },
    restart: () => {
      revision += 1
      creationStarted = false
      completionStarted = false
      set({
        session: null,
        completion: null,
        error: null,
        status: initialStatus,
        restartVersion: get().restartVersion + 1,
      })
    },
  }))
}

function getInitialStatus(
  userId: string | null | undefined
): MatchSessionStatus {
  if (userId === undefined) return MatchSessionStatus.AUTH_LOADING
  if (userId === null) return MatchSessionStatus.GUEST

  return MatchSessionStatus.LOADING
}
