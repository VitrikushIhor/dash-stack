import Link from 'next/link'
import { BookOpen, Layers } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { EmptyState } from '@/shared/ui/feedback/empty-state'
import { type Deck, DeckCard } from '@/entities/deck'
import { DeckStatusBadge } from '@/entities/deck/ui/deck-status-badge'
import { CreateDeckDialog, MyDeckCardActions } from '@/features/manage-deck'
import type { FilterTab } from '../model/use-my-decks-filter'

interface MyDecksListProps {
  decks: Deck[]
  activeTab: FilterTab
  hasSearchQuery: boolean
}

export function MyDecksList({
  decks,
  activeTab,
  hasSearchQuery,
}: MyDecksListProps) {
  if (decks.length === 0) {
    const isArchived = activeTab === 'ARCHIVED'

    let title = 'No vocabulary decks yet'
    let description =
      'Create your first deck with custom flashcards, images, and examples to start learning.'

    if (hasSearchQuery) {
      title = 'No matching decks found'
      description = 'Try modifying your search term or clearing the filter.'
    } else if (isArchived) {
      title = 'No archived decks'
      description = 'You currently have no archived decks.'
    }

    return (
      <EmptyState
        icon={Layers}
        title={title}
        description={description}
        action={
          !hasSearchQuery && !isArchived ? (
            <CreateDeckDialog triggerButton={true} />
          ) : undefined
        }
      />
    )
  }

  return (
    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          href={ROUTES.vocabDeckEdit(deck.id)}
          statusBadgeSlot={<DeckStatusBadge status={deck.status} />}
          footerActionsSlot={
            <Button asChild size='sm' className='h-8 gap-1.5 shadow-sm'>
              <Link href={ROUTES.vocabDeckStudy(deck.id)}>
                <BookOpen className='h-3.5 w-3.5' />
                <span>Study</span>
              </Link>
            </Button>
          }
          dropdownActionsSlot={<MyDeckCardActions deck={deck} />}
        />
      ))}
    </div>
  )
}
