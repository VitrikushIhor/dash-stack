import { Suspense } from 'react'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { CalendarYearPage } from '@/views/calendar/ui/calendar-year-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function CalendarYearRoute({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className='flex flex-col gap-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-150 w-full' />
        </div>
      }
    >
      <CalendarYearPage searchParams={searchParams} />
    </Suspense>
  )
}
