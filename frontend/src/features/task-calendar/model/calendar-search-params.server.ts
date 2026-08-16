import { createSearchParamsCache } from 'nuqs/server'
import { calendarParsers } from './calendar-search-params.shared'

export const calendarSearchParamsCache =
  createSearchParamsCache(calendarParsers)
