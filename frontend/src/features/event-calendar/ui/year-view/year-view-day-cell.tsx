import { isToday } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { type Task } from '@/entities/task'
import { getTaskColor } from '@/features/event-calendar/lib/mappers'
import { useCalendar } from '../../model/calendar-context'

interface IProps {
  day: number
  date: Date
  events: Task[]
}

export function YearViewDayCell({ day, date, events }: IProps) {
  const { setSelectedDate, setView } = useCalendar()

  const maxIndicators = 3
  const eventCount = events.length

  const handleClick = () => {
    setSelectedDate(date)
    setView('day')
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
          {eventCount <= maxIndicators ? (
            events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  'size-1.5 rounded-full',
                  getTaskColor(event) === 'blue' && 'bg-blue-600',
                  getTaskColor(event) === 'green' && 'bg-green-600',
                  getTaskColor(event) === 'red' && 'bg-red-600',
                  getTaskColor(event) === 'yellow' && 'bg-yellow-600',
                  getTaskColor(event) === 'purple' && 'bg-purple-600',
                  getTaskColor(event) === 'orange' && 'bg-orange-600',
                  getTaskColor(event) === 'gray' && 'bg-neutral-600'
                )}
              />
            ))
          ) : (
            <>
              <div
                className={cn(
                  'size-1.5 rounded-full',
                  getTaskColor(events[0]) === 'blue' && 'bg-blue-600',
                  getTaskColor(events[0]) === 'green' && 'bg-green-600',
                  getTaskColor(events[0]) === 'red' && 'bg-red-600',
                  getTaskColor(events[0]) === 'yellow' && 'bg-yellow-600',
                  getTaskColor(events[0]) === 'purple' && 'bg-purple-600',
                  getTaskColor(events[0]) === 'orange' && 'bg-orange-600'
                )}
              />
              <span className='text-muted-foreground text-[7px]'>
                +{eventCount - 1}
              </span>
            </>
          )}
        </div>
      )}
    </button>
  )
}
