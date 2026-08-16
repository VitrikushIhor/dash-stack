import { TasksTableView } from '@/views/task'
import { fetchTaskViewData } from '@/views/task/lib/fetch-task-view-data.server'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TaskTablePage({ searchParams }: PageProps) {
  const data = await fetchTaskViewData(searchParams)

  return <TasksTableView tasks={data.tasks} pageCount={data.pageCount} />
}
