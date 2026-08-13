import { fetchTaskViewData, TaskListPageView } from '@/views/task'
import { DEFAULT_PAGE, MAX_TASKS_PER_PAGE } from '@/shared/config'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TaskListPage({ searchParams }: PageProps) {
  const data = await fetchTaskViewData(searchParams, {
    page: DEFAULT_PAGE,
    perPage: MAX_TASKS_PER_PAGE,
  })
  return <TaskListPageView tasks={data.tasks} />
}
