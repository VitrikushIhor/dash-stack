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

export function CalendarAgendaPage({ tasks }: Props) {
  return (
    <DndProviderWrapper tasks={tasks}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader tasks={optimisticTasks} view='agenda' />
          <CalendarAgendaView singleDayTasks={optimisticTasks} />
        </div>
      )}
    </DndProviderWrapper>
  )
}
