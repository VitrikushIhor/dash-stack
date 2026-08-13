import { endOfDay, format, isSameDay, parseISO, startOfDay } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { type TBadgeVariant } from '../../model/calendar-types'
import { DraggableTask } from '../dnd/draggable-task'
import { TaskDot } from '../task-dot'
import { eventBadgeVariants } from '../variants'

interface IProps extends Omit<
  VariantProps<typeof eventBadgeVariants>,
  'color' | 'multiDayPosition'
> {
  task: Task
  cellDate: Date
  eventCurrentDay?: number
  eventTotalDays?: number
  className?: string
  position?: 'first' | 'middle' | 'last' | 'none'
  badgeVariant?: TBadgeVariant
}

export function MonthTaskBadge({
  task,
  cellDate,
  eventCurrentDay,
  eventTotalDays,
  className,
  position: propPosition,
  badgeVariant = 'mixed',
}: IProps) {
  const [, setTaskParams] = useTaskSearchParams()

  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null

  const itemStart = startOfDay(parseISO(anchor))
  const itemEnd = endOfDay(parseISO(anchor))

  if (cellDate < itemStart || cellDate > itemEnd) return null

  const position = (() => {
    if (propPosition) return propPosition
    if (eventCurrentDay && eventTotalDays) return 'none'
    if (isSameDay(itemStart, itemEnd)) return 'none'
    if (isSameDay(cellDate, itemStart)) return 'first'
    if (isSameDay(cellDate, itemEnd)) return 'last'
    return 'middle'
  })()

  const renderBadgeText = ['first', 'none'].includes(position)

  const color = (
    badgeVariant === 'dot' ? `${getTaskColor(task)}-dot` : getTaskColor(task)
  ) as VariantProps<typeof eventBadgeVariants>['color']

  const eventBadgeClasses = cn(
    eventBadgeVariants({ color, multiDayPosition: position, className })
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
        className={eventBadgeClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className='flex items-center gap-1.5 truncate'>
          {!['middle', 'last'].includes(position) &&
            ['mixed', 'dot'].includes(badgeVariant) && <TaskDot />}

          {renderBadgeText && (
            <p className='flex-1 truncate font-semibold'>
              {eventCurrentDay && (
                <span className='text-xs'>
                  Day {eventCurrentDay} of {eventTotalDays} •{' '}
                </span>
              )}
              {task.title}
            </p>
          )}
        </div>

        {renderBadgeText && <span>{format(new Date(anchor), 'h:mm a')}</span>}
      </div>
    </DraggableTask>
  )
}
