'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConfigDrawer, Search, ThemeSwitch } from '@/shared/ui'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { useGetMembers, useOrgStore } from '@/entities/organization'
import { useTasksQuery } from '@/entities/task'
import { type TCalendarView } from '@/features/event-calendar'
import { CalendarView } from '@/widgets/calendar-view'
import { Header, Main, NavUser } from '@/widgets/layout'
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

  const { activeOrgId } = useOrgStore()

  const range = useMemo(
    () => getVisibleRange(initialView, initialDate),
    [initialView, initialDate]
  )

  const { data: tasks = [], isLoading } = useTasksQuery(
    activeOrgId || '',
    range
  )

  const { data: members = [], isLoading: membersLoading } = useGetMembers(
    activeOrgId || ''
  )

  if (isLoading || membersLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-[600px] w-full' />
      </div>
    )
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser />
        </div>
      </Header>
      <Main>
        <CalendarView
          tasks={tasks}
          members={members}
          initialView={initialView}
          initialDate={initialDate}
        />
      </Main>
    </>
  )
}
