import { useMemo } from 'react'
import { type Task } from '@/entities/task'
import {
  calculateMonthEventPositions,
  getCalendarCells,
} from '../../lib/helpers'
import { useCalendar } from '../../model/calendar-context'
import { DayCell } from './day-cell'

interface IProps {
  singleDayEvents: Task[]
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonthView({ singleDayEvents }: IProps) {
  const { selectedDate } = useCalendar()

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate])

  const eventPositions = useMemo(
    () => calculateMonthEventPositions(singleDayEvents, selectedDate),
    [singleDayEvents, selectedDate]
  )

  return (
    <div>
      <div className='grid grid-cols-7 divide-x'>
        {WEEK_DAYS.map((day) => (
          <div key={day} className='flex items-center justify-center py-2'>
            <span className='text-muted-foreground text-xs font-medium'>
              {day}
            </span>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 overflow-hidden'>
        {cells.map((cell) => (
          <DayCell
            key={cell.date.toISOString()}
            cell={cell}
            events={singleDayEvents}
            eventPositions={eventPositions}
          />
        ))}
      </div>
    </div>
  )
}
