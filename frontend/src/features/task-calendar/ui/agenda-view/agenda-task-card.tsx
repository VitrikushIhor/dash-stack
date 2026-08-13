import { format, parseISO } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { Clock, Text, User } from 'lucide-react'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { getTaskColor, getTaskUser } from '@/features/task-calendar/lib/mappers'

import { useTaskSearchParams } from '@/features/manage-task/model/task-search-params'
import { agendaEventCardVariants } from '../variants'

interface IProps {
  task: Task
  eventCurrentDay?: number
  eventTotalDays?: number
  badgeVariant?: 'mixed' | 'dot' | 'solid'
}

export function AgendaTaskCard({
  task,
  eventCurrentDay,
  eventTotalDays,
  badgeVariant = 'mixed',
}: IProps) {
  const [, setTaskParams] = useTaskSearchParams()

  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null
  const startDate = parseISO(anchor)
  const endDate = startDate

  const color = (
    badgeVariant === 'dot' ? `${getTaskColor(task)}-dot` : getTaskColor(task)
  ) as VariantProps<typeof agendaEventCardVariants>['color']

  const agendaEventCardClasses = agendaEventCardVariants({ color })

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
    <div
      role='button'
      tabIndex={0}
      className={agendaEventCardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1.5'>
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
    </div>
  )
}
