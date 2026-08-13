export const CALENDAR_VIEWS = ['day', 'week', 'month', 'year', 'agenda'] as const
export type TCalendarView = (typeof CALENDAR_VIEWS)[number]
