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

export function CalendarYearPage({ tasks }: Props) {
  return (
    <DndProviderWrapper tasks={tasks}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader tasks={optimisticTasks} view='year' />
          <CalendarYearView allTasks={optimisticTasks} />
        </div>
      )}
    </DndProviderWrapper>
  )
}
