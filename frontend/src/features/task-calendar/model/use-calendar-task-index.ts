import { useMemo } from 'react'
import { type Task } from '@/entities/task'
import { buildCalendarTaskIndex } from './calendar-task-index'

export function useCalendarTaskIndex(tasks: readonly Task[]) {
  return useMemo(() => buildCalendarTaskIndex(tasks), [tasks])
}
