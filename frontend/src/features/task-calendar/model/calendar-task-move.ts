import { z } from 'zod'
import { isValid, parseISO, set } from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'

const taskDragDataSchema = z.object({
  type: z.literal('task'),
  taskId: z.string().min(1),
})
const dayDropDataSchema = z.object({ type: z.literal('day'), date: z.date() })

export type CalendarTaskDragData = z.infer<typeof taskDragDataSchema>
export type CalendarDayDropData = z.infer<typeof dayDropDataSchema>
export interface CalendarTaskDateUpdate {
  dueDate: string
}

export function readCalendarTaskDragData(
  value: unknown
): CalendarTaskDragData | null {
  const result = taskDragDataSchema.safeParse(value)
  return result.success ? result.data : null
}

export function readCalendarDayDropData(
  value: unknown
): CalendarDayDropData | null {
  const result = dayDropDataSchema.safeParse(value)
  return result.success ? result.data : null
}

export function getCalendarTaskDateUpdate(
  task: Task,
  target: CalendarDayDropData
): CalendarTaskDateUpdate | null {
  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null
  const date = parseISO(anchor)
  if (!isValid(date)) throw new RangeError('Invalid calendar task date')
  const dueDate = set(target.date, {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),
  }).toISOString()
  return task.dueDate === dueDate ? null : { dueDate }
}
