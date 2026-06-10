import { useMemo } from 'react'
import { type Membership } from '@/shared/model/types/membership'
import { type Task } from '@/entities/task'
import {
  CalendarProvider,
  DndProviderWrapper,
  memberToUser,
  useCalendar,
  useFilteredEvents,
  CalendarAgendaView,
  CalendarHeader,
  CalendarMonthView,
  CalendarDayView,
  CalendarWeekView,
  CalendarYearView,
  type TCalendarView,
} from '@/features/event-calendar'

interface CalendarViewProps {
  tasks: Task[]
  members: Membership[]
  initialView: TCalendarView
  initialDate: Date
}

function CalendarContent() {
  const { view } = useCalendar()
  const { filteredEvents, singleDayEvents } = useFilteredEvents()

  return (
    <>
      <div className='mb-6 flex flex-col gap-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
        <CalendarHeader events={filteredEvents} />
      </div>

      <div className='bg-card rounded-xl border p-4 shadow-sm'>
        {view === 'day' && (
          <CalendarDayView singleDayEvents={singleDayEvents} />
        )}
        {view === 'month' && (
          <CalendarMonthView singleDayEvents={singleDayEvents} />
        )}
        {view === 'week' && (
          <CalendarWeekView singleDayEvents={singleDayEvents} />
        )}
        {view === 'year' && <CalendarYearView allEvents={filteredEvents} />}
        {view === 'agenda' && (
          <CalendarAgendaView singleDayEvents={singleDayEvents} />
        )}
      </div>
    </>
  )
}

export function CalendarView({
  tasks,
  members,
  initialView,
  initialDate,
}: CalendarViewProps) {
  const users = useMemo(() => members.map(memberToUser), [members])

  return (
    <CalendarProvider
      users={users}
      events={tasks}
      view={initialView}
      selectedDate={initialDate}
    >
      <DndProviderWrapper>
        <CalendarContent />
      </DndProviderWrapper>
    </CalendarProvider>
  )
}
