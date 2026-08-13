import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarDayPage } from '@/views/calendar/ui/calendar-day-page'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarDayRoute({ searchParams }: Props) {
  const { tasks, date } = await fetchCalendarTasks('day', searchParams)

  return <CalendarDayPage tasks={tasks} />
}
