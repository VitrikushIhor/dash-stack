'use client'

import { type PaginatedResult } from '@/shared/api'
import { type Deck } from '@/entities/deck'
import { VocabFilters, useVocabFilters } from '@/features/vocab-filters'
import { CatalogGrid } from './catalog-grid'
import { CatalogHero } from './catalog-hero'
import { CatalogPagination } from './catalog-pagination'

interface PublicDeckCatalogProps {
  initialData: PaginatedResult<Deck>
  currentPage?: number
  isAuthenticated?: boolean
}

export function PublicDeckCatalog({
  initialData,
  currentPage = 1,
  isAuthenticated = false,
}: PublicDeckCatalogProps) {
  const { hasActiveFilters, isPending, setPage, resetFilters } =
    useVocabFilters()

  const decks = initialData.data || []
  const totalPages = initialData.meta?.lastPage || 1
  const totalResults = initialData.meta?.total || 0
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className='space-y-6'>
      <CatalogHero />
      <VocabFilters />
      <div
        className={`transition-opacity duration-200 ${
          isPending ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <CatalogGrid
          decks={decks}
          isAuthenticated={isAuthenticated}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        >
          <CatalogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            isPending={isPending}
            onPageChange={handlePageChange}
          />
        </CatalogGrid>
      </div>
    </div>
  )
}
