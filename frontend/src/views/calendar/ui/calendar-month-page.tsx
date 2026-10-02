import { PageErrorHandler } from '@/shared/ui/error-state'
import { fetchCalendarTasks } from '../server'
import { CalendarViewClient } from './calendar-view-client'

interface Props {
  slug: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CalendarMonthPage({ slug, searchParams }: Props) {
  const { result } = await fetchCalendarTasks(slug, 'month', searchParams)

  if (!result.ok)
    return <PageErrorHandler error={result.error} withContainer={false} />

  return <CalendarViewClient slug={slug} tasks={result.data} view='month' />
}
