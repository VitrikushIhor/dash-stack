import { type CalendarViewProps } from '../../model/calendar-view-props'
import { useMonthLayout } from '../../model/use-calendar-layouts'
import { DayCell } from './day-cell'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonthView({
  tasks,
  selectedDate,
  onTaskClick,
}: CalendarViewProps) {
  const { cells, eventPositions } = useMonthLayout(tasks, selectedDate)

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
            tasks={tasks}
            eventPositions={eventPositions}
            selectedDate={selectedDate}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  )
}
