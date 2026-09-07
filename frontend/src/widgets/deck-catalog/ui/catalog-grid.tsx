import Link from 'next/link'
import { BookOpen, Compass } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { EmptyState } from '@/shared/ui/feedback'
import { type Deck, DeckCard } from '@/entities/deck'

interface CatalogGridProps {
  decks: Deck[]
  currentQuery?: string
  currentLevel?: string
  currentLanguage?: string
  currentTags?: string[]
  onResetFilters: () => void
  children?: React.ReactNode
}

export function CatalogGrid({
  decks,
  currentQuery = '',
  currentLevel,
  currentLanguage,
  currentTags = [],
  onResetFilters,
  children,
}: CatalogGridProps) {
  const isShowReset =
    currentQuery || currentLevel || currentLanguage || currentTags.length > 0

  if (decks.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title='No public decks found'
        description='No public decks matched your search filters. Try selecting another level or clearing your keyword.'
        action={
          isShowReset ? (
            <Button variant='outline' size='sm' onClick={onResetFilters}>
              Reset Filters
            </Button>
          ) : null
        }
      />
    )
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            href={ROUTES.vocabDeckStudy(deck.id)}
          >
            <DeckCard.Header>
              <DeckCard.Badges />
            </DeckCard.Header>
            <DeckCard.Content />
            <DeckCard.Footer>
              <Button asChild size='sm' className='h-8 gap-1.5 shadow-sm'>
                <Link href={ROUTES.vocabDeckStudy(deck.id)}>
                  <BookOpen className='h-3.5 w-3.5' />
                  <span>Study</span>
                </Link>
              </Button>
            </DeckCard.Footer>
          </DeckCard>
        ))}
      </div>
      {children}
    </>
  )
}
