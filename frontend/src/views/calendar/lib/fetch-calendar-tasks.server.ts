import { redirect } from 'next/navigation'
import 'server-only'
import { getActiveOrganization } from '@/entities/organization/server'
import { getOrganizationTasks } from '@/entities/task/server'
import { calendarSearchParamsCache } from '@/features/task-calendar/model/calendar-search-params.server'
import { getVisibleRange } from './get-visible-range'
import { type TCalendarView } from '@/features/task-calendar'

import { getParsedTaskFilters } from '@/widgets/tasks-table/lib/parse-task-search-params.server'

export async function fetchCalendarTasks(
  view: TCalendarView,
  searchParams: Promise<Record<string, string | string[] | undefined>>
) {
  const activeOrgResult = await getActiveOrganization()
  const activeOrgId = activeOrgResult.activeOrg?.id

  if (!activeOrgId) {
    redirect('/')
  }

  const parsedParams = await calendarSearchParamsCache.parse(searchParams)
  const date = parsedParams.date || new Date()

  const filters = getParsedTaskFilters(await searchParams)
  const range = getVisibleRange(view, date)

  const tasksResult = await getOrganizationTasks(activeOrgId, {
    ...filters,
    ...range,
    perPage: 1000,
  })

  return {
    tasks: tasksResult.data || [],
    date,
  }
}
