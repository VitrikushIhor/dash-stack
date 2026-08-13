'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarWeekView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
  initialDate: Date
}

export function CalendarWeekPage({ tasks, initialDate }: Props) {
  return (
    <DndProviderWrapper tasks={tasks}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader tasks={optimisticTasks} view='week' />
          <CalendarWeekView singleDayTasks={optimisticTasks} />
        </div>
      )}
    </DndProviderWrapper>
  )
}
