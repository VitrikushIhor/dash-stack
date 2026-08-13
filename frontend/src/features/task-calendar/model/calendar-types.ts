export const CALENDAR_VIEWS = ['day', 'week', 'month', 'year', 'agenda'] as const
export type TCalendarView = (typeof CALENDAR_VIEWS)[number]

export const BADGE_VARIANTS = ['mixed', 'dot', 'solid'] as const
export type TBadgeVariant = (typeof BADGE_VARIANTS)[number]

export type TSetCalendarParams = (params: {
  date?: Date | null
  view?: TCalendarView | null
}) => void
