import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { VocabFilters } from './vocab-filters'

const { setParams } = vi.hoisted(() => ({ setParams: vi.fn() }))

vi.mock('../model/use-search-params', () => ({
  useVocabSearchParams: () => [
    { q: null, level: null, language: null, tags: [], page: 1 },
    setParams,
  ],
}))

describe('VocabFilters', () => {
  it('stores language and tags in catalog URL state', async () => {
    const user = userEvent.setup()
    render(<VocabFilters />)

    await user.type(screen.getByLabelText('Language'), 'u')
    await user.type(screen.getByLabelText('Tags'), '#verbs{Enter}')

    expect(setParams).toHaveBeenCalledWith(
      { language: 'u', page: 1 },
      { throttleMs: 300 }
    )
    expect(setParams).toHaveBeenCalledWith({ tags: ['verbs'], page: 1 })
  })
})
