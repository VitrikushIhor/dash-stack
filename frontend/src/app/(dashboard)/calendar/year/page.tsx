import { Suspense } from 'react'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { CalendarYearPage } from '@/views/calendar/ui/calendar-year-page'
import { Skeleton } from '@/shared/ui/core/skeleton'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarYearRoute({ searchParams }: Props) {
  const { tasks } = await fetchCalendarTasks('year', searchParams)

  return (
    <Suspense
      fallback={
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-150 w-full' />
        </div>
      }
    >
      <CalendarYearPage tasks={tasks} />
    </Suspense>
  )
}
