'use client'

import { useQueryStates } from 'nuqs'
import { vocabCatalogSearchParams } from './search-params'

export function useVocabSearchParams() {
  return useQueryStates(vocabCatalogSearchParams, { shallow: false })
}
