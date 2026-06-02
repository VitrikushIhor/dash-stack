import { useMemo } from 'react'
import { useCalendar } from './calendar-context'

export function useFilteredEvents() {
  const { events, selectedUserId } = useCalendar()

  const filteredEvents = useMemo(() => {
    if (selectedUserId === 'all') return events
    return events.filter((e) => e.user.id === selectedUserId)
  }, [events, selectedUserId])

  const singleDayEvents = useMemo(
    () => filteredEvents.filter((e) => e.startDate === e.endDate),
    [filteredEvents]
  )

  const multiDayEvents = useMemo(
    () => filteredEvents.filter((e) => e.startDate !== e.endDate),
    [filteredEvents]
  )

  return {
    filteredEvents,
    singleDayEvents,
    multiDayEvents,
  }
}
