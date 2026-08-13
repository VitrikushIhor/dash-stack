import { getOrganizationLabels } from '@/entities/label/server'
import {
  getActiveOrganization,
  getOrganizationMembers,
} from '@/entities/organization/server'
import { TaskHeaderActions, TaskModals } from '@/features/manage-task'
import { TaskToolbar } from '@/features/task-filters'
import { Main } from '@/widgets/layout'
import { TaskTabsNav } from '@/widgets/task-tabs-nav'

export default async function TaskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeOrgResult = await getActiveOrganization()
  const activeOrgId = activeOrgResult.activeOrg?.id || ''

  const [membersResult, labelsResult] = await Promise.all([
    getOrganizationMembers(activeOrgId),
    getOrganizationLabels(activeOrgId),
  ])

  const members = membersResult.data || []
  const labels = labelsResult.data || []

  return (
    <Main>
      <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
          <p className='text-muted-foreground'>
            Here&apos;s a list of your tasks for this organization!
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <TaskTabsNav />
          <TaskHeaderActions />
        </div>
      </div>

      <div className='mb-4'>
        <TaskToolbar labels={labels} members={members} />
      </div>

      {children}
      <TaskModals labels={labels} members={members} />
    </Main>
  )
}
