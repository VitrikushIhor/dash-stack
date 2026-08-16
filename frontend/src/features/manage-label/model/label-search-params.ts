'use client'

import { useQueryStates } from 'nuqs'
import { parseAsBoolean, parseAsString } from 'nuqs/server'

export const labelSearchParams = {
  'create-label': parseAsBoolean.withDefault(false),
  'update-label': parseAsString,
  'delete-label': parseAsString,
}

export function useLabelSearchParams() {
  return useQueryStates(labelSearchParams)
}
