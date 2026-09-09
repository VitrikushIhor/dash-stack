'use client'

import { type Deck } from '@/entities/deck'
import { type DeckCardsPage } from '@/entities/vocab'
import { useDeckBoardViewModel } from '../model/use-deck-board-view-model'
import { DeckBoardHeader } from './deck-board/deck-board-header'
import { DeckCardList } from './deck-board/deck-card-list'
import { DeckCardPreview } from './deck-board/deck-card-preview'
import { DeckPracticePanel } from './deck-board/deck-practice-panel'

type DeckBoardViewProps = {
  deck: Deck
  initialCardsPage: DeckCardsPage
  isAuthenticated: boolean
  isOwner: boolean
}

export function DeckBoardView({
  deck,
  initialCardsPage,
  isAuthenticated,
  isOwner,
}: DeckBoardViewProps) {
  const viewModel = useDeckBoardViewModel({
    deckId: deck.id,
    initialCardsPage,
    initialCardCount: deck.cardCount,
    isAuthenticated,
  })

  return (
    <main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12'>
      <DeckBoardHeader
        deck={deck}
        cardCount={viewModel.cardCount}
        isOwner={isOwner}
      />

      <section className='grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)]'>
        <DeckCardPreview
          {...viewModel.preview}
          isAuthenticated={isAuthenticated}
        />
        <DeckPracticePanel
          {...viewModel.practice}
          deckId={deck.id}
          isAuthenticated={isAuthenticated}
        />
      </section>

      <DeckCardList
        {...viewModel.cardList}
        cardCount={viewModel.cardCount}
        isAuthenticated={isAuthenticated}
      />
    </main>
  )
}
