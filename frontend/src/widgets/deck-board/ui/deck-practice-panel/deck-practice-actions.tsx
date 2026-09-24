import Link from 'next/link'
import { BookOpen, Check } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { StudyMode } from '@/entities/vocab'
import { MIN_MATCH_CARDS } from '@/features/study-vocab'
import { getStudySessionHref } from '@/widgets/deck-board/lib/get-study-session-href'
import { type StudyFilterValues } from './deck-practice-filters'

type DeckPracticeActionsProps = {
  deckId: string
  filters: StudyFilterValues
  selectedCount: number
}

export const DeckPracticeActions = ({
  deckId,
  filters,
  selectedCount,
}: DeckPracticeActionsProps) => {
  const selectedLabel = `${selectedCount} ${
    selectedCount === 1 ? 'card' : 'cards'
  } selected`

  const hasSelectedCards = selectedCount > 0
  const canMatch = selectedCount >= MIN_MATCH_CARDS

  return (
    <>
      <p className='mt-5 text-sm font-medium'>{selectedLabel}</p>

      <div className='mt-3 grid gap-2'>
        {hasSelectedCards ? (
          <>
            <Button asChild>
              <Link
                href={getStudySessionHref(
                  deckId,
                  StudyMode.FLASHCARDS,
                  filters
                )}
              >
                <BookOpen />
                Flashcards
              </Link>
            </Button>

            <Button asChild variant='secondary'>
              <Link
                href={getStudySessionHref(deckId, StudyMode.LEARN, filters)}
              >
                <Check />
                Learn
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

        {canMatch ? (
          <Button asChild variant='outline'>
            <Link href={getStudySessionHref(deckId, StudyMode.MATCH, filters)}>
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
    </>
  )
}
