import { Card, CardContent, CardHeader } from '@/shared/ui/core/card'
import { Skeleton } from '@/shared/ui/core/skeleton'

export function MemberDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-9 w-9 rounded-lg' />
        <Skeleton className='h-8 w-48' />
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-start gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-4 w-52' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-5 w-20 rounded-full' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-5 w-28' />
            </div>
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-5 w-24' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
