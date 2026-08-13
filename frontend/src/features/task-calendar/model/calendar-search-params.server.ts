import { createSearchParamsCache, parseAsStringEnum, parseAsIsoDate } from 'nuqs/server'
import { CALENDAR_VIEWS, type TCalendarView } from './calendar-types'

export const calendarParsers = {
  view: parseAsStringEnum(CALENDAR_VIEWS.slice()).withDefault('month'),
  date: parseAsIsoDate,
}

export const calendarSearchParamsCache = createSearchParamsCache(calendarParsers)
