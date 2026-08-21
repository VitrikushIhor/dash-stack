import { createSearchParamsCache } from 'nuqs/server'
import { tasksTableSearchParams } from './search-params'

export const tasksSearchParamsCache = createSearchParamsCache(
  tasksTableSearchParams
)
