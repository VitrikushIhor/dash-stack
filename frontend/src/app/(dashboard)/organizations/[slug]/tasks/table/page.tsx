import { PageErrorHandler } from '@/shared/ui/error-state'
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

  if (!data.result.ok) {
    return <PageErrorHandler error={data.result.error} withContainer={false} />
  }

  return (
    <TasksTableView
      slug={data.slug}
      tasks={data.result.data.data}
      pageCount={data.result.data.meta.lastPage}
    />
  )
}
