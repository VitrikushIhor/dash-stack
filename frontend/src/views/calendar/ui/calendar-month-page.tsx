import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface Props {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarMonthPage({ slug, searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks(slug, 'month', searchParams)
  return <CalendarViewClient slug={slug} tasks={tasks} view='month' />
}
