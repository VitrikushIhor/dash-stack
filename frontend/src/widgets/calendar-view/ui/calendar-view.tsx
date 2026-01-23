import {
  CalendarAgendaView,
  CalendarDayView,
  CalendarMonthView,
  CalendarWeekView,
  CalendarYearView,
  useCalendar,
  type Task,
} from '@/features/event-calendar'

interface CalendarViewProps {
  events: Task[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const { view, selectedUserId } = useCalendar()

  // Filter events by selected user
  const filteredEvents = events.filter((event) => {
    if (selectedUserId === 'all') return true
    return event.assignedMembers?.some((member) => member.id === selectedUserId)
  })

  // Tasks only have deadline, so all are single-day events
  const singleDayEvents = filteredEvents
  const multiDayEvents: Task[] = []

  return (
    <div className='bg-card rounded-xl border p-4 shadow-sm'>
      {view === 'day' && (
        <CalendarDayView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
        />
      )}
      {view === 'month' && (
        <CalendarMonthView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
        />
      )}
      {view === 'week' && (
        <CalendarWeekView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
        />
      )}
      {view === 'year' && <CalendarYearView allEvents={filteredEvents} />}
      {view === 'agenda' && (
        <CalendarAgendaView
          multiDayEvents={multiDayEvents}
          singleDayEvents={singleDayEvents}
        />
      )}
    </div>
  )
}
