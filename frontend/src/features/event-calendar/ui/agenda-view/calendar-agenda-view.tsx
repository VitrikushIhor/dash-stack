import { useMemo } from 'react'
import { parseISO, format, startOfDay, isSameMonth } from 'date-fns'
import { CalendarX2 } from 'lucide-react'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { useCalendar } from '@/features/event-calendar/model/calendar-context'
import { AgendaDayGroup } from './agenda-day-group'

interface IProps {
  singleDayEvents: Task[]
}

export function CalendarAgendaView({ singleDayEvents }: IProps) {
  const { selectedDate } = useCalendar()

  const eventsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; events: Task[] }>()

    singleDayEvents.forEach((event) => {
      const anchor = getTaskCalendarAnchor(event)
      if (!anchor) return
      const eventDate = parseISO(anchor)
      if (!isSameMonth(eventDate, selectedDate)) return

      const dateKey = format(eventDate, 'yyyy-MM-dd')

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, {
          date: startOfDay(eventDate),
          events: [],
        })
      }

      allDates.get(dateKey)?.events.push(event)
    })

    return Array.from(allDates.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
  }, [singleDayEvents, selectedDate])

  const hasAnyEvents = singleDayEvents.length > 0

  return (
    <div className='h-[800px]'>
      <ScrollArea className='h-full' type='always'>
        <div className='space-y-6 p-4'>
          {eventsByDay.map((dayGroup) => (
            <AgendaDayGroup
              key={format(dayGroup.date, 'yyyy-MM-dd')}
              date={dayGroup.date}
              events={dayGroup.events}
            />
          ))}

          {!hasAnyEvents && (
            <div className='text-muted-foreground flex flex-col items-center justify-center gap-2 py-20'>
              <CalendarX2 className='size-10' />
              <p className='text-sm md:text-base'>
                No events scheduled for the selected month
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
