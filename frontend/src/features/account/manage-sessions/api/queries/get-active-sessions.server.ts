import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { sessionsServerApi } from '../sessions-api.server'
import { GetActiveSessionsSchema } from './get-active-sessions.schema'

export const getActiveSessionsQuery = cache(
  createServerQuery(
    'getActiveSessionsQuery',
    GetActiveSessionsSchema,
    async ({ page }) => {
      const sessions = await sessionsServerApi.sessions(page)

      return { sessions, page }
    }
  )
)
