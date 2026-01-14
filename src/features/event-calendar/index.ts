// Public API for event-calendar feature

// Provider and hooks
export { CalendarProvider, useCalendar } from './model/contexts/calendar-context'

// UI Components
export { CalendarHeader } from './ui/header/calendar-header'
export { CalendarMonthView } from './ui/month-view/calendar-month-view'
export { CalendarDayView } from './ui/week-and-day-view/calendar-day-view'
export { CalendarWeekView } from './ui/week-and-day-view/calendar-week-view'
export { CalendarYearView } from './ui/year-view/calendar-year-view'
export { CalendarAgendaView } from './ui/agenda-view/calendar-agenda-view'
export { DndProviderWrapper } from './ui/dnd/dnd-provider'

// Types
export type { TCalendarView, TEventColor, TBadgeVariant } from './model/types'
export type { Task, TeamMember, ICalendarCell } from './model/interfaces'

// Helpers (if needed externally)
export { parseDeadline, rangeText, navigateDate, getEventsCount } from './model/helpers'

