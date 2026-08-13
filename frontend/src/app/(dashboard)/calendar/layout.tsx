import { redirect } from 'next/navigation'
import { getOrganizationLabels } from '@/entities/label/server'
import {
  getActiveOrganization,
  getOrganizationMembers,
} from '@/entities/organization/server'
import { TaskHeaderActions, TaskModals } from '@/features/manage-task'
import { TaskToolbar } from '@/features/task-filters'
import { CalendarTabsNav } from '@/widgets/calendar-tabs-nav'
import { Main } from '@/widgets/layout'

export default async function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeOrgResult = await getActiveOrganization()
  const activeOrgId = activeOrgResult.activeOrg?.id

  if (!activeOrgId) {
    redirect('/')
  }

  const [membersResult, labelsResult] = await Promise.all([
    getOrganizationMembers(activeOrgId),
    getOrganizationLabels(activeOrgId),
  ])

  const members = membersResult.data || []
  const labels = labelsResult.data || []

  return (
    <Main>
      <div className='mb-6 flex flex-col gap-3'>
        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
          <div className='flex items-center space-x-2'>
            <CalendarTabsNav />
            <TaskHeaderActions />
          </div>
        </div>
      </div>

      <div className='mb-4'>
        <TaskToolbar labels={labels} members={members} />
      </div>

      <div className='bg-card rounded-xl border p-4 shadow-sm'>{children}</div>

      <TaskModals labels={labels} members={members} />
    </Main>
  )
}
