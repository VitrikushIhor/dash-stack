'use client'

import { type Task } from '@/entities/task'
import { type TCalendarView } from '@/features/task-calendar'
import { CalendarView } from '@/widgets/calendar-view'
import { Main } from '@/widgets/layout'
import { type Membership } from '@/entities/organization'

interface CalendarPageProps {
  tasks: Task[]
  members: Membership[]
  initialView: TCalendarView
  initialDate: Date
}

export function CalendarPage({
  tasks,
  members,
  initialView,
  initialDate,
}: CalendarPageProps) {
  return (
    <Main>
      <CalendarView
        tasks={tasks}
        members={members}
        initialView={initialView}
        initialDate={initialDate}
      />
    </Main>
  )
}
