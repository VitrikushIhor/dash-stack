import { parseISO, format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { type Task } from '@/entities/task'
import { useCalendar } from '../../model/calendar-context'
import { EventBlock } from './event-block'

interface IProps {
  singleDayEvents: Task[]
}

export function CalendarDayView({ singleDayEvents }: IProps) {
  const { selectedDate } = useCalendar()

  const dayEvents = singleDayEvents
    .filter((event) => {
      const eventDate = parseISO(event.deadline)
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    .sort(
      (a, b) => parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime()
    )

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

        <ScrollArea className='h-[800px]' type='always'>
          <div className='p-4'>
            {dayEvents.length === 0 ? (
              <div className='border-muted/50 bg-muted/10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20 text-center'>
                <div className='bg-muted/20 text-muted-foreground mb-4 rounded-full p-4'>
                  <Calendar className='size-8' />
                </div>
                <h3 className='text-foreground text-base font-semibold'>
                  No events for today
                </h3>
                <p className='text-muted-foreground mt-1 max-w-[280px] text-sm'>
                  Enjoy your free day! Or create a new event by clicking on the
                  add button.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {dayEvents.map((event) => (
                  <EventBlock event={event} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
