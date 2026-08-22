import { createSearchParamsCache } from 'nuqs/server'
import { vocabCatalogSearchParams } from './search-params'

export const vocabCatalogSearchParamsCache = createSearchParamsCache(
  vocabCatalogSearchParams
)
