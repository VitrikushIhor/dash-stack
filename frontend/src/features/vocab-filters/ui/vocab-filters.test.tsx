import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VocabFilters } from './vocab-filters'

const { filters, actions } = vi.hoisted(() => ({
  filters: {
    q: null as string | null,
    level: null as string | null,
    language: null as string | null,
    tags: [] as string[],
    page: 1,
  },
  actions: {
    setSearchQuery: vi.fn(),
    setLevel: vi.fn(),
    setLanguage: vi.fn(),
    addTag: vi.fn(),
    removeTag: vi.fn(),
  },
}))

vi.mock('../model/use-vocab-filters', () => ({
  useVocabFilters: () => ({
    filters,
    isPending: false,
    ...actions,
  }),
}))

describe('VocabFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    filters.q = null
    filters.level = null
    filters.language = null
    filters.tags = []
    filters.page = 1
  })

  it('delegates search and language input to the filter hook', async () => {
    const user = userEvent.setup()

    render(<VocabFilters />)

    await user.type(
      screen.getByPlaceholderText('Search decks by keyword or topic...'),
      'verbs'
    )
    await user.type(screen.getByLabelText('Language'), 'en')

    expect(actions.setSearchQuery).toHaveBeenCalledTimes(5)
    expect(actions.setSearchQuery).toHaveBeenLastCalledWith('s')
    expect(actions.setLanguage).toHaveBeenCalledTimes(2)
    expect(actions.setLanguage).toHaveBeenLastCalledWith('n')
  })

  it('delegates level and tag interactions while rendering selected filters', async () => {
    const user = userEvent.setup()
    filters.level = 'A1'
    filters.tags = ['verbs']

    render(<VocabFilters />)

    expect(screen.getByRole('button', { name: 'A1' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: 'B2' }))
    await user.type(screen.getByLabelText('Tags'), '#Nouns{Enter}')
    await user.click(screen.getByRole('button', { name: 'Remove tag verbs' }))

    expect(actions.setLevel).toHaveBeenCalledWith('B2')
    expect(actions.addTag).toHaveBeenCalledWith('#Nouns')
    expect(actions.removeTag).toHaveBeenCalledWith('verbs')
  })
})
