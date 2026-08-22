'use client'

import React, { useTransition } from 'react'
import { Card } from '@/shared/ui/core/card'
import { SearchInput } from '@/shared/ui/search-input'
import { CEFRLevelEnum } from '@/entities/deck'
import { useVocabSearchParams } from '../model/use-search-params'

const CEFR_LEVELS = ['ALL', ...Object.values(CEFRLevelEnum)]

export function VocabFilters() {
  const [params, setParams] = useVocabSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentLevel = params.level || 'ALL'

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setParams({ q: value || null, page: 1 }, { throttleMs: 300 })
    })
  }

  const handleLevelChange = (lvl: string) => {
    startTransition(() => {
      setParams({ level: lvl === 'ALL' ? null : lvl, page: 1 })
    })
  }

  return (
    <Card className='border-border/60 bg-card/60 flex flex-col gap-4 p-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between'>
      <SearchInput
        value={params.q ?? ''}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder='Search decks by keyword or topic...'
        className='text-xs'
        wrapperClassName='sm:w-80'
        isPending={isPending}
      />

      <div className='flex flex-wrap items-center gap-1.5 overflow-x-auto'>
        {CEFR_LEVELS.map((lvl) => (
          <button
            key={lvl}
            type='button'
            onClick={() => handleLevelChange(lvl)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              currentLevel === lvl
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {lvl === 'ALL' ? 'All Levels' : lvl}
          </button>
        ))}
      </div>
    </Card>
  )
}
