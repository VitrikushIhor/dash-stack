'use client'

import { type KeyboardEvent, useState } from 'react'
import { Card } from '@/shared/ui/core/card'
import { Input } from '@/shared/ui/core/input'
import { SearchInput } from '@/shared/ui/search-input'
import { CEFRLevelEnum } from '@/entities/deck'
import { useVocabFilters } from '../model/use-vocab-filters'

const CEFR_LEVELS = ['ALL', ...Object.values(CEFRLevelEnum)] as const

export function VocabFilters() {
  const {
    filters,
    isPending,
    setSearchQuery,
    setLevel,
    setLanguage,
    addTag,
    removeTag,
  } = useVocabFilters()

  const currentLevel = filters.level ?? 'ALL'
  const [tagInput, setTagInput] = useState('')

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return

    event.preventDefault()
    addTag(tagInput)
    setTagInput('')
  }

  return (
    <Card className='border-border/60 bg-card/60 flex flex-col gap-4 p-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between'>
      <SearchInput
        value={filters.q ?? ''}
        onChange={(event) => setSearchQuery(event.target.value)}
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
            onClick={() => setLevel(lvl)}
            aria-pressed={currentLevel === lvl}
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

      <Input
        aria-label='Language'
        value={filters.language ?? ''}
        onChange={(event) => setLanguage(event.target.value)}
        placeholder='Language, e.g. en'
        className='sm:w-36'
      />

      <div className='flex min-w-48 flex-1 flex-wrap items-center gap-1.5'>
        <Input
          aria-label='Tags'
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder='Add tag and press Enter'
          className='min-w-44 flex-1'
        />
        {filters.tags.map((tag) => (
          <button
            key={tag}
            type='button'
            onClick={() => removeTag(tag)}
            className='bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium'
            aria-label={`Remove tag ${tag}`}
          >
            #{tag} ×
          </button>
        ))}
      </div>
    </Card>
  )
}
