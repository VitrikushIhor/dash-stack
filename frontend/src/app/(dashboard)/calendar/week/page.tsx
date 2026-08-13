import { CalendarWeekPage } from '@/views/calendar/ui/calendar-week-page'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarWeekRoute({ searchParams }: Props) {
  const { tasks, date } = await fetchCalendarTasks('week', searchParams)

  return <CalendarWeekPage tasks={tasks} />
}
