import type { HTMLAttributes } from 'react'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { useCalendar } from '../../model/calendar-context'
import { DraggableTask } from '../dnd/draggable-task'
import { TaskDetailsDialog } from '../task-details-dialog'
import { calendarWeekEventCardVariants } from '../variants'

interface IProps
  extends
    HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof calendarWeekEventCardVariants>, 'color'> {
  task: Task
}

export function TaskBlock({ task, className }: IProps) {
  const { badgeVariant } = useCalendar()

  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) {
    throw new Error(`Task ${task.id} has no calendar anchor`)
  }
  const start = parseISO(anchor)
  const end = start
  const durationInMinutes = differenceInMinutes(end, start)
  const heightInPixels = Math.max(32, (durationInMinutes / 60) * 96 - 8)

  const color = (
    badgeVariant === 'dot' ? `${getTaskColor(task)}-dot` : getTaskColor(task)
  ) as VariantProps<typeof calendarWeekEventCardVariants>['color']

  const calendarWeekEventCardClasses = cn(
    calendarWeekEventCardVariants({ color, className }),
    durationInMinutes < 35 && 'py-0 justify-center'
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click()
    }
  }

  return (
    <DraggableTask task={task}>
      <TaskDetailsDialog task={task}>
        <div
          role='button'
          tabIndex={0}
          className={calendarWeekEventCardClasses}
          style={{ height: `${heightInPixels}px` }}
          onKeyDown={handleKeyDown}
        >
          <div className='flex items-center gap-1.5 truncate'>
            {['mixed', 'dot'].includes(badgeVariant) && (
              <svg
                width='8'
                height='8'
                viewBox='0 0 8 8'
                className='task-dot shrink-0'
              >
                <circle cx='4' cy='4' r='4' />
              </svg>
            )}

            <p className='truncate font-semibold'>{task.title}</p>
          </div>

          {durationInMinutes > 25 && (
            <p>
              {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
            </p>
          )}
        </div>
      </TaskDetailsDialog>
    </DraggableTask>
  )
}
