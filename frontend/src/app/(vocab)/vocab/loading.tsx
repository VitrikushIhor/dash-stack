import { Skeleton } from '@/shared/ui/core/skeleton'
import { DeckCardSkeleton } from '@/entities/deck'

export default function VocabLoading() {
  return (
    <div className='flex flex-col gap-6 py-4'>
      <div className='mb-2 flex flex-col gap-3'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-5 w-full max-w-lg' />
      </div>
      <div className='border-border/60 bg-card/60 flex flex-col gap-4 rounded-xl border p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-24 rounded-md' />
          <Skeleton className='h-9 w-24 rounded-md' />
          <Skeleton className='h-9 w-24 rounded-md' />
        </div>
        <Skeleton className='h-9 w-full rounded-md sm:w-64' />
      </div>
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <DeckCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
