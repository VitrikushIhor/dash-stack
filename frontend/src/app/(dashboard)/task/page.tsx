import { TaskKanbanPageView } from '@/views/task'
import { fetchTaskViewData } from '@/views/task/lib/fetch-task-view-data.server'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TaskKanbanPage({ searchParams }: PageProps) {
  const data = await fetchTaskViewData(searchParams)

  return <TaskKanbanPageView tasks={data.tasks} />
}
