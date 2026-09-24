import { Skeleton } from '@/shared/ui/core/skeleton'

type DeckCardListSkeletonProps = {
  count: number
  label: string
}

export function DeckCardListSkeleton({
  count,
  label,
}: DeckCardListSkeletonProps) {
  return (
    <output className='space-y-3 py-1' aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className='bg-card grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-center'
        >
          <Skeleton className='h-5 w-2/3' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-3 w-1/2' />
          </div>
          <Skeleton className='size-9 rounded-md' />
        </div>
      ))}
    </output>
  )
}
