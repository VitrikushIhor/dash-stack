import { notFound } from 'next/navigation'
import 'server-only'
import { getOrganizationBySlug } from '@/entities/organization/server'
import { getOrganizationTasks } from '@/entities/task/server'
import { getParsedTaskFilters } from '@/widgets/tasks-table/lib/parse-task-search-params.server'

export async function fetchTaskViewData(
  slug: string,
  searchParams: Promise<Record<string, string | string[] | undefined>>,
  defaultPagination?: { page: number; perPage: number }
) {
  const orgResult = await getOrganizationBySlug(slug)

  if (orgResult.error || !orgResult.data) {
    notFound()
  }

  const filters = getParsedTaskFilters(await searchParams, defaultPagination)
  const tasksResult = await getOrganizationTasks(slug, filters)

  const tasks = tasksResult.data || []
  const pageCount = tasksResult.meta?.lastPage ?? -1

  return {
    tasks,
    pageCount,
    slug: slug,
    error: tasksResult.error ?? null,
  }
}
