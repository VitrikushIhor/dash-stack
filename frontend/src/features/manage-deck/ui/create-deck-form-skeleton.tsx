import { DialogFooter } from '@/shared/ui/core/dialog'
import { Skeleton } from '@/shared/ui/core/skeleton'

export function CreateDeckFormSkeleton() {
  return (
    <div role='status' className='space-y-4 py-2'>
      <span className='sr-only'>Loading deck form...</span>
      <div aria-hidden='true' className='space-y-4'>
        <div className='grid gap-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-9 w-full' />
        </div>
        <div className='grid gap-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-20 w-full' />
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='grid gap-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-9 w-full' />
          </div>
          <div className='grid gap-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-9 w-full' />
          </div>
        </div>
        <div className='grid gap-2'>
          <Skeleton className='h-4 w-10' />
          <Skeleton className='mt-1 h-9 w-full' />
          <Skeleton className='h-4 w-52 max-w-full' />
        </div>
        <DialogFooter className='pt-4'>
          <Skeleton className='h-9 w-full sm:w-20' />
          <Skeleton className='h-9 w-full sm:w-40' />
        </DialogFooter>
      </div>
    </div>
  )
}
