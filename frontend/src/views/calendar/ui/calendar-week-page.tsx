import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarWeekClient } from './calendar-week-client'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarWeekPage({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('week', searchParams)
  return <CalendarWeekClient tasks={tasks} />
}
