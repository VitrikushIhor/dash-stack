import 'server-only'
import { createServerApiClient } from '@/shared/api/server'
import { persistAuthCookies } from '@/shared/api/session/persist-auth-cookies'
import {
  activeSessionsSchema,
  revokeSessionSchema,
} from '../model/schema/active-sessions.schema'

const sessionsHttpClient = createServerApiClient(persistAuthCookies)

export const sessionsServerApi = {
  sessions: async (page: number) =>
    activeSessionsSchema.parse(
      await sessionsHttpClient.get<unknown>('/auth/sessions', {
        params: { page },
      })
    ),
  revokeSession: async (id: string) =>
    revokeSessionSchema.parse(
      await sessionsHttpClient.delete<unknown>(
        `/auth/sessions/${encodeURIComponent(id)}`
      )
    ),
}
