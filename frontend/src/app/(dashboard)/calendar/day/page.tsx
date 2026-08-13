import { Suspense } from 'react'
import { CalendarDayPage } from '@/views/calendar/ui/calendar-day-page'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { Skeleton } from '@/shared/ui/core/skeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarDayRoute({ searchParams }: Props) {
  const { tasks, date } = await fetchCalendarTasks('day', searchParams)

  return (
    <Suspense
      fallback={
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-[600px] w-full' />
        </div>
      }
    >
      <CalendarDayPage tasks={tasks} initialDate={date} />
    </Suspense>
  )
}
