import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/core/tabs'
import { SearchInput } from '@/shared/ui/search-input'
import type { FilterTab } from '../model/use-my-decks-filter'

interface MyDecksFiltersProps {
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isPending?: boolean
  counts: { all: number; published: number; draft: number; archived: number }
}

export function MyDecksFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  isPending,
  counts,
}: MyDecksFiltersProps) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <Tabs
        value={activeTab}
        onValueChange={(val) => onTabChange(val as FilterTab)}
        className='w-full sm:w-auto'
      >
        <TabsList className='bg-muted/60 grid grid-cols-4 p-1 sm:w-auto'>
          <TabsTrigger value='ALL' className='text-xs'>
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value='PUBLISHED' className='text-xs'>
            Published ({counts.published})
          </TabsTrigger>
          <TabsTrigger value='DRAFT' className='text-xs'>
            Drafts ({counts.draft})
          </TabsTrigger>
          <TabsTrigger value='ARCHIVED' className='text-xs'>
            Archived ({counts.archived})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <SearchInput
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder='Filter your decks...'
        className='text-xs'
        wrapperClassName='sm:w-72'
        isPending={isPending}
      />
    </div>
  )
}
