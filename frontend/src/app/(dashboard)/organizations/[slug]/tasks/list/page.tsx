import { DEFAULT_PAGE, MAX_TASKS_PER_PAGE } from '@/shared/config'
import { TaskListPageView } from '@/views/task'
import { fetchTaskViewData } from '@/views/task/server'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationTaskListPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const data = await fetchTaskViewData(slug, searchParams, {
    page: DEFAULT_PAGE,
    perPage: MAX_TASKS_PER_PAGE,
  })

  return <TaskListPageView slug={data.slug} tasks={data.tasks} />
}
