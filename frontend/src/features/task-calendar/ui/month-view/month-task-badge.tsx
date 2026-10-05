import { format, isSameDay, parseISO } from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { getTaskColor } from '../../lib/mappers'
import { type TBadgeVariant } from '../../model/calendar-types'
import { type TBadgeColor } from '../../model/types'
import { TaskDot } from '../task-dot'
import { eventBadgeVariants } from '../variants'

interface MonthTaskBadgeProps {
  task: Task
  cellDate: Date
  className?: string
  badgeVariant?: TBadgeVariant
  onTaskClick?: (taskId: string) => void
}

export function MonthTaskBadge({
  task,
  cellDate,
  className,
  badgeVariant = 'mixed',
  onTaskClick,
}: MonthTaskBadgeProps) {
  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null
  const date = parseISO(anchor)
  if (!isSameDay(cellDate, date)) return null

  const baseColor = getTaskColor(task)
  const color: TBadgeColor =
    badgeVariant === 'dot' ? `${baseColor}-dot` : baseColor

  return (
    <button
      type='button'
      className={eventBadgeVariants({ color, className })}
      onClick={() => onTaskClick?.(task.id)}
    >
      <div className='flex items-center gap-1.5 truncate'>
        {badgeVariant !== 'solid' && <TaskDot />}
        <p className='flex-1 truncate font-semibold'>{task.title}</p>
      </div>
      <span>{format(date, 'h:mm a')}</span>
    </button>
  )
}
