import { logger } from '@/shared/lib/logger'
import type { AuthSessionEventKind } from './session-event-kind'
import {
  type AuthSessionEvent,
  authSessionEventSchema,
} from './session-events.schema'

export const AUTH_SESSION_EVENT_KEY = 'dash-stack:auth-session-event'

export function parseAuthSessionEvent(
  value: string | null
): AuthSessionEvent | null {
  if (!value) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return null
  }
  const result = authSessionEventSchema.safeParse(parsed)
  return result.success ? result.data : null
}

export function readAuthSessionEvent(): string | null {
  try {
    return window.localStorage.getItem(AUTH_SESSION_EVENT_KEY)
  } catch {
    logger.warn('Auth session notification unavailable', { operation: 'read' })
    return null
  }
}

export function publishAuthSessionEvent(kind: AuthSessionEventKind): void {
  try {
    const event: AuthSessionEvent = { id: crypto.randomUUID(), kind }
    window.localStorage.setItem(AUTH_SESSION_EVENT_KEY, JSON.stringify(event))
  } catch {
    logger.warn('Auth session notification unavailable', {
      operation: 'publish',
    })
  }
}
