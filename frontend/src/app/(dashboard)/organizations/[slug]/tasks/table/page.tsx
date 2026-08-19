import { TasksTableView } from '@/widgets/tasks-table'
import { fetchTaskViewData } from '@/views/task/server'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationTaskTablePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const data = await fetchTaskViewData(slug, searchParams)

  return (
    <TasksTableView
      slug={data.slug}
      tasks={data.tasks}
      pageCount={data.pageCount}
    />
  )
}
