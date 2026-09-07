import React from 'react'
import { type PaginatedResult } from '@/shared/api'
import { type Deck } from '@/entities/deck'
import { PublicDeckCatalog } from '@/widgets/deck-catalog'

interface CatalogViewProps {
  initialData: PaginatedResult<Deck>
  q?: string
  level?: string
  language?: string
  tags?: string[]
  page?: number
}

export const CatalogView = ({
  initialData,
  q,
  level,
  language,
  tags,
  page,
}: CatalogViewProps) => {
  return (
    <div className='container mx-auto max-w-7xl px-4 py-6 sm:px-6'>
      <PublicDeckCatalog
        initialData={initialData}
        currentQuery={q}
        currentLevel={level}
        currentLanguage={language}
        currentTags={tags}
        currentPage={page}
      />
    </div>
  )
}
