import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarAgendaPage } from '@/views/calendar/ui/calendar-agenda-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarAgendaRoute({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('agenda', searchParams)

  return <CalendarAgendaPage tasks={tasks} />
}
