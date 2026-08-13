import { Skeleton } from '@/shared/ui/core/skeleton'

export default function CalendarLoading() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-150 w-full' />
    </div>
  )
}
