'use client'

import React, { useTransition } from 'react'
import { type PaginatedResult } from '@/shared/api'
import { type Deck } from '@/entities/deck'
import { VocabFilters, useVocabSearchParams } from '@/features/vocab-filters'
import { CatalogGrid } from './catalog-grid'
import { CatalogHero } from './catalog-hero'
import { CatalogPagination } from './catalog-pagination'

interface PublicDeckCatalogProps {
  initialData: PaginatedResult<Deck>
  currentQuery?: string
  currentLevel?: string
  currentPage?: number
}

export function PublicDeckCatalog({
  initialData,
  currentQuery = '',
  currentLevel,
  currentPage = 1,
}: PublicDeckCatalogProps) {
  const [, setParams] = useVocabSearchParams()
  const [isPending, startTransition] = useTransition()

  const decks = initialData.data || []
  const totalPages = initialData.meta?.lastPage || 1
  const totalResults = initialData.meta?.total || 0

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setParams({ page: newPage })
    })
  }

  const handleResetFilters = () => {
    startTransition(() => {
      setParams({ q: null, level: null, page: 1 })
    })
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
          currentQuery={currentQuery}
          currentLevel={currentLevel}
          onResetFilters={handleResetFilters}
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
