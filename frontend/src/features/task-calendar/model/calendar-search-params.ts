import { useQueryStates } from 'nuqs'
import { calendarParsers } from './calendar-search-params.shared'

export function useCalendarSearchParams() {
  return useQueryStates(calendarParsers)
}
