import { Skeleton } from '@/shared/ui/core/skeleton'

export default function TableLoading() {
  return (
    <div className='w-full space-y-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-9 w-64' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>

      <div className='bg-card rounded-md border'>
        <div className='bg-muted/40 border-b p-3'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-5 w-8' />
            <Skeleton className='h-5 w-48' />
            <Skeleton className='ml-auto h-5 w-24' />
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-24' />
          </div>
        </div>

        <div className='divide-y'>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4 p-3'>
              <Skeleton className='h-5 w-8' />
              <div className='flex w-48 flex-col gap-2'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-4 w-2/3' />
              </div>
              <Skeleton className='ml-auto h-6 w-20 rounded-full' />
              <Skeleton className='h-5 w-32' />
              <div className='flex -space-x-2'>
                <Skeleton className='border-background h-8 w-8 rounded-full border-2' />
              </div>
              <Skeleton className='h-5 w-20' />
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-48' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-24' />
          <div className='flex gap-1'>
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
          </div>
        </div>
      </div>
    </div>
  )
}
