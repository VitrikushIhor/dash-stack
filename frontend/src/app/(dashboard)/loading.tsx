import { Skeleton } from '@/shared/ui/core/skeleton'
import { Main } from '@/widgets/layout'
import { OrganizationListSkeleton } from '@/widgets/organization-list'

export default function DashboardLoading() {
  return (
    <Main
      className='space-y-6'
      aria-busy='true'
      aria-label='Loading organizations'
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2.5'>
          <Skeleton className='size-10 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-40' />
            <Skeleton className='h-4 w-64 max-w-full' />
          </div>
        </div>
        <Skeleton className='h-10 w-40 rounded-md' />
      </div>
      <OrganizationListSkeleton />
    </Main>
  )
}
