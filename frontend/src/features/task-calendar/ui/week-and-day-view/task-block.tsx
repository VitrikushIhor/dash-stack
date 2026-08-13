import type { HTMLAttributes } from 'react'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { type TBadgeVariant } from '../../model/calendar-types'
import { DraggableTask } from '../dnd/draggable-task'
import { TaskDot } from '../task-dot'
import { calendarWeekEventCardVariants } from '../variants'

interface IProps
  extends
    HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof calendarWeekEventCardVariants>, 'color'> {
  task: Task
  badgeVariant?: TBadgeVariant
}

export function TaskBlock({ task, className, badgeVariant = 'mixed' }: IProps) {
  const [, setTaskParams] = useTaskSearchParams()

  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null
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

  const handleClick = () => {
    setTaskParams({ 'update-task': task.id })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <DraggableTask task={task}>
      <div
        role='button'
        tabIndex={0}
        className={calendarWeekEventCardClasses}
        style={{ height: `${heightInPixels}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className='flex items-center gap-1.5 truncate'>
          {['mixed', 'dot'].includes(badgeVariant) && <TaskDot />}

          <p className='truncate font-semibold'>{task.title}</p>
        </div>

        {durationInMinutes > 25 && (
          <p>
            {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
          </p>
        )}
      </div>
    </DraggableTask>
  )
}
