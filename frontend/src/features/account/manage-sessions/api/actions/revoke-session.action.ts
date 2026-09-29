'use server'

import { cookies } from 'next/headers'
import { ApiError } from '@/shared/api'
import { SESSION_REFRESH_STATUS, refreshSession } from '@/shared/api/session'
import { createAction } from '@/shared/lib'
import {
  COOKIE_CONFIG,
  clearAuthCookies,
  setAuthCookies,
} from '@/shared/lib/session-cookies'
import { sessionIdSchema } from '../../model/schema/active-sessions.schema'
import { sessionsServerApi } from '../sessions-api.server'

export const revokeSessionAction = createAction(sessionIdSchema, async (id) => {
  const result = await revokeWithRecovery(id)
  if (result.revokedCurrentSession) await clearAuthCookies()
  return result
})

async function revokeWithRecovery(id: string) {
  try {
    return await sessionsServerApi.revokeSession(id)
  } catch (error: unknown) {
    if (!(error instanceof ApiError) || !error.isUnauthorized) throw error
    const store = await cookies()
    const credential = store.get(COOKIE_CONFIG.REFRESH_TOKEN.name)?.value
    if (!credential) throw error
    const outcome = await refreshSession(credential)
    if (outcome.status === SESSION_REFRESH_STATUS.INVALID_SESSION) throw error
    if (outcome.status !== SESSION_REFRESH_STATUS.SUCCESS) {
      throw new ApiError(
        503,
        'Session recovery is temporarily unavailable. Try again.'
      )
    }
    await setAuthCookies(outcome.tokens)
    return sessionsServerApi.revokeSession(id)
  }
}
