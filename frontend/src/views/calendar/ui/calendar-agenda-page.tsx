import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarAgendaClient } from './calendar-agenda-client'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarAgendaPage({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('agenda', searchParams)
  return <CalendarAgendaClient tasks={tasks} />
}
