import { notFound } from 'next/navigation'
import { getOrganizationLabels } from '@/entities/label/server'
import {
  getOrganizationBySlug,
  getOrganizationMembers,
} from '@/entities/organization/server'
import { TaskHeaderActions, TaskModals } from '@/features/manage-task'
import { CalendarTabsNav } from '@/widgets/calendar-tabs-nav'
import { Main } from '@/widgets/layout'

interface CalendarLayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationCalendarLayout({
  children,
  params,
}: CalendarLayoutProps) {
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
      <div className='mb-6 flex flex-col gap-3'>
        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
          <div className='flex items-center space-x-2'>
            <CalendarTabsNav slug={slug} />
            <TaskHeaderActions />
          </div>
        </div>
      </div>

      <div className='bg-card rounded-xl border p-4 shadow-sm'>{children}</div>

      <TaskModals slug={slug} labels={labels} members={members} />
    </Main>
  )
}
