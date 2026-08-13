import { parseAsStringEnum, parseAsIsoDate, useQueryStates } from 'nuqs'
import { CALENDAR_VIEWS, type TCalendarView } from './calendar-types'

export const calendarParsers = {
  view: parseAsStringEnum<TCalendarView>([...CALENDAR_VIEWS] as unknown as TCalendarView[]).withDefault('month'),
  date: parseAsIsoDate,
}

export function useCalendarSearchParams() {
  return useQueryStates(calendarParsers)
}
