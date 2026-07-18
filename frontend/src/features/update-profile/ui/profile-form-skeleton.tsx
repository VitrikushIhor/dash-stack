import { Skeleton } from '@/shared/ui/core/skeleton'

export function ProfileFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Avatar */}
      <div className='flex items-center space-x-4'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </div>

      {/* Name fields */}
      <div className='grid grid-cols-2 gap-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Email */}
      <Skeleton className='h-10 w-full' />

      {/* Bio */}
      <Skeleton className='h-20 w-full' />

      {/* URLs list */}
      <div className='space-y-2'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-1/3' />
      </div>

      {/* Save button placeholder */}
      <div className='flex justify-end'>
        <Skeleton className='h-10 w-24' />
      </div>
    </div>
  )
}
