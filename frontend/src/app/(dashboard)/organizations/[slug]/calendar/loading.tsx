import { Skeleton } from '@/shared/ui/core/skeleton'

export default function CalendarLoading() {
  return (
    <output aria-label='Loading calendar' role='status'>
      <div className='flex flex-wrap items-center gap-3 border-b pb-4'>
        <Skeleton className='h-9 w-18 rounded-md' />
        <Skeleton className='size-9 rounded-md' />
        <Skeleton className='size-9 rounded-md' />
        <Skeleton className='h-6 w-36' />
      </div>

      <div className='grid grid-cols-7 border-b'>
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className='flex justify-center border-r py-3 last:border-r-0'
          >
            <Skeleton className='h-4 w-8' />
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7'>
        {Array.from({ length: 35 }, (_, index) => (
          <div
            key={index}
            className='min-h-24 space-y-3 border-r border-b p-2 last:border-r-0 sm:min-h-32'
          >
            <Skeleton className='ml-auto size-5 rounded-full' />
            {index % 3 !== 0 && <Skeleton className='h-4 w-full rounded-sm' />}
            {index % 5 === 0 && <Skeleton className='h-4 w-3/4 rounded-sm' />}
          </div>
        ))}
      </div>
    </output>
  )
}
