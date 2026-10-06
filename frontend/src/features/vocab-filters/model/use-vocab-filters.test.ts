import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useVocabFilters } from './use-vocab-filters'

const { filters, setFilters } = vi.hoisted(() => ({
  filters: {
    q: null as string | null,
    level: null as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null,
    language: null as string | null,
    tags: [] as string[],
    page: 1,
  },
  setFilters: vi.fn(),
}))

vi.mock('./use-search-params', () => ({
  useVocabSearchParams: () => [filters, setFilters],
}))

describe('useVocabFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    filters.q = null
    filters.level = null
    filters.language = null
    filters.tags = []
    filters.page = 1
  })

  it('resets pagination when a filter changes and throttles text fields', () => {
    const { result } = renderHook(() => useVocabFilters())

    act(() => {
      result.current.setSearchQuery('verbs')
      result.current.setLevel('B2')
      result.current.setLanguage('en')
    })

    expect(setFilters).toHaveBeenNthCalledWith(
      1,
      { q: 'verbs', page: 1 },
      { throttleMs: 300 }
    )
    expect(setFilters).toHaveBeenNthCalledWith(2, { level: 'B2', page: 1 })
    expect(setFilters).toHaveBeenNthCalledWith(
      3,
      { language: 'en', page: 1 },
      { throttleMs: 300 }
    )
  })

  it('normalizes tags, skips duplicates and clears all filter state', () => {
    filters.tags = ['verbs']
    const { result } = renderHook(() => useVocabFilters())

    act(() => {
      result.current.addTag(' #NOUNS ')
      result.current.addTag('#verbs')
      result.current.removeTag('verbs')
      result.current.resetFilters()
    })

    expect(setFilters).toHaveBeenNthCalledWith(1, {
      tags: ['verbs', 'nouns'],
      page: 1,
    })
    expect(setFilters).toHaveBeenNthCalledWith(2, {
      tags: [],
      page: 1,
    })
    expect(setFilters).toHaveBeenNthCalledWith(3, {
      q: null,
      level: null,
      language: null,
      tags: [],
      page: 1,
    })
  })

  it('exposes active-filter state and page navigation', () => {
    filters.q = 'verbs'
    const { result } = renderHook(() => useVocabFilters())

    expect(result.current.hasActiveFilters).toBe(true)

    act(() => result.current.setPage(3))

    expect(setFilters).toHaveBeenCalledWith({ page: 3 })
  })
})
