'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarDayView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
  initialDate: Date
}

export function CalendarDayPage({ tasks, initialDate }: Props) {
  return (
    <DndProviderWrapper>
      <div className='flex flex-col gap-4'>
        <CalendarHeader tasks={tasks} view='day' />
        <CalendarDayView singleDayTasks={tasks} />
      </div>
    </DndProviderWrapper>
  )
}
