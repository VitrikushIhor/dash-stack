'use client'

import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { useCurrentUser } from '@/entities/user'
import { useDueReviews } from '@/entities/vocab'

export function GlobalDueCount() {
  const { data: user } = useCurrentUser()
  const { data, isError } = useDueReviews({ enabled: !!user })

  if (!user) return null

  if (isError)
    return (
      <span
        aria-label='Due reviews unavailable'
        title='Due reviews unavailable'
      >
        !
      </span>
    )

  if (!data) return null

  return (
    <span
      aria-label={`${data.totalDue} cards due for review`}
      title='Cards due for review'
    >
      {data.totalDue} due
    </span>
  )
}

export function ReviewQueue() {
  const { data: user } = useCurrentUser()
  const { data, isPending, isError, refetch } = useDueReviews({
    enabled: !!user,
  })
  const handleRetry = () => refetch()

  if (!user) return null
  return (
    <section
      id='due-reviews'
      aria-label='Due reviews'
      className='mb-6 space-y-3 rounded-xl border p-4'
    >
      <h2 className='text-lg font-semibold'>Due reviews</h2>
      {isError ? (
        <div role='alert'>
          Unable to load due reviews.{' '}
          <Button variant='outline' size='sm' onClick={handleRetry}>
            Try again
          </Button>
        </div>
      ) : isPending ? (
        <p role='status'>Loading due reviews…</p>
      ) : data?.totalDue === 0 ? (
        <p className='text-muted-foreground text-sm'>No cards due right now.</p>
      ) : (
        <ul className='flex flex-wrap gap-3'>
          {data?.perDeck
            .filter((deck) => deck.dueCount > 0)
            .map((deck) => (
              <li key={deck.deckId}>
                <Button asChild variant='outline'>
                  <Link
                    href={`${ROUTES.vocabDeckStudy(deck.deckId)}?onlyDue=true`}
                  >
                    {deck.deckTitle} · {deck.dueCount} due
                  </Link>
                </Button>
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}
