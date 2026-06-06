import { startOfWeek, format, parseISO, isSameDay } from 'date-fns'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { getWeekDays } from '../../lib/helpers'
import { useCalendar } from '../../model/calendar-context'
import type { IEvent } from '../../model/types'
import { EventBlock } from './event-block'
import { WeekViewMultiDayEventsRow } from './week-view-multi-day-events-row'

interface IProps {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar()

  const weekStart = startOfWeek(selectedDate)
  const weekDays = getWeekDays(weekStart)

  return (
    <>
      <div className='text-muted-foreground flex flex-col items-center justify-center border-b py-4 text-sm sm:hidden'>
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className='hidden flex-col sm:flex'>
        <div>
          <WeekViewMultiDayEventsRow
            selectedDate={selectedDate}
            multiDayEvents={multiDayEvents}
          />

          {/* Week header */}
          <div className='relative z-20 flex border-b'>
            <div className='grid flex-1 grid-cols-7 divide-x border-l'>
              {weekDays.map((day, index) => (
                <span
                  key={index}
                  className='text-muted-foreground py-2 text-center text-xs font-medium'
                >
                  {format(day, 'EE')}{' '}
                  <span className='text-foreground ml-1 font-semibold'>
                    {format(day, 'd')}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className='h-[736px]' type='always'>
          <div className='flex overflow-hidden'>
            {/* Week grid */}
            <div className='relative flex-1 border-l'>
              <div className='grid min-h-[700px] grid-cols-7 divide-x'>
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents
                    .filter(
                      (event) =>
                        isSameDay(parseISO(event.startDate), day) ||
                        isSameDay(parseISO(event.endDate), day)
                    )
                    .sort(
                      (a, b) =>
                        parseISO(a.startDate).getTime() -
                        parseISO(b.startDate).getTime()
                    )

                  return (
                    <div
                      key={dayIndex}
                      className='flex min-h-full flex-col gap-2 p-1.5'
                    >
                      {dayEvents.map((event) => (
                        <EventBlock key={event.id} event={event} />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
