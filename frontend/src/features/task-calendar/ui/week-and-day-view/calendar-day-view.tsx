import { format, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'
import { ScrollArea } from '@/shared/ui/core/scroll-area'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { TaskBlock } from './task-block'

interface IProps {
  singleDayTasks: Task[]
  selectedDate: Date
  onTaskClick?: (taskId: string) => void
}

export function CalendarDayView({
  singleDayTasks,
  selectedDate,
  onTaskClick,
}: IProps) {
  const dayEvents = singleDayTasks
    .filter((task) => {
      const anchor = getTaskCalendarAnchor(task)
      if (!anchor) return false
      const eventDate = parseISO(anchor)
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    .sort((a, b) => {
      const anchorA = getTaskCalendarAnchor(a)
      const anchorB = getTaskCalendarAnchor(b)
      if (!anchorA || !anchorB) return 0
      return parseISO(anchorA).getTime() - parseISO(anchorB).getTime()
    })

  return (
    <div className='flex'>
      <div className='flex flex-1 flex-col'>
        <div>
          {/* Day header */}
          <div className='relative z-20 flex border-b'>
            <span className='text-muted-foreground flex-1 py-2 text-center text-xs font-medium'>
              {format(selectedDate, 'EE')}{' '}
              <span className='text-foreground font-semibold'>
                {format(selectedDate, 'd')}
              </span>
            </span>
          </div>
        </div>

        <ScrollArea className='h-200' type='always'>
          <div className='p-4'>
            {dayEvents.length === 0 ? (
              <div className='border-muted/50 bg-muted/10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20 text-center'>
                <div className='bg-muted/20 text-muted-foreground mb-4 rounded-full p-4'>
                  <Calendar className='size-8' />
                </div>
                <h3 className='text-foreground text-base font-semibold'>
                  No tasks for today
                </h3>
                <p className='text-muted-foreground mt-1 max-w-70 text-sm'>
                  Enjoy your free day! Or create a new task by clicking on the
                  add button.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {dayEvents.map((task) => (
                  <TaskBlock
                    key={task.id}
                    task={task}
                    onTaskClick={onTaskClick}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
