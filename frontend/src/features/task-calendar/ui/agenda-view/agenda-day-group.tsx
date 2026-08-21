import { format, parseISO } from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { AgendaTaskCard } from './agenda-task-card'

interface IProps {
  date: Date
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
}

export function AgendaDayGroup({ date, tasks, onTaskClick }: IProps) {
  const sortedEvents = [...tasks].sort((a, b) => {
    const anchorA = getTaskCalendarAnchor(a)
    const anchorB = getTaskCalendarAnchor(b)
    if (!anchorA || !anchorB) return 0
    return parseISO(anchorA).getTime() - parseISO(anchorB).getTime()
  })

  return (
    <div className='space-y-4'>
      <div className='bg-background sticky top-0 flex items-center gap-4 p-2'>
        <p className='text-sm font-semibold'>
          {format(date, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className='space-y-2'>
        {sortedEvents.length > 0 &&
          sortedEvents.map((task) => (
            <AgendaTaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}

        {sortedEvents.length === 0 && (
          <p className='text-muted-foreground text-sm'>No tasks</p>
        )}
      </div>
    </div>
  )
}
