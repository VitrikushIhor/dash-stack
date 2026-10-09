import type { z } from 'zod'
import type {
  activeSessionSchema,
  activeSessionsSchema,
} from '../schema/active-sessions.schema'

export type ActiveSession = z.infer<typeof activeSessionSchema>
export type ActiveSessions = z.infer<typeof activeSessionsSchema>
