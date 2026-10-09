'use client'

import { SearchInput } from '@/shared/ui/search-input'

type DeckCardListHeaderProps = {
  totalCardCount: number
  search: string
  isSearchPending: boolean
  onSearchChange: (value: string) => void
}

export function DeckCardListHeader({
  totalCardCount,
  search,
  isSearchPending,
  onSearchChange,
}: DeckCardListHeaderProps) {
  return (
    <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div>
        <h2 id='deck-cards-title' className='text-xl font-semibold'>
          Cards in this deck
        </h2>

        <p className='text-muted-foreground mt-1 text-sm'>
          {totalCardCount} terms
        </p>
      </div>

      <SearchInput
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder='Search terms or definitions'
        aria-label='Search cards'
        isPending={isSearchPending}
        wrapperClassName='sm:max-w-sm'
      />
    </div>
  )
}
