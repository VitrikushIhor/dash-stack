import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { type TBadgeVariant } from '../../model/calendar-types'
import { type TBadgeColor } from '../../model/types'
import { DraggableTask } from '../dnd/draggable-task'
import { TaskDot } from '../task-dot'
import { calendarWeekEventCardVariants } from '../variants'

interface TaskBlockProps extends Omit<
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
  const baseColor = getTaskColor(task)
  const color: TBadgeColor =
    badgeVariant === 'dot' ? `${baseColor}-dot` : baseColor

  const calendarWeekEventCardClasses = cn(
    calendarWeekEventCardVariants({ color, className }),
    'h-8 py-0 justify-center'
  )

  const handleClick = () => {
    onTaskClick?.(task.id)
  }

  return (
    <DraggableTask task={task}>
      <button
        type='button'
        className={calendarWeekEventCardClasses}
        onClick={handleClick}
      >
        <div className='flex items-center gap-1.5 truncate'>
          {(badgeVariant === 'mixed' || badgeVariant === 'dot') && <TaskDot />}

          <p className='truncate font-semibold'>{task.title}</p>
        </div>
      </button>
    </DraggableTask>
  )
}
