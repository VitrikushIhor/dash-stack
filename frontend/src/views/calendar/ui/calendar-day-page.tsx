'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarDayView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
}

export function CalendarDayPage({ tasks }: Props) {
  return (
    <DndProviderWrapper tasks={tasks}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader tasks={optimisticTasks} view='day' />
          <CalendarDayView singleDayTasks={optimisticTasks} />
        </div>
      )}
    </DndProviderWrapper>
  )
}
