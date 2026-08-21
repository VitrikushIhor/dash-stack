import { useMemo } from 'react'
import { isSameDay, parseISO, startOfWeek } from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import {
  calculateMonthEventPositions,
  getCalendarCells,
  getWeekDays,
} from '../lib/helpers'

export function useMonthLayout(tasks: Task[], date: Date) {
  const cells = useMemo(() => getCalendarCells(date), [date])

  const eventPositions = useMemo(
    () => calculateMonthEventPositions(tasks, date),
    [tasks, date]
  )

  return { cells, eventPositions }
}

export function useTimelineLayout(tasks: Task[], date: Date) {
  const weekStart = useMemo(() => startOfWeek(date), [date])
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])

  const eventsByDay = useMemo(() => {
    return weekDays.map((day) => {
      return tasks
        .filter((task) => {
          const anchor = getTaskCalendarAnchor(task)
          return anchor && isSameDay(parseISO(anchor), day)
        })
        .sort((a, b) => {
          const anchorA = getTaskCalendarAnchor(a)
          const anchorB = getTaskCalendarAnchor(b)
          if (!anchorA || !anchorB) return 0
          return parseISO(anchorA).getTime() - parseISO(anchorB).getTime()
        })
    })
  }, [tasks, weekDays])

  return { weekStart, weekDays, eventsByDay }
}
