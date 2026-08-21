import { notFound } from 'next/navigation'
import { getOrganizationLabels } from '@/entities/label/server'
import {
  getOrganizationBySlug,
  getOrganizationMembers,
} from '@/entities/organization/server'
import { TaskHeaderActions, TaskModals } from '@/features/manage-task'
import { TaskToolbar } from '@/features/task-filters'
import { Main } from '@/widgets/layout'
import { TaskTabsNav } from '@/widgets/task-tabs-nav'

interface TasksLayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationTasksLayout({
  children,
  params,
}: TasksLayoutProps) {
  const { slug } = await params
  const orgResult = await getOrganizationBySlug(slug)

  if (orgResult.error || !orgResult.data) {
    notFound()
  }

  const [membersResult, labelsResult] = await Promise.all([
    getOrganizationMembers(slug),
    getOrganizationLabels(slug),
  ])

  const members = membersResult.data || []
  const labels = labelsResult.data || []

  return (
    <Main>
      <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
          <p className='text-muted-foreground'>
            Here&apos;s a list of your tasks for {orgResult.data.name}!
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <TaskTabsNav slug={slug} />
          <TaskHeaderActions />
        </div>
      </div>

      <div className='mb-4'>
        <TaskToolbar labels={labels} members={members} />
      </div>

      {children}
      <TaskModals slug={slug} labels={labels} members={members} />
    </Main>
  )
}
