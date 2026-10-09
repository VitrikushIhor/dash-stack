import { PageErrorHandler } from '@/shared/ui/error-state'
import { type TCalendarView } from '@/features/task-calendar'
import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface CalendarPageProps {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function renderCalendarPage({
  slug,
  searchParams,
  view,
}: CalendarPageProps & { view: TCalendarView }) {
  const { result } = await fetchCalendarTasks(slug, view, searchParams)

  if (!result.ok)
    return <PageErrorHandler error={result.error} withContainer={false} />

  return <CalendarViewClient slug={slug} tasks={result.data} view={view} />
}
