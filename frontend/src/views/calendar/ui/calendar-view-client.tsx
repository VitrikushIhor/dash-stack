'use client'

import { useMemo } from 'react'
import { toast } from 'sonner'
import { useAction } from '@/shared/lib'
import { type Task } from '@/entities/task'
import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'
import { updateTaskAction } from '@/features/manage-task/server'
import {
  CalendarAgendaView,
  CalendarDayView,
  CalendarHeader,
  CalendarMonthView,
  CalendarWeekView,
  CalendarYearView,
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

  const { execute } = useAction(updateTaskAction, {
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('[Calendar DnD Error]', error)
      toast.error('Failed to update task date.')
    },
  })

  const handleTaskUpdate = async (id: string, data: Partial<Task>) => {
    const result = await execute({ slug, id, data })
    if (result === undefined) {
      throw new Error('Failed to update task date')
    }
  }

  const renderViewContent = (optimisticTasks: Task[]) => {
    const handleTaskClick = (id: string) => setTaskParams({ 'update-task': id })

    switch (view) {
      case 'month':
        return (
          <CalendarMonthView
            singleDayTasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={handleTaskClick}
          />
        )
      case 'week':
        return (
          <CalendarWeekView
            singleDayTasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={handleTaskClick}
          />
        )
      case 'day':
        return (
          <CalendarDayView
            singleDayTasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={handleTaskClick}
          />
        )
      case 'year':
        return (
          <CalendarYearView
            tasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={handleTaskClick}
          />
        )
      case 'agenda':
        return (
          <CalendarAgendaView
            tasks={optimisticTasks}
            selectedDate={selectedDate}
            onTaskClick={handleTaskClick}
          />
        )
    }
  }

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
          {renderViewContent(optimisticTasks)}
        </div>
      )}
    </DndProviderWrapper>
  )
}
