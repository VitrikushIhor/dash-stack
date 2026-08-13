import { useCalendarSearchParams } from '../../model/calendar-search-params'
import { useMemo } from 'react'
import { parseISO, format, startOfDay, isSameMonth } from 'date-fns'
import { CalendarX2 } from 'lucide-react'
import { ScrollArea } from '@/shared/ui/core/scroll-area'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'

import { AgendaDayGroup } from './agenda-day-group'

interface IProps {
  singleDayTasks: Task[]
}

export function CalendarAgendaView({ singleDayTasks }: IProps) {
  const [{ date }] = useCalendarSearchParams()
  const selectedDate = date || new Date()

  const eventsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; tasks: Task[] }>()

    singleDayTasks.forEach((task) => {
      const anchor = getTaskCalendarAnchor(task)
      if (!anchor) return
      const eventDate = parseISO(anchor)
      if (!isSameMonth(eventDate, selectedDate)) return

      const dateKey = format(eventDate, 'yyyy-MM-dd')

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, {
          date: startOfDay(eventDate),
          tasks: [],
        })
      }

      allDates.get(dateKey)?.tasks.push(task)
    })

    return Array.from(allDates.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
  }, [singleDayTasks, selectedDate])

  const hasAnyEvents = singleDayTasks.length > 0

  return (
    <div className='h-[800px]'>
      <ScrollArea className='h-full' type='always'>
        <div className='space-y-6 p-4'>
          {eventsByDay.map((dayGroup) => (
            <AgendaDayGroup
              key={format(dayGroup.date, 'yyyy-MM-dd')}
              date={dayGroup.date}
              tasks={dayGroup.tasks}
            />
          ))}

          {!hasAnyEvents && (
            <div className='text-muted-foreground flex flex-col items-center justify-center gap-2 py-20'>
              <CalendarX2 className='size-10' />
              <p className='text-sm md:text-base'>
                No tasks scheduled for the selected month
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
