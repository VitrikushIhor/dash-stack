'use client'

import { useTransition } from 'react'
import {
  type CEFRLevelEnum as CEFRLevel,
  normalizeDeckTag,
} from '@/entities/deck'
import { useVocabSearchParams } from './use-search-params'

export function useVocabFilters() {
  const [filters, setFilters] = useVocabSearchParams()
  const [isPending, startTransition] = useTransition()

  const setSearchQuery = (value: string) => {
    startTransition(() => {
      void setFilters({ q: value || null, page: 1 }, { throttleMs: 300 })
    })
  }

  const setLevel = (level: 'ALL' | CEFRLevel) => {
    startTransition(() => {
      void setFilters({ level: level === 'ALL' ? null : level, page: 1 })
    })
  }

  const setLanguage = (value: string) => {
    startTransition(() => {
      void setFilters({ language: value || null, page: 1 }, { throttleMs: 300 })
    })
  }

  const addTag = (value: string) => {
    const tag = normalizeDeckTag(value)

    if (!tag || filters.tags.includes(tag)) return

    startTransition(() => {
      void setFilters({ tags: [...filters.tags, tag], page: 1 })
    })
  }

  const removeTag = (tag: string) => {
    startTransition(() => {
      void setFilters({
        tags: filters.tags.filter((item) => item !== tag),
        page: 1,
      })
    })
  }

  const setPage = (page: number) => {
    startTransition(() => {
      void setFilters({ page })
    })
  }

  const resetFilters = () => {
    startTransition(() => {
      void setFilters({
        q: null,
        level: null,
        language: null,
        tags: [],
        page: 1,
      })
    })
  }

  const hasActiveFilters = Boolean(
    filters.q || filters.level || filters.language || filters.tags.length > 0
  )

  return {
    filters,
    hasActiveFilters,
    isPending,
    setSearchQuery,
    setLevel,
    setLanguage,
    addTag,
    removeTag,
    setPage,
    resetFilters,
  }
}
