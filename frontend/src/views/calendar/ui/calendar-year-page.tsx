'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarYearView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
  initialDate: Date
}

export function CalendarYearPage({ tasks, initialDate }: Props) {
  return (
    <DndProviderWrapper>
      <div className='flex flex-col gap-4'>
        <CalendarHeader tasks={tasks} view='year' />
        <CalendarYearView allTasks={tasks} />
      </div>
    </DndProviderWrapper>
  )
}
