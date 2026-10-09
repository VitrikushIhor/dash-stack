'use client'

import { useQueryStates } from 'nuqs'
import { parseAsBoolean, parseAsString } from 'nuqs/server'

export const deckSearchParams = {
  'delete-deck': parseAsString,
  'create-deck': parseAsBoolean.withDefault(false),
}

export function useDeckSearchParams() {
  return useQueryStates(deckSearchParams)
}
