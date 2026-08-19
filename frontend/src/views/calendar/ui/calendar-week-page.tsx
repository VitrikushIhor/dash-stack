import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface Props {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarWeekPage({ slug, searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks(slug, 'week', searchParams)
  return <CalendarViewClient slug={slug} tasks={tasks} view='week' />
}
