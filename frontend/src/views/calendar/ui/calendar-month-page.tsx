import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarMonthClient } from './calendar-month-client'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarMonthPage({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('month', searchParams)
  return <CalendarMonthClient tasks={tasks} />
}
