import { format, differenceInMinutes, parseISO } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { type TBadgeVariant } from '../../model/calendar-types'
import { type TBadgeColor } from '../../model/types'
import { DraggableTask } from '../dnd/draggable-task'
import { TaskDot } from '../task-dot'
import { calendarWeekEventCardVariants } from '../variants'

const MIN_FLEX_COLUMN_DURATION = 35
const MIN_TIME_LABEL_DURATION = 25

export interface TaskBlockProps extends Omit<
  VariantProps<typeof calendarWeekEventCardVariants>,
  'color'
> {
  task: Task
  badgeVariant?: TBadgeVariant
  className?: string
  onTaskClick?: (taskId: string) => void
}

export function TaskBlock({
  task,
  className,
  badgeVariant = 'mixed',
  onTaskClick,
}: TaskBlockProps) {
  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null
  const start = parseISO(anchor)
  const end = start
  const durationInMinutes = differenceInMinutes(end, start)
  const heightInPixels = Math.max(32, (durationInMinutes / 60) * 96 - 8)

  const baseColor = getTaskColor(task)
  const color: TBadgeColor =
    badgeVariant === 'dot' ? `${baseColor}-dot` : baseColor

  const calendarWeekEventCardClasses = cn(
    calendarWeekEventCardVariants({ color, className }),
    durationInMinutes < MIN_FLEX_COLUMN_DURATION && 'py-0 justify-center'
  )

  const handleClick = () => {
    onTaskClick?.(task.id)
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
          {(badgeVariant === 'mixed' || badgeVariant === 'dot') && <TaskDot />}

          <p className='truncate font-semibold'>{task.title}</p>
        </div>

        {durationInMinutes > MIN_TIME_LABEL_DURATION && (
          <p>
            {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
          </p>
        )}
      </div>
    </DraggableTask>
  )
}
