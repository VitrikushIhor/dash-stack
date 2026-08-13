'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarAgendaView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
  initialDate: Date
}

export function CalendarAgendaPage({ tasks, initialDate }: Props) {
  return (
    <DndProviderWrapper>
      <div className='flex flex-col gap-4'>
        <CalendarHeader tasks={tasks} view='agenda' />
        <CalendarAgendaView singleDayTasks={tasks} />
      </div>
    </DndProviderWrapper>
  )
}
