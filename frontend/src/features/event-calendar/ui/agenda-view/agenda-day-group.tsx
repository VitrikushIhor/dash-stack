import { format, parseISO } from 'date-fns'
import { type Task } from '@/entities/task'
import { AgendaEventCard } from './agenda-event-card'

interface IProps {
  date: Date
  events: Task[]
}

export function AgendaDayGroup({ date, events }: IProps) {
  const sortedEvents = [...events].sort(
    (a, b) => parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime()
  )

  return (
    <div className='space-y-4'>
      <div className='bg-background sticky top-0 flex items-center gap-4 p-2'>
        <p className='text-sm font-semibold'>
          {format(date, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className='space-y-2'>
        {sortedEvents.length > 0 &&
          sortedEvents.map((event) => (
            <AgendaEventCard key={event.id} event={event} />
          ))}

        {sortedEvents.length === 0 && (
          <p className='text-muted-foreground text-sm'>No events</p>
        )}
      </div>
    </div>
  )
}
