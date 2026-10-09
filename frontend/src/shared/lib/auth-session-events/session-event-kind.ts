export const AUTH_SESSION_EVENT_KIND = {
  SIGNED_IN: 'signed-in',
  SIGNED_OUT: 'signed-out',
} as const

export type AuthSessionEventKind =
  (typeof AUTH_SESSION_EVENT_KIND)[keyof typeof AUTH_SESSION_EVENT_KIND]
