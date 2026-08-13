import { redirect } from 'next/navigation'
import 'server-only'
import { getActiveOrganization } from '@/entities/organization/server'
import { getOrganizationTasks } from '@/entities/task/server'
import { getParsedTaskFilters } from '@/widgets/tasks-table/lib/parse-task-search-params.server'

export async function fetchTaskViewData(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
  defaultPagination?: { page: number; perPage: number }
) {
  const activeOrgResult = await getActiveOrganization()
  const activeOrgId = activeOrgResult.activeOrg?.id

  if (!activeOrgId) {
    redirect('/')
  }

  const filters = getParsedTaskFilters(await searchParams, defaultPagination)

  const tasksResult = await getOrganizationTasks(activeOrgId, filters)

  const tasks = tasksResult.data || []
  const pageCount = tasksResult.meta?.lastPage ?? -1

  return {
    tasks,
    pageCount,
  }
}
