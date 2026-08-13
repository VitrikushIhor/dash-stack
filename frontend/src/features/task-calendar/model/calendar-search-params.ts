import { parseAsStringEnum, parseAsIsoDate, useQueryStates } from 'nuqs'
import { CALENDAR_VIEWS } from './calendar-types'

export const calendarParsers = {
  view: parseAsStringEnum(CALENDAR_VIEWS.slice()).withDefault('month'),
  date: parseAsIsoDate,
}

export function useCalendarSearchParams() {
  return useQueryStates(calendarParsers)
}
