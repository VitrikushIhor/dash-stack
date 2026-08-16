import { format, parseISO } from 'date-fns'
import { Clock, Text, User } from 'lucide-react'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { getTaskColor, getTaskUser } from '@/features/task-calendar/lib/mappers'
import { type TBadgeVariant } from '../../model/calendar-types'
import { type TBadgeColor } from '../../model/types'
import { TaskDot } from '../task-dot'
import { agendaEventCardVariants } from '../variants'

interface IProps {
  task: Task
  eventCurrentDay?: number
  eventTotalDays?: number
  badgeVariant?: TBadgeVariant
  onTaskClick?: (taskId: string) => void
}

export function AgendaTaskCard({
  task,
  eventCurrentDay,
  eventTotalDays,
  badgeVariant = 'dot',
  onTaskClick,
}: IProps) {
  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null
  const startDate = parseISO(anchor)
  const endDate = startDate

  const baseColor = getTaskColor(task)
  const color: TBadgeColor =
    badgeVariant === 'dot' ? `${baseColor}-dot` : baseColor

  const agendaEventCardClasses = agendaEventCardVariants({ color })

  const handleClick = () => {
    onTaskClick?.(task.id)
  }

  return (
    <button
      type='button'
      className={agendaEventCardClasses}
      onClick={handleClick}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1.5'>
          {['mixed', 'dot'].includes(badgeVariant) && <TaskDot />}

          <p className='font-medium'>
            {eventCurrentDay && eventTotalDays && (
              <span className='mr-1 text-xs'>
                Day {eventCurrentDay} of {eventTotalDays} •{' '}
              </span>
            )}
            {task.title}
          </p>
        </div>

        <div className='mt-1 flex items-center gap-1'>
          <User className='size-3 shrink-0' />
          <p className='text-foreground text-xs'>{getTaskUser(task).name}</p>
        </div>

        <div className='flex items-center gap-1'>
          <Clock className='size-3 shrink-0' />
          <p className='text-foreground text-xs'>
            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
          </p>
        </div>

        <div className='flex items-center gap-1'>
          <Text className='size-3 shrink-0' />
          <p className='text-foreground text-xs'>{task.description}</p>
        </div>
      </div>
    </button>
  )
}
