'use client'

import { useQueryStates } from 'nuqs'
import { parseAsBoolean } from 'nuqs/server'

const importSearchParams = {
  'import-cards': parseAsBoolean.withDefault(false),
}

export const useImportSearchParams = () => {
  return useQueryStates(importSearchParams)
}
