import { Suspense } from 'react'
import { CalendarAgendaPage } from '@/views/calendar/ui/calendar-agenda-page'
import { fetchCalendarTasks } from '@/views/calendar/lib/fetch-calendar-tasks.server'
import { Skeleton } from '@/shared/ui/core/skeleton'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CalendarAgendaRoute({ searchParams }: Props) {
  const { tasks, date } = await fetchCalendarTasks('agenda', searchParams)

  return (
    <Suspense
      fallback={
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-[600px] w-full' />
        </div>
      }
    >
      <CalendarAgendaPage tasks={tasks} initialDate={date} />
    </Suspense>
  )
}
