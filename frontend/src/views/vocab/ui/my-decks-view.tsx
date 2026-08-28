import React from 'react'
import { type Deck } from '@/entities/deck'
import { MyDecksGrid } from '@/widgets/deck-list'

interface MyDecksViewProps {
  initialDecks: Deck[]
}

export function MyDecksView({ initialDecks }: MyDecksViewProps) {
  return (
    <div className='container mx-auto max-w-7xl px-4 py-6 sm:px-6'>
      <MyDecksGrid initialDecks={initialDecks} />
    </div>
  )
}
