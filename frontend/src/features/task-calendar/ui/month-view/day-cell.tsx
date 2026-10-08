import { isToday } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { type Task } from '@/entities/task'
import { getTaskColor } from '@/features/task-calendar/lib/mappers'
import { useCalendarNavigation } from '../../lib/navigation'
import { type ICalendarCell } from '../../model/types'
import { DraggableTask } from '../dnd/draggable-task'
import { DroppableDayCell } from '../dnd/droppable-day-cell'
import { MonthTaskBadge } from './month-task-badge'
import { TaskBullet } from './task-bullet'

interface IProps {
  cell: ICalendarCell
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
}

const MAX_VISIBLE_EVENTS = 3

export function DayCell({ cell, tasks, onTaskClick }: IProps) {
  const { navigateToDay } = useCalendarNavigation()

  const { day, currentMonth, date } = cell

  const isSunday = date.getDay() === 0

  const handleClick = () => {
    navigateToDay(date)
  }

  return (
    <DroppableDayCell cell={cell}>
      <div
        className={cn(
          'flex h-full flex-col gap-1 border-t border-l py-1.5 lg:pt-1 lg:pb-2',
          isSunday && 'border-l-0'
        )}
      >
        <button
          onClick={handleClick}
          className={cn(
            'hover:bg-accent focus-visible:ring-ring flex size-6 translate-x-1 items-center justify-center rounded-full text-xs font-semibold focus-visible:ring-1 focus-visible:outline-none lg:px-2',
            !currentMonth && 'opacity-20',
            isToday(date) &&
              'bg-primary text-primary-foreground hover:bg-primary font-bold'
          )}
        >
          {day}
        </button>

        <div
          className={cn(
            'flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0',
            !currentMonth && 'opacity-50'
          )}
        >
          {Array.from({ length: MAX_VISIBLE_EVENTS }, (_, index) => index).map(
            (position) => {
              const task = tasks[position]
              const eventKey = task
                ? `task-${task.id}-${position}`
                : `empty-${position}`

              return (
                <div key={eventKey} className='lg:flex-1'>
                  {task && (
                    <>
                      <TaskBullet
                        className='lg:hidden'
                        color={getTaskColor(task)}
                      />
                      <DraggableTask task={task}>
                        <MonthTaskBadge
                          className='hidden lg:flex'
                          task={task}
                          cellDate={date}
                          onTaskClick={onTaskClick}
                        />
                      </DraggableTask>
                    </>
                  )}
                </div>
              )
            }
          )}
        </div>

        {tasks.length > MAX_VISIBLE_EVENTS && (
          <p
            className={cn(
              'text-muted-foreground h-4.5 px-1.5 text-xs font-semibold',
              !currentMonth && 'opacity-50'
            )}
          >
            <span className='sm:hidden'>
              +{tasks.length - MAX_VISIBLE_EVENTS}
            </span>
            <span className='hidden sm:inline'>
              {' '}
              {tasks.length - MAX_VISIBLE_EVENTS} more...
            </span>
          </p>
        )}
      </div>
    </DroppableDayCell>
  )
}
