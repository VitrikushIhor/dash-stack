'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarMonthView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
}

export function CalendarMonthPage({ tasks }: Props) {
  return (
    <DndProviderWrapper tasks={tasks}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader tasks={optimisticTasks} view='month' />
          <CalendarMonthView singleDayTasks={optimisticTasks} />
        </div>
      )}
    </DndProviderWrapper>
  )
}
