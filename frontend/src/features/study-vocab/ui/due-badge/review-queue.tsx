'use client'

import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { useCurrentUserState } from '@/entities/user'
import { useDueReviews } from '@/entities/vocab'

function useDueReviewsState() {
  const { authState, refetch: retryIdentity } = useCurrentUserState()
  const { data, isError, isPending, refetch } = useDueReviews({
    enabled: authState.status === 'authenticated',
  })

  return { authState, retryIdentity, data, isError, isPending, refetch }
}

function ReviewQueueContent({
  state,
}: {
  state: ReturnType<typeof useDueReviewsState>
}) {
  const { authState, retryIdentity, data, isPending, isError, refetch } = state

  if (authState.status === 'error') {
    return (
      <WidgetErrorState
        title='Could not check your session'
        description={authState.message}
        onRetry={() => void retryIdentity()}
      />
    )
  }

  if (authState.status === 'loading' || isPending) {
    return <ReviewQueueSkeleton />
  }

  if (isError) {
    return (
      <WidgetErrorState
        title='Could not load due reviews'
        description='Review information is temporarily unavailable.'
        onRetry={() => void refetch()}
      />
    )
  }

  if (!data || data.totalDue === 0) {
    return (
      <p className='text-muted-foreground text-sm'>No cards due right now.</p>
    )
  }

  return (
    <ul className='flex flex-wrap gap-3'>
      {data.perDeck
        .filter((deck) => deck.dueCount > 0)
        .map((deck) => (
          <li key={deck.deckId}>
            <Button asChild variant='outline'>
              <Link href={`${ROUTES.vocabDeckStudy(deck.deckId)}?onlyDue=true`}>
                {deck.deckTitle} · {deck.dueCount} due
              </Link>
            </Button>
          </li>
        ))}
    </ul>
  )
}

function ReviewQueueSkeleton() {
  return (
    <output className='space-y-3 py-1' aria-label='Loading due reviews'>
      <Skeleton className='h-4 w-48' />
      <div className='flex gap-3'>
        <Skeleton className='h-9 w-36 rounded-md' />
        <Skeleton className='h-9 w-32 rounded-md' />
      </div>
    </output>
  )
}

export function GlobalDueCount() {
  const { authState, data, isError } = useDueReviewsState()

  if (authState.status === 'loading') {
    return (
      <Skeleton
        className='h-4 w-12 rounded-full'
        aria-label='Loading review count'
      />
    )
  }

  if (authState.status === 'guest') return null

  if (authState.status === 'error') {
    return (
      <WidgetErrorState
        size='compact'
        title='Session unavailable'
        description={authState.message}
        className='border-0 bg-transparent p-0 shadow-none'
      />
    )
  }

  if (isError)
    return (
      <WidgetErrorState
        size='compact'
        title='Review count unavailable'
        description='Could not load due reviews.'
        className='border-0 bg-transparent p-0 shadow-none'
      />
    )

  if (!data) return null

  return (
    <Badge
      aria-label={`${data.totalDue} cards due for review`}
      title='Cards due for review'
    >
      {data.totalDue} due
    </Badge>
  )
}

export function ReviewQueue() {
  const state = useDueReviewsState()

  if (state.authState.status === 'guest') return null

  return (
    <section
      id='due-reviews'
      aria-label='Due reviews'
      className='mb-6 space-y-3 rounded-xl border p-4'
    >
      <h2 className='text-lg font-semibold'>Due reviews</h2>
      <ReviewQueueContent state={state} />
    </section>
  )
}
