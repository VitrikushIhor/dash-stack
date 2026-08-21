import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface Props {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarYearPage({ slug, searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks(slug, 'year', searchParams)
  return <CalendarViewClient slug={slug} tasks={tasks} view='year' />
}
