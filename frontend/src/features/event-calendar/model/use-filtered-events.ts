import { useMemo } from 'react'
import { getTaskCalendarAnchor } from '@/entities/task'
import { useCalendar } from './calendar-context'

export function useFilteredEvents() {
  const { events, selectedUserId } = useCalendar()

  const filteredEvents = useMemo(() => {
    if (selectedUserId === 'all') return events
    return events.filter((e) =>
      e.assignees.some((a) => a.userId === selectedUserId)
    )
  }, [events, selectedUserId])

  const singleDayEvents = useMemo(
    () => filteredEvents.filter((e) => !!getTaskCalendarAnchor(e)),
    [filteredEvents]
  )

  return {
    filteredEvents,
    singleDayEvents,
  }
}
