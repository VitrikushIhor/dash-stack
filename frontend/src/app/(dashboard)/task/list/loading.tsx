import { Skeleton } from '@/shared/ui/core/skeleton'

export default function ListLoading() {
  return (
    <div className='w-full space-y-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-9 w-72' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>

      <div className='space-y-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='bg-card flex flex-col justify-between gap-4 rounded-lg border p-4 shadow-xs sm:flex-row sm:items-center'
          >
            <div className='flex-1 space-y-3'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-5 w-48' />
                <Skeleton className='h-5 w-16 rounded-full' />
              </div>
              <Skeleton className='h-4 w-1/4' />
            </div>

            <div className='flex items-center justify-between gap-6 sm:w-1/3 sm:justify-end'>
              <div className='flex flex-col items-end gap-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
              </div>
              <Skeleton className='h-8 w-8 shrink-0 rounded-full' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
