'use client'

import { type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { type TCalendarView } from '../model/calendar-types'
import { type CalendarViewProps } from '../model/calendar-view-props'

const calendarViews = {
  month: dynamic<CalendarViewProps>(() =>
    import('./month-view/calendar-month-view').then(
      (module) => module.CalendarMonthView
    )
  ),
  week: dynamic<CalendarViewProps>(() =>
    import('./week-and-day-view/calendar-week-view').then(
      (module) => module.CalendarWeekView
    )
  ),
  day: dynamic<CalendarViewProps>(() =>
    import('./week-and-day-view/calendar-day-view').then(
      (module) => module.CalendarDayView
    )
  ),
  year: dynamic<CalendarViewProps>(() =>
    import('./year-view/calendar-year-view').then(
      (module) => module.CalendarYearView
    )
  ),
  agenda: dynamic<CalendarViewProps>(() =>
    import('./agenda-view/calendar-agenda-view').then(
      (module) => module.CalendarAgendaView
    )
  ),
} satisfies Record<TCalendarView, ComponentType<CalendarViewProps>>

export function CalendarView({
  view,
  ...props
}: CalendarViewProps & { view: TCalendarView }) {
  const View = calendarViews[view]

  return <View {...props} />
}
