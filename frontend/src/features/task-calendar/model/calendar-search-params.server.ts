import { createSearchParamsCache, parseAsStringEnum, parseAsIsoDate } from 'nuqs/server'
import { CALENDAR_VIEWS } from './calendar-types'

export const calendarParsers = {
  view: parseAsStringEnum(CALENDAR_VIEWS).withDefault('month'),
  date: parseAsIsoDate,
}

export const calendarSearchParamsCache = createSearchParamsCache(calendarParsers)
