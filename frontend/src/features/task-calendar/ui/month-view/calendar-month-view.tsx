import { SHORT_WEEK_DAYS } from '../../lib/constants'
import { type CalendarViewProps } from '../../model/calendar-view-props'
import { useMonthLayout } from '../../model/use-calendar-layouts'
import { DayCell } from './day-cell'

export function CalendarMonthView({
  tasks,
  selectedDate,
  onTaskClick,
}: CalendarViewProps) {
  const { cells } = useMonthLayout(tasks, selectedDate)

  return (
    <div>
      <div className='grid grid-cols-7 divide-x'>
        {SHORT_WEEK_DAYS.map((day) => (
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
            tasks={cell.tasks}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  )
}
