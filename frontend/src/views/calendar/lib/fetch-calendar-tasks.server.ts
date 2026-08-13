import { redirect } from 'next/navigation'
import 'server-only'
import { getActiveOrganization } from '@/entities/organization/server'
import { getTasksUnpaginated } from '@/entities/task/server'
import { type TCalendarView } from '@/features/task-calendar'
import { calendarSearchParamsCache } from '@/features/task-calendar/model/calendar-search-params.server'
import { getVisibleRange } from './get-visible-range'

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

  const range = getVisibleRange(view, date)

  const tasksResult = await getTasksUnpaginated(activeOrgId, {
    ...range,
  })

  return {
    tasks: tasksResult.data || [],
    date,
  }
}
