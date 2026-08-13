import { useMemo } from 'react'
import { type Membership } from '@/shared/model'
import { type Task } from '@/entities/task'
import {
  CalendarProvider,
  DndProviderWrapper,
  memberToUser,
  useCalendar,
  useFilteredTasks,
  CalendarAgendaView,
  CalendarHeader,
  CalendarMonthView,
  CalendarDayView,
  CalendarWeekView,
  CalendarYearView,
  type TCalendarView,
} from '@/features/task-calendar'

interface CalendarViewProps {
  tasks: Task[]
  members: Membership[]
  initialView: TCalendarView
  initialDate: Date
}

function CalendarContent() {
  const { view } = useCalendar()
  const { filteredTasks, singleDayTasks } = useFilteredTasks()

  return (
    <>
      <div className='mb-6 flex flex-col gap-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
        <CalendarHeader tasks={filteredTasks} />
      </div>

      <div className='bg-card rounded-xl border p-4 shadow-sm'>
        {view === 'day' && <CalendarDayView singleDayTasks={singleDayTasks} />}
        {view === 'month' && (
          <CalendarMonthView singleDayTasks={singleDayTasks} />
        )}
        {view === 'week' && (
          <CalendarWeekView singleDayTasks={singleDayTasks} />
        )}
        {view === 'year' && <CalendarYearView allTasks={filteredTasks} />}
        {view === 'agenda' && (
          <CalendarAgendaView singleDayTasks={singleDayTasks} />
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
      tasks={tasks}
      view={initialView}
      selectedDate={initialDate}
    >
      <DndProviderWrapper>
        <CalendarContent />
      </DndProviderWrapper>
    </CalendarProvider>
  )
}
