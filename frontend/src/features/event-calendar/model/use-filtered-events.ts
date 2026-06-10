import { useMemo } from 'react'
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
    () => filteredEvents.filter((e) => !!e.deadline),
    [filteredEvents]
  )

  return {
    filteredEvents,
    singleDayEvents,
  }
}
