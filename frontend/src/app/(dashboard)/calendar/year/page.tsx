import { Suspense } from 'react'
import { CalendarYearPage } from '@/views/calendar/ui/calendar-year-page'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { Skeleton } from '@/shared/ui/core/skeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarYearRoute({ searchParams }: Props) {
  const { tasks, date } = await fetchCalendarTasks('year', searchParams)

  return (
    <Suspense
      fallback={
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-[600px] w-full' />
        </div>
      }
    >
      <CalendarYearPage tasks={tasks} initialDate={date} />
    </Suspense>
  )
}
