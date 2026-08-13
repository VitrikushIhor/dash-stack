'use client'

import { type Task } from '@/entities/task'
import { updateTaskAction } from '@/features/manage-task/server'
import { useAction } from '@/shared/lib/hooks/use-action'
import { toast } from 'sonner'
import { useMemo } from 'react'
import {
  useCalendarSearchParams,
  CalendarHeader,
  CalendarWeekView,
  DndProviderWrapper,
} from '@/features/task-calendar'

interface Props {
  tasks: Task[]
}

export function CalendarWeekPage({ tasks }: Props) {
  const [{ date }, setParams] = useCalendarSearchParams()
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
          <CalendarHeader tasks={optimisticTasks} view='week' selectedDate={selectedDate} setParams={setParams} />
          <CalendarWeekView singleDayTasks={optimisticTasks} selectedDate={selectedDate} setParams={setParams} />
        </div>
      )}
    </DndProviderWrapper>
  )
}
