import React from 'react'
import { type PaginatedResult } from '@/shared/api'
import { type Deck } from '@/entities/deck'
import { PublicDeckCatalog } from '@/widgets/deck-catalog'

interface CatalogViewProps {
  initialData: PaginatedResult<Deck>
  q?: string
  level?: string
  page?: number
}

export function CatalogView({ initialData, q, level, page }: CatalogViewProps) {
  return (
    <div className='container mx-auto max-w-7xl px-4 py-6 sm:px-6'>
      <PublicDeckCatalog
        initialData={initialData}
        currentQuery={q}
        currentLevel={level}
        currentPage={page}
      />
    </div>
  )
}
