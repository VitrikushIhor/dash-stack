import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { Skeleton } from '@/shared/ui/components/ui/skeleton'
import {
  CalendarProvider,
  DndProviderWrapper,
  memberToUser,
  taskToEvent,
  type TCalendarView,
} from '@/features/event-calendar'
import { useGetMembers, useOrgStore } from '@/features/organization'
import { useTasksQuery } from '@/features/task'
import { Header } from '@/widgets/layout/ui/header'
import { Main } from '@/widgets/layout/ui/main'
import { NavUser } from '@/widgets/layout/ui/nav-user'
import { getVisibleRange } from '../lib/get-visible-range'
import { CalendarContent } from './calendar-content'

export function CalendarPage() {
  const route = getRouteApi('/_authenticated/calendar')
  const search = route.useSearch()

  const initialView = (search.view as TCalendarView) || 'month'
  const initialDate = useMemo(
    () => (search.date ? new Date(search.date) : new Date()),
    [search.date]
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
    <CalendarProvider
      users={members.map(memberToUser)}
      events={tasks.map(taskToEvent)}
      view={initialView}
      selectedDate={initialDate}
    >
      <DndProviderWrapper>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <NavUser />
          </div>
        </Header>
        <Main>
          <CalendarContent />
        </Main>
      </DndProviderWrapper>
    </CalendarProvider>
  )
}
