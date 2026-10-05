import { format, isValid, parseISO, startOfDay } from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'

export interface CalendarTaskDay {
  date: Date
  tasks: Task[]
}

export type CalendarTaskIndex = ReadonlyMap<string, CalendarTaskDay>

export function buildCalendarTaskIndex(
  tasks: readonly Task[]
): CalendarTaskIndex {
  const datedTasks: { task: Task; date: Date }[] = []

  for (const task of tasks) {
    const anchor = getTaskCalendarAnchor(task)
    if (!anchor) continue

    const date = parseISO(anchor)
    if (!isValid(date)) throw new RangeError('Invalid calendar task date')
    datedTasks.push({ task, date })
  }

  datedTasks.sort((a, b) => a.date.getTime() - b.date.getTime())
  const days = new Map<string, CalendarTaskDay>()

  for (const { task, date } of datedTasks) {
    const key = format(date, 'yyyy-MM-dd')
    const day = days.get(key)
    if (day) {
      day.tasks.push(task)
    } else {
      days.set(key, { date: startOfDay(date), tasks: [task] })
    }
  }

  return days
}

export function getCalendarDayTasks(
  index: CalendarTaskIndex,
  date: Date
): Task[] {
  return index.get(format(date, 'yyyy-MM-dd'))?.tasks ?? []
}
