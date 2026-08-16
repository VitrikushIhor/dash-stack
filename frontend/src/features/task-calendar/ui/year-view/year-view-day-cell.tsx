import { useRouter } from 'next/navigation'
import { isToday, format } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { type Task } from '@/entities/task'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'

interface IProps {
  selectedDate: Date
  day: number
  date: Date
  tasks: Task[]
}

export function YearViewDayCell({
  day,
  date,
  tasks,
  selectedDate: _selectedDate,
}: IProps) {
  const router = useRouter()

  const maxIndicators = 3
  const eventCount = tasks.length

  const handleClick = () => {
    router.push(`/calendar/day?date=${format(date, 'yyyy-MM-dd')}`)
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
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'size-1.5 rounded-full',
                  getTaskColor(task) === 'blue' && 'bg-blue-600',
                  getTaskColor(task) === 'green' && 'bg-green-600',
                  getTaskColor(task) === 'red' && 'bg-red-600',
                  getTaskColor(task) === 'yellow' && 'bg-yellow-600',
                  getTaskColor(task) === 'purple' && 'bg-purple-600',
                  getTaskColor(task) === 'orange' && 'bg-orange-600',
                  getTaskColor(task) === 'gray' && 'bg-neutral-600'
                )}
              />
            ))
          ) : (
            <>
              <div
                className={cn(
                  'size-1.5 rounded-full',
                  getTaskColor(tasks[0]) === 'blue' && 'bg-blue-600',
                  getTaskColor(tasks[0]) === 'green' && 'bg-green-600',
                  getTaskColor(tasks[0]) === 'red' && 'bg-red-600',
                  getTaskColor(tasks[0]) === 'yellow' && 'bg-yellow-600',
                  getTaskColor(tasks[0]) === 'purple' && 'bg-purple-600',
                  getTaskColor(tasks[0]) === 'orange' && 'bg-orange-600'
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
