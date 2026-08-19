import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface Props {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarAgendaPage({ slug, searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks(slug, 'agenda', searchParams)
  return <CalendarViewClient slug={slug} tasks={tasks} view='agenda' />
}
