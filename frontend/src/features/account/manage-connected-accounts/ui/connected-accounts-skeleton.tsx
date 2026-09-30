import { Skeleton } from '@/shared/ui/core/skeleton'

export function ConnectedAccountsSkeleton() {
  return (
    <output aria-label='Loading connected accounts' className='space-y-4'>
      <span className='sr-only'>Loading connected accounts...</span>
      {['google', 'github'].map((provider) => (
        <div
          key={provider}
          aria-hidden='true'
          className='flex items-center justify-between gap-4 rounded-lg border p-4'
        >
          <div className='space-y-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-4 w-28' />
          </div>
          <Skeleton className='h-9 w-36 rounded-md' />
        </div>
      ))}
    </output>
  )
}
