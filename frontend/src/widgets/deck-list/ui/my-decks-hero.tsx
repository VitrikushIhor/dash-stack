import React from 'react'
import { CreateDeckDialog } from '@/features/manage-deck'

export function MyDecksHero() {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
          My Vocabulary Decks
        </h1>
        <p className='text-muted-foreground text-sm'>
          Manage, edit, and master your flashcard collections with spaced
          repetition.
        </p>
      </div>

      <CreateDeckDialog />
    </div>
  )
}
