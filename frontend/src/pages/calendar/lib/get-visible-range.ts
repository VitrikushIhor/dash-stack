import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  formatISO,
} from 'date-fns'
import { type TCalendarView } from '@/features/event-calendar'

export const getVisibleRange = (view: TCalendarView, date: Date) => {
  switch (view) {
    case 'month':
    case 'agenda':
      return {
        dueDateFrom: formatISO(startOfMonth(date)),
        dueDateTo: formatISO(endOfMonth(date)),
      }
    case 'week':
      return {
        dueDateFrom: formatISO(startOfWeek(date)),
        dueDateTo: formatISO(endOfWeek(date)),
      }
    case 'day':
      return {
        dueDateFrom: formatISO(startOfDay(date)),
        dueDateTo: formatISO(endOfDay(date)),
      }
    case 'year':
      return {
        dueDateFrom: formatISO(startOfYear(date)),
        dueDateTo: formatISO(endOfYear(date)),
      }
    default:
      return {
        dueDateFrom: formatISO(startOfMonth(date)),
        dueDateTo: formatISO(endOfMonth(date)),
      }
  }
}
