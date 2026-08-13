import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarYearClient } from './calendar-year-client'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarYearPage({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('year', searchParams)
  return <CalendarYearClient tasks={tasks} />
}
