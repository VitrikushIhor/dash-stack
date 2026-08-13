import { CalendarYearPage } from '@/views/calendar/ui/calendar-year-page'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarYearRoute({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('year', searchParams)

  return <CalendarYearPage tasks={tasks} />
}
