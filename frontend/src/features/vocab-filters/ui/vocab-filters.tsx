'use client'

import React, { useTransition } from 'react'
import { Card } from '@/shared/ui/core/card'
import { Input } from '@/shared/ui/core/input'
import { SearchInput } from '@/shared/ui/search-input'
import { CEFRLevelEnum, normalizeDeckTag } from '@/entities/deck'
import { useVocabSearchParams } from '../model/use-search-params'

const CEFR_LEVELS = ['ALL', ...Object.values(CEFRLevelEnum)]

export function VocabFilters() {
  const [params, setParams] = useVocabSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentLevel = params.level || 'ALL'
  const [tagInput, setTagInput] = React.useState('')

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

  const handleLanguageChange = (value: string) => {
    startTransition(() => {
      setParams({ language: value || null, page: 1 }, { throttleMs: 300 })
    })
  }

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return

    event.preventDefault()
    const tag = normalizeDeckTag(tagInput)

    if (tag && !params.tags.includes(tag)) {
      startTransition(() => {
        setParams({ tags: [...params.tags, tag], page: 1 })
      })
    }
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    startTransition(() => {
      setParams({ tags: params.tags.filter((item) => item !== tag), page: 1 })
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

      <Input
        aria-label='Language'
        value={params.language ?? ''}
        onChange={(event) => handleLanguageChange(event.target.value)}
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
        {params.tags.map((tag) => (
          <button
            key={tag}
            type='button'
            onClick={() => handleRemoveTag(tag)}
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
