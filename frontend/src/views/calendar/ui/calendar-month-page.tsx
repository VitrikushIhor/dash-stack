'use client'

import { type Task } from '@/entities/task'
import {
  CalendarHeader,
  CalendarMonthView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
  initialDate: Date
}

export function CalendarMonthPage({ tasks, initialDate }: Props) {
  return (
    <DndProviderWrapper>
      <div className='flex flex-col gap-4'>
        <CalendarHeader tasks={tasks} view='month' />
        <CalendarMonthView singleDayTasks={tasks} />
      </div>
    </DndProviderWrapper>
  )
}
