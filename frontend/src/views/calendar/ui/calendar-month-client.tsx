'use client'

import { useMemo } from 'react'
import { toast } from 'sonner'
import { useAction } from '@/shared/lib'
import { type Task } from '@/entities/task'
import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'
import { updateTaskAction } from '@/features/manage-task/server'
import {
  CalendarHeader,
  CalendarMonthView,
  DndProviderWrapper,
  useCalendarSearchParams,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
}

export function CalendarMonthClient({ tasks }: Props) {
  const [{ date }, setParams] = useCalendarSearchParams()
  const [, setTaskParams] = useTaskSearchParams()
  const selectedDate = useMemo(() => date || new Date(), [date])

  const { execute } = useAction(updateTaskAction, {
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('[Calendar DnD Error]', error)
      toast.error('Failed to update task date.')
    },
  })

  const handleTaskUpdate = (id: string, data: Partial<Task>) => {
    execute({ id, data })
  }

  return (
    <DndProviderWrapper tasks={tasks} onTaskUpdate={handleTaskUpdate}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader
            tasks={optimisticTasks}
            view='month'
            selectedDate={selectedDate}
            setParams={setParams}
          />
          <CalendarMonthView
            singleDayTasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={(id: string) => setTaskParams({ 'update-task': id })}
          />
        </div>
      )}
    </DndProviderWrapper>
  )
}
