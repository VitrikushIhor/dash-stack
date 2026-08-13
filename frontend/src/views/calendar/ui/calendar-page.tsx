'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useActiveOrganization } from '@/entities/organization'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { type TCalendarView } from '@/features/task-calendar'
import { CalendarView } from '@/widgets/calendar-view'
import { Main } from '@/widgets/layout'
import { getVisibleRange } from '../lib/get-visible-range'

export function CalendarPage() {
  const searchParams = useSearchParams()
  const viewParam = searchParams?.get('view')
  const dateParam = searchParams?.get('date')

  const initialView = (viewParam as TCalendarView) || 'month'
  const initialDate = useMemo(
    () => (dateParam ? new Date(dateParam) : new Date()),
    [dateParam]
  )

  const { activeOrg } = useActiveOrganization()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeOrgId = activeOrg?.id
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const range = useMemo(
    () => getVisibleRange(initialView, initialDate),
    [initialView, initialDate]
  )

  const paginatedTasks = { data: [] }
  const isLoading = false
  const tasks = paginatedTasks?.data || []

  const members: never[] = []
  const membersLoading = false

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
