import { Card, CardContent } from '@/shared/ui/core/card'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { Main } from '@/widgets/layout'

export default function OrganizationDetailLoading() {
  return (
    <Main>
      <div className='space-y-6'>
        {/* Header Skeleton */}
        <div className='flex items-center gap-4'>
          <Skeleton className='h-9 w-9 rounded-lg' />
          <Skeleton className='h-12 w-12 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-48 sm:w-64' />
            <Skeleton className='h-4 w-28' />
          </div>
        </div>

        {/* Tabs Navigation Skeleton */}
        <div className='space-y-4'>
          <div className='flex gap-2 border-b pb-2'>
            <Skeleton className='h-9 w-24 rounded-lg' />
            <Skeleton className='h-9 w-28 rounded-lg' />
            <Skeleton className='h-9 w-24 rounded-lg' />
            <Skeleton className='h-9 w-24 rounded-lg' />
          </div>

          {/* Content Skeleton: Stats / Overview */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-8 w-16' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Large Card Content Skeleton */}
          <Card>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Main>
  )
}
