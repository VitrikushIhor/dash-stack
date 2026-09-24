'use client'

import React from 'react'
import { type Deck } from '@/entities/deck'
import { DeleteDeckModal } from '@/features/manage-deck'
import { useMyDecksFilter } from '../model/use-my-decks-filter'
import { MyDecksFilters } from './my-decks-filters'
import { MyDecksHero } from './my-decks-hero'
import { MyDecksList } from './my-decks-list'

interface MyDecksGridProps {
  initialDecks: Deck[]
}

export function MyDecksGrid({ initialDecks }: MyDecksGridProps) {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isPending,
    filteredDecks,
    counts,
  } = useMyDecksFilter(initialDecks)

  return (
    <div className='space-y-6'>
      <MyDecksHero />

      <MyDecksFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isPending={isPending}
        counts={counts}
      />

      <MyDecksList
        decks={filteredDecks}
        activeTab={activeTab}
        hasSearchQuery={!!searchQuery.trim()}
      />

      <DeleteDeckModal decks={initialDecks} />
    </div>
  )
}
