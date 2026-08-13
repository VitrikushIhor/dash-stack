import { type TSetCalendarParams } from '../../model/calendar-types'
import { type Task } from '@/entities/task'

import { useMonthLayout } from '../../model/use-calendar-layouts'
import { DayCell } from './day-cell'

interface IProps {
  singleDayTasks: Task[]
  selectedDate: Date
  setParams: TSetCalendarParams
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonthView({ singleDayTasks, selectedDate, setParams }: IProps) {
  
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
            selectedDate={selectedDate}
            setParams={setParams}
          />
        ))}
      </div>
    </div>
  )
}
