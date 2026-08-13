import { type Task } from '@/entities/task'
import { type TCalendarView } from '../../model/calendar-types'
import { DateNavigator } from './date-navigator'
import { TodayButton } from './today-button'

interface IProps {
  tasks: Task[]
  view: TCalendarView
}

export function CalendarHeader({ tasks, view }: IProps) {
  return (
    <div className='flex items-center gap-3'>
      <TodayButton />
      <DateNavigator view={view} tasks={tasks} />
    </div>
  )
}
