import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarWeekPage } from '@/views/calendar/ui/calendar-week-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarWeekRoute({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('week', searchParams)

  return <CalendarWeekPage tasks={tasks} />
}
