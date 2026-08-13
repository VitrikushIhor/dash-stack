import { type Task } from '@/entities/task'
import {
  type TCalendarView,
  type TSetCalendarParams,
} from '../../model/calendar-types'
import { DateNavigator } from './date-navigator'
import { TodayButton } from './today-button'

interface IProps {
  tasks: Task[]
  view: TCalendarView
  selectedDate: Date
  setParams: TSetCalendarParams
}

export function CalendarHeader({
  tasks,
  view,
  selectedDate,
  setParams,
}: IProps) {
  return (
    <div className='flex items-center gap-3'>
      <TodayButton selectedDate={selectedDate} setParams={setParams} />
      <DateNavigator
        view={view}
        tasks={tasks}
        selectedDate={selectedDate}
        setParams={setParams}
      />
    </div>
  )
}
