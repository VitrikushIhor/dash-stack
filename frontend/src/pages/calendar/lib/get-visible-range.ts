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
        deadlineFrom: formatISO(startOfMonth(date)),
        deadlineTo: formatISO(endOfMonth(date)),
      }
    case 'week':
      return {
        deadlineFrom: formatISO(startOfWeek(date)),
        deadlineTo: formatISO(endOfWeek(date)),
      }
    case 'day':
      return {
        deadlineFrom: formatISO(startOfDay(date)),
        deadlineTo: formatISO(endOfDay(date)),
      }
    case 'year':
      return {
        deadlineFrom: formatISO(startOfYear(date)),
        deadlineTo: formatISO(endOfYear(date)),
      }
    default:
      return {
        deadlineFrom: formatISO(startOfMonth(date)),
        deadlineTo: formatISO(endOfMonth(date)),
      }
  }
}
