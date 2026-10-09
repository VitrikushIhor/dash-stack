import { createSearchParamsCache } from 'nuqs/server'
import { studySearchParams } from './search-params'

export const studySearchParamsCache = createSearchParamsCache(studySearchParams)
