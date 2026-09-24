import { Skeleton } from '@/shared/ui/core/skeleton'
import { DeckCardListSkeleton } from '../deck-card-list/deck-card-list-skeleton'

export function DeckBoardSkeleton() {
  return (
    <main
      className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12'
      aria-busy='true'
      aria-label='Loading deck'
    >
      <div className='mb-8 flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-start lg:justify-between'>
        <div className='w-full max-w-3xl space-y-4'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-2/3' />
          <Skeleton className='h-5 w-full max-w-2xl' />
          <div className='flex gap-2'>
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='h-6 w-24 rounded-full' />
            <Skeleton className='h-6 w-16 rounded-full' />
          </div>
        </div>
        <Skeleton className='h-9 w-28' />
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)]'>
        <Skeleton className='min-h-105 rounded-2xl' />
        <Skeleton className='min-h-80 rounded-2xl' />
      </div>

      <section className='mt-10' aria-label='Loading cards'>
        <div className='mb-5 flex items-end justify-between gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-20' />
          </div>
          <Skeleton className='h-9 w-full sm:max-w-sm' />
        </div>
        <DeckCardListSkeleton count={3} label='Loading deck cards' />
      </section>
    </main>
  )
}
