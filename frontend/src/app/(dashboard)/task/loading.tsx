import { Skeleton } from '@/shared/ui/core/skeleton'

export default function KanbanLoading() {
  return (
    <div className='w-full space-y-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-9 w-64' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>

      <div className='grid h-[calc(100vh-12rem)] auto-rows-fr grid-cols-3 gap-6 pb-4'>
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div
            key={colIdx}
            className='bg-muted/30 flex h-full flex-col gap-4 rounded-xl p-3'
          >
            <div className='flex items-center justify-between'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-5 w-8 rounded-full' />
            </div>

            <div className='flex flex-col gap-3'>
              {Array.from({ length: 3 }).map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className='bg-card rounded-lg border p-4 shadow-xs'
                >
                  <div className='mb-3 flex items-start justify-between gap-2'>
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-5 w-5 rounded-full' />
                  </div>
                  <Skeleton className='mb-4 h-4 w-1/3' />

                  <div className='mt-2 flex items-center justify-between'>
                    <Skeleton className='h-5 w-16 rounded-sm' />
                    <Skeleton className='h-8 w-8 rounded-full' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
