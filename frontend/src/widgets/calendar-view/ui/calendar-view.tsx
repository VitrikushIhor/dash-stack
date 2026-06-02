import type { Task, TaskAssignee } from '@/entities/task/model/types'
import {
  CalendarAgendaView,
  CalendarDayView,
  CalendarMonthView,
  CalendarWeekView,
  CalendarYearView,
  type IEvent,
  useCalendar,
} from '@/features/event-calendar'

interface CalendarViewProps {
  events: Task[]
}

export function CalendarView({ events }: CalendarViewProps) {
  const { view, selectedUserId } = useCalendar()

  // Filter events by selected user
  const filteredEvents = events.filter((event) => {
    if (selectedUserId === 'all') return true
    return event.assignees?.some(
      (member: TaskAssignee) => member.id === selectedUserId
    )
  })

  const mappedEvents: IEvent[] = filteredEvents.map((task, index) => {
    const user = task.assignees?.[0]
    return {
      id: task.id || String(index),
      startDate: task.deadline || new Date().toISOString(),
      endDate: task.deadline || new Date().toISOString(),
      title: task.title,
      color: 'blue',
      description: task.description || '',
      user: user
        ? {
            id: user.id,
            name: user.user?.firstName || 'User',
            avatar: user.user?.avatar || null,
          }
        : { id: 'unknown', name: 'Unassigned', avatar: null },
    }
  })

  // Tasks only have deadline, so all are single-day events
  const singleDayEvents = mappedEvents
  const multiDayEvents: IEvent[] = []

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
      {view === 'year' && <CalendarYearView allEvents={mappedEvents} />}
      {view === 'agenda' && (
        <CalendarAgendaView
          multiDayEvents={multiDayEvents}
          singleDayEvents={singleDayEvents}
        />
      )}
    </div>
  )
}
