import { useMemo } from 'react'
import { useCalendarSearchParams } from '../../model/calendar-search-params'
import { type Task } from '@/entities/task'

import { useMonthLayout } from '../../model/use-calendar-layouts'
import { DayCell } from './day-cell'

interface IProps {
  singleDayTasks: Task[]
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonthView({ singleDayTasks }: IProps) {
const [{ date }] = useCalendarSearchParams()
  const selectedDate = useMemo(() => date || new Date(), [date])

  const { cells, eventPositions } = useMonthLayout(
    singleDayTasks,
    selectedDate
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
            tasks={singleDayTasks}
            eventPositions={eventPositions}
          />
        ))}
      </div>
    </div>
  )
}
