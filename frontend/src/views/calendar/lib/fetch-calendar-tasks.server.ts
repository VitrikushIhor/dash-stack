import { notFound } from 'next/navigation'
import 'server-only'
import { getOrganizationBySlug } from '@/entities/organization/server'
import { getTasksUnpaginated } from '@/entities/task/server'
import { type TCalendarView } from '@/features/task-calendar'
import { calendarSearchParamsCache } from '@/features/task-calendar/model/calendar-search-params.server'
import { getVisibleRange } from './get-visible-range'

export async function fetchCalendarTasks(
  slug: string,
  view: TCalendarView,
  searchParams: Promise<Record<string, string | string[] | undefined>>
) {
  const orgResult = await getOrganizationBySlug(slug)

  if (orgResult.error || !orgResult.data) {
    notFound()
  }

  const parsedParams = await calendarSearchParamsCache.parse(searchParams)
  const date = parsedParams.date || new Date()

  const range = getVisibleRange(view, date)

  const tasksResult = await getTasksUnpaginated(slug, {
    ...range,
  })

  return {
    tasks: tasksResult.data || [],
    date,
    slug: slug,
    error: tasksResult.error ?? null,
  }
}
