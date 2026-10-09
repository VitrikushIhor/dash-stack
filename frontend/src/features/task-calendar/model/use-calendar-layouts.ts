import { useMemo } from 'react'
import { startOfWeek } from 'date-fns'
import { type Task } from '@/entities/task'
import { getCalendarCells, getWeekDays } from '../lib/helpers'
import { getCalendarDayTasks } from './calendar-task-index'
import { useCalendarTaskIndex } from './use-calendar-task-index'

export function useMonthLayout(tasks: Task[], date: Date) {
  const index = useCalendarTaskIndex(tasks)
  const cells = useMemo(
    () =>
      getCalendarCells(date).map((cell) => ({
        ...cell,
        tasks: getCalendarDayTasks(index, cell.date),
      })),
    [index, date]
  )
  return { cells }
}

export function useTimelineLayout(tasks: Task[], date: Date) {
  const index = useCalendarTaskIndex(tasks)
  const weekStart = useMemo(() => startOfWeek(date), [date])
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])
  const eventsByDay = useMemo(
    () => weekDays.map((day) => getCalendarDayTasks(index, day)),
    [index, weekDays]
  )
  return { weekStart, weekDays, eventsByDay }
}
