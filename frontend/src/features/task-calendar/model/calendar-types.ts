export const CALENDAR_VIEWS = ['day', 'week', 'month', 'year', 'agenda'] as const
export type TCalendarView = (typeof CALENDAR_VIEWS)[number]

export type TSetCalendarParams = (params: {
  date?: Date | null
  view?: TCalendarView | null
}) => void
