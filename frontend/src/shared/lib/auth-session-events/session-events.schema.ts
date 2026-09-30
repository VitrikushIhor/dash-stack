import { z } from 'zod'
import { AUTH_SESSION_EVENT_KIND } from './session-event-kind'

export const authSessionEventSchema = z.object({
  id: z.uuid(),
  kind: z.enum([
    AUTH_SESSION_EVENT_KIND.SIGNED_IN,
    AUTH_SESSION_EVENT_KIND.SIGNED_OUT,
  ]),
})

export type AuthSessionEvent = z.infer<typeof authSessionEventSchema>
