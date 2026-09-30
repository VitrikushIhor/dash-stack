'use client'

import { useQueryStates } from 'nuqs'
import { parseAsString } from 'nuqs/server'

export const sessionSearchParams = {
  'revoke-session': parseAsString,
}

export function useSessionSearchParams() {
  return useQueryStates(sessionSearchParams)
}
