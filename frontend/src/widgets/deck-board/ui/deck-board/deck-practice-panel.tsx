'use client'

import Link from 'next/link'
import { BookOpen, Check, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/ui/core/alert'
import { Button } from '@/shared/ui/core/button'
import { Checkbox } from '@/shared/ui/core/checkbox'
import { MIN_MATCH_CARDS } from '@/features/study-vocab'
import { getStudySessionHref } from '@/widgets/deck-board/lib/get-study-session-href'

type StudyFilterValues = {
  onlyDue: boolean
  onlyStarred: boolean
}

type StudyFilterUpdate = {
  onlyDue?: boolean | null
  onlyStarred?: boolean | null
}

type DeckPracticePanelProps = {
  deckId: string
  dueCount: number
  filters: StudyFilterValues
  isAuthenticated: boolean
  isPending: boolean
  onFiltersChange: (filters: StudyFilterUpdate) => void
  selectedCount: number
  starredCount: number
}

export function DeckPracticePanel({
  deckId,
  dueCount,
  filters,
  isAuthenticated,
  isPending,
  onFiltersChange,
  selectedCount,
  starredCount,
}: DeckPracticePanelProps) {
  const selectedLabel = `${selectedCount} ${selectedCount === 1 ? 'card' : 'cards'} selected`

  return (
    <aside className='bg-card h-fit rounded-2xl border p-5 shadow-sm lg:sticky lg:top-6'>
      <div className='mb-5 flex items-center gap-3'>
        <div className='bg-primary/10 text-primary rounded-lg p-2'>
          <Sparkles />
        </div>
        <div>
          <h2 className='font-semibold'>Practice this deck</h2>
          <p className='text-muted-foreground text-sm'>
            Choose cards, then start a session
          </p>
        </div>
      </div>
      {isAuthenticated ? (
        <fieldset
          disabled={isPending}
          className='space-y-2'
          aria-label='Study filters'
        >
          <label className='hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-3'>
            <span className='flex items-center gap-3'>
              <Checkbox
                checked={filters.onlyDue}
                onCheckedChange={(value) =>
                  onFiltersChange({ onlyDue: value === true })
                }
              />
              Due only
            </span>
            <span className='text-muted-foreground text-sm'>{dueCount}</span>
          </label>
          <label className='hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-3'>
            <span className='flex items-center gap-3'>
              <Checkbox
                checked={filters.onlyStarred}
                onCheckedChange={(value) =>
                  onFiltersChange({ onlyStarred: value === true })
                }
              />
              Starred only
            </span>
            <span className='text-muted-foreground text-sm'>
              {starredCount}
            </span>
          </label>
          {filters.onlyDue || filters.onlyStarred ? (
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                onFiltersChange({ onlyDue: null, onlyStarred: null })
              }
            >
              Use all cards
            </Button>
          ) : null}
        </fieldset>
      ) : (
        <Alert>
          <AlertDescription>
            Sign in to study due or starred cards. You can study all cards as a
            guest.
          </AlertDescription>
        </Alert>
      )}
      <p className='mt-5 text-sm font-medium'>{selectedLabel}</p>
      <div className='mt-3 grid gap-2'>
        {selectedCount > 0 ? (
          <>
            <Button asChild>
              <Link href={getStudySessionHref(deckId, 'flashcards', filters)}>
                <BookOpen /> Flashcards
              </Link>
            </Button>
            <Button asChild variant='secondary'>
              <Link href={getStudySessionHref(deckId, 'learn', filters)}>
                <Check /> Learn
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button disabled>Flashcards</Button>
            <Button disabled variant='secondary'>
              Learn
            </Button>
          </>
        )}
        {selectedCount >= MIN_MATCH_CARDS ? (
          <Button asChild variant='outline'>
            <Link href={getStudySessionHref(deckId, 'match', filters)}>
              Match
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            variant='outline'
            aria-label={`Match requires ${MIN_MATCH_CARDS} cards`}
          >
            Match requires {MIN_MATCH_CARDS} cards
          </Button>
        )}
      </div>
    </aside>
  )
}
