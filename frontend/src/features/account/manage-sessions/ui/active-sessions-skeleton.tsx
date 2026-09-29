import { Skeleton } from '@/shared/ui/core/skeleton'

export function ActiveSessionsSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading active sessions'
      className='space-y-3'
    >
      <span className='sr-only'>Loading active sessions…</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className='space-y-3 rounded-lg border p-4'>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-9 w-40' />
        </div>
      ))}
    </div>
  )
}
