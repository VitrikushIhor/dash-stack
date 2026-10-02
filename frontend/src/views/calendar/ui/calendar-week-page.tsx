import { PageErrorHandler } from '@/shared/ui/error-state'
import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface Props {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarWeekPage({ slug, searchParams }: Props) {
  const { result } = await fetchCalendarTasks(slug, 'week', searchParams)

  if (!result.ok)
    return <PageErrorHandler error={result.error} withContainer={false} />

  return <CalendarViewClient slug={slug} tasks={result.data} view='week' />
}
