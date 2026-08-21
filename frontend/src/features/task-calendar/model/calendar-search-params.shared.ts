import { parseAsIsoDate, parseAsStringEnum } from 'nuqs/server'
import { CALENDAR_VIEWS } from './calendar-types'

export const calendarParsers = {
  view: parseAsStringEnum(CALENDAR_VIEWS.slice()).withDefault('month'),
  date: parseAsIsoDate,
}
