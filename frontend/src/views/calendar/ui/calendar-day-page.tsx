import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarDayClient } from './calendar-day-client'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarDayPage({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('day', searchParams)
  return <CalendarDayClient tasks={tasks} />
}
