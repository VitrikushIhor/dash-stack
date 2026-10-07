import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/core/dialog'
import { Skeleton } from '@/shared/ui/core/skeleton'

export function UnsplashPickerSkeleton() {
  return (
    <DialogContent className='border-border/80 bg-card/95 max-h-[85vh] max-w-2xl overflow-y-auto backdrop-blur-xl sm:max-w-3xl'>
      <DialogHeader>
        <DialogTitle className='text-xl font-bold'>
          Choose Photo from Unsplash
        </DialogTitle>
        <DialogDescription>Loading photo picker...</DialogDescription>
      </DialogHeader>
      <div role='status' className='space-y-4 pt-2'>
        <span className='sr-only'>Loading photo picker...</span>
        <div aria-hidden='true' className='space-y-4'>
          <div className='flex gap-2'>
            <Skeleton className='h-9 flex-1' />
            <Skeleton className='h-9 w-20' />
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {['a', 'b', 'c', 'd'].map((key) => (
              <Skeleton key={key} className='h-6 w-20 rounded-full' />
            ))}
          </div>
          <div className='grid min-h-75 grid-cols-2 gap-3 py-3 sm:grid-cols-3'>
            {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
              <Skeleton key={key} className='aspect-4/3 w-full rounded-lg' />
            ))}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
