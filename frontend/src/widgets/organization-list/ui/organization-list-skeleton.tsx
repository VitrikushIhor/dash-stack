import { Card, CardHeader } from '@/shared/ui/core/card'
import { Skeleton } from '@/shared/ui/core/skeleton'

export function OrganizationListSkeleton() {
  return (
    <div
      aria-busy='true'
      aria-label='Loading organizations'
      className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className='border-border/60 h-full shadow-xs'>
          <CardHeader className='p-5'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex min-w-0 flex-1 items-center gap-3.5'>
                <Skeleton className='h-11 w-11 shrink-0 rounded-lg' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                  <div className='flex items-center gap-3 pt-1'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-3 w-14' />
                  </div>
                </div>
              </div>
              <Skeleton className='mt-1 h-5 w-5 shrink-0 rounded-full' />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
