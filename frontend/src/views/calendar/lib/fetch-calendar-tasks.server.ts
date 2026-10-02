import 'server-only'
import { getTasksUnpaginated } from '@/entities/task/server'
import { type TCalendarView } from '@/features/task-calendar'
import { calendarSearchParamsCache } from '@/features/task-calendar/model/calendar-search-params.server'
import { getVisibleRange } from './get-visible-range'

export async function fetchCalendarTasks(
  slug: string,
  view: TCalendarView,
  searchParams: Promise<Record<string, string | string[] | undefined>>
) {
  const parsedParams = await calendarSearchParamsCache.parse(searchParams)
  const date = parsedParams.date || new Date()

  const range = getVisibleRange(view, date)

  const result = await getTasksUnpaginated(slug, {
    ...range,
  })

  return {
    result,
    date,
    slug,
  }
}
