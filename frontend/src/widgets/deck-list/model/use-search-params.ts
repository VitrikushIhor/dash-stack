'use client'

import { useQueryStates } from 'nuqs'
import { myDecksSearchParams } from './search-params'

export function useMyDecksSearchParams() {
  return useQueryStates(myDecksSearchParams)
}
