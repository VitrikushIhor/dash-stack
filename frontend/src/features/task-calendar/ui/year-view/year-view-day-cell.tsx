import { isToday } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { type Task } from '@/entities/task'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { useCalendarNavigation } from '../../lib/navigation'
import { CalendarTaskIndicator } from '../calendar-task-indicator'

interface IProps {
  day: number
  date: Date
  tasks: Task[]
}

export function YearViewDayCell({ day, date, tasks }: IProps) {
  const { navigateToDay } = useCalendarNavigation()

  const maxIndicators = 3
  const eventCount = tasks.length

  const handleClick = () => {
    navigateToDay(date)
  }

  return (
    <button
      onClick={handleClick}
      type='button'
      className='hover:bg-accent focus-visible:ring-ring flex h-11 flex-1 flex-col items-center justify-start gap-0.5 rounded-md pt-1 focus-visible:ring-1 focus-visible:outline-none'
    >
      <div
        className={cn(
          'flex size-6 items-center justify-center rounded-full text-xs font-medium',
          isToday(date) && 'bg-primary text-primary-foreground font-semibold'
        )}
      >
        {day}
      </div>

      {eventCount > 0 && (
        <div className='mt-0.5 flex gap-0.5'>
          {(eventCount <= maxIndicators ? tasks : tasks.slice(0, 1)).map(
            (task) => (
              <CalendarTaskIndicator
                key={task.id}
                color={getTaskColor(task)}
                size='small'
              />
            )
          )}
          {eventCount > maxIndicators && (
            <span className='text-muted-foreground text-[7px]'>
              +{eventCount - 1}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
