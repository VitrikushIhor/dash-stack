import 'server-only'
import { getOrganizationTasks } from '@/entities/task/server'
import { getParsedTaskFilters } from '@/widgets/tasks-table/lib/parse-task-search-params.server'

export async function fetchTaskViewData(
  slug: string,
  searchParams: Promise<Record<string, string | string[] | undefined>>,
  defaultPagination?: { page: number; perPage: number }
) {
  const filters = getParsedTaskFilters(await searchParams, defaultPagination)

  return {
    slug,
    result: await getOrganizationTasks(slug, filters),
  }
}
