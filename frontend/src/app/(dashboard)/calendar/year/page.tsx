import { CalendarYearPage } from '@/views/calendar/ui/calendar-year-page'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarYearRoute({ searchParams }: Props) {
  const { tasks, date } = await fetchCalendarTasks('year', searchParams)

  return <CalendarYearPage tasks={tasks} />
}
