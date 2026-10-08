import { useMemo } from 'react'
import { format, isSameMonth } from 'date-fns'
import { CalendarX2 } from 'lucide-react'
import { ScrollArea } from '@/shared/ui/core/scroll-area'
import { type CalendarViewProps } from '../../model/calendar-view-props'
import { useCalendarTaskIndex } from '../../model/use-calendar-task-index'
import { AgendaDayGroup } from './agenda-day-group'

export function CalendarAgendaView({
  tasks,
  selectedDate,
  onTaskClick,
}: CalendarViewProps) {
  const index = useCalendarTaskIndex(tasks)
  const eventsByDay = useMemo(
    () =>
      [...index.values()].filter((day) => isSameMonth(day.date, selectedDate)),
    [index, selectedDate]
  )

  const hasAnyEvents = eventsByDay.length > 0

  return (
    <div className='h-200'>
      <ScrollArea className='h-full' type='always'>
        <div className='space-y-6 p-4'>
          {eventsByDay.map((dayGroup) => (
            <AgendaDayGroup
              key={format(dayGroup.date, 'yyyy-MM-dd')}
              date={dayGroup.date}
              tasks={dayGroup.tasks}
              onTaskClick={onTaskClick}
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
