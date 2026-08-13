import { parseAsStringEnum, parseAsIsoDate } from 'nuqs'
import { CALENDAR_VIEWS } from './calendar-types'

export const calendarParsers = {
  view: parseAsStringEnum(CALENDAR_VIEWS).withDefault('month'),
  date: parseAsIsoDate,
}
