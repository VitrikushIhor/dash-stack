'use client'

import { useMemo } from 'react'
import { useAction } from '@/shared/lib'
import { type Task } from '@/entities/task'
import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'
import { updateTaskAction } from '@/features/manage-task/server'
import {
  CalendarHeader,
  CalendarView,
  DndProviderWrapper,
  type TCalendarView,
  useCalendarSearchParams,
} from '@/features/task-calendar'

interface CalendarViewClientProps {
  slug: string
  tasks: Task[]
  view: TCalendarView
}

export function CalendarViewClient({
  slug,
  tasks,
  view,
}: CalendarViewClientProps) {
  const [{ date }, setParams] = useCalendarSearchParams()
  const [, setTaskParams] = useTaskSearchParams()
  const selectedDate = useMemo(() => date || new Date(), [date])

  const { execute } = useAction(updateTaskAction)

  const handleTaskUpdate = async (
    id: string,
    data: Partial<Task>
  ): Promise<boolean> => {
    const result = await execute({ slug, id, data })

    return result !== undefined
  }

  const handleTaskClick = (id: string) => setTaskParams({ 'update-task': id })

  return (
    <DndProviderWrapper tasks={tasks} onTaskUpdate={handleTaskUpdate}>
      {(optimisticTasks) => (
        <div className='flex flex-col gap-4'>
          <CalendarHeader
            tasks={optimisticTasks}
            view={view}
            selectedDate={selectedDate}
            setParams={setParams}
          />
          <CalendarView
            view={view}
            tasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={handleTaskClick}
          />
        </div>
      )}
    </DndProviderWrapper>
  )
}
