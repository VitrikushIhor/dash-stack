import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarMonthPage } from '@/views/calendar/ui/calendar-month-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarMonthRoute({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('month', searchParams)

  return <CalendarMonthPage tasks={tasks} />
}
