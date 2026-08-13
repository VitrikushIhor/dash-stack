import { useMemo } from 'react'
import { getTaskCalendarAnchor } from '@/entities/task'
import { useCalendar } from './calendar-context'

export function useFilteredTasks() {
  const { tasks, selectedUserId } = useCalendar()

  const filteredTasks = useMemo(() => {
    if (selectedUserId === 'all') return tasks
    return tasks.filter((e) =>
      e.assignees.some((a) => a.userId === selectedUserId)
    )
  }, [tasks, selectedUserId])

  const singleDayTasks = useMemo(
    () => filteredTasks.filter((e) => !!getTaskCalendarAnchor(e)),
    [filteredTasks]
  )

  return {
    filteredTasks,
    singleDayTasks,
  }
}
