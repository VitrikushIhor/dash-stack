'use client'

import { DeckPracticeActions } from './deck-practice-actions'
import {
  DeckPracticeFilters,
  type StudyFilterUpdate,
  type StudyFilterValues,
} from './deck-practice-filters'
import { DeckPracticeHeader } from './deck-practice-header'

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

export const DeckPracticePanel = ({
  deckId,
  dueCount,
  filters,
  isAuthenticated,
  isPending,
  onFiltersChange,
  selectedCount,
  starredCount,
}: DeckPracticePanelProps) => {
  return (
    <aside className='bg-card h-fit rounded-2xl border p-5 shadow-sm lg:sticky lg:top-6'>
      <DeckPracticeHeader />

      <DeckPracticeFilters
        dueCount={dueCount}
        starredCount={starredCount}
        filters={filters}
        isAuthenticated={isAuthenticated}
        isPending={isPending}
        onFiltersChange={onFiltersChange}
      />

      <DeckPracticeActions
        deckId={deckId}
        filters={filters}
        selectedCount={selectedCount}
      />
    </aside>
  )
}
