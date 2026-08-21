import { TaskKanbanPageView } from '@/views/task'
import { fetchTaskViewData } from '@/views/task/server'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationTaskKanbanPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const data = await fetchTaskViewData(slug, searchParams)

  return <TaskKanbanPageView slug={data.slug} tasks={data.tasks} />
}
