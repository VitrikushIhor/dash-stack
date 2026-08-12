'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { useGetMembers, useActiveOrganization } from '@/entities/organization'
import { useTasksQuery } from '@/entities/task'
import { type TCalendarView } from '@/features/event-calendar'
import { CalendarView } from '@/widgets/calendar-view'
import { Main } from '@/widgets/layout'
import { getVisibleRange } from '../lib/get-visible-range'

export function CalendarPage() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view')
  const dateParam = searchParams.get('date')

  const initialView = (viewParam as TCalendarView) || 'month'
  const initialDate = useMemo(
    () => (dateParam ? new Date(dateParam) : new Date()),
    [dateParam]
  )

  const { activeOrg } = useActiveOrganization()
  const activeOrgId = activeOrg?.id

  const range = useMemo(
    () => getVisibleRange(initialView, initialDate),
    [initialView, initialDate]
  )

  const { data: paginatedTasks, isLoading } = useTasksQuery(activeOrgId || '', {
    ...range,
    page: 1,
    perPage: 100,
  })
  const tasks = paginatedTasks?.data || []

  const { data: members = [], isLoading: membersLoading } = useGetMembers(
    activeOrgId || ''
  )

  if (isLoading || membersLoading) {
    return (
      <Main className='flex flex-col gap-4'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-[600px] w-full' />
      </Main>
    )
  }

  return (
    <Main>
      <CalendarView
        tasks={tasks}
        members={members}
        initialView={initialView}
        initialDate={initialDate}
      />
    </Main>
  )
}
