import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { StudyFilters } from './study-filters'

describe('StudyFilters', () => {
  it('should_preserve_starred_filter_when_due_filter_is_enabled', async () => {
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter
        searchParams='?onlyStarred=true'
        onUrlUpdate={onUrlUpdate}
      >
        <StudyFilters />
      </NuqsTestingAdapter>
    )
    expect(screen.getByRole('checkbox', { name: 'Starred only' })).toBeChecked()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Due only' }))
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryString: '?onlyStarred=true&onlyDue=true',
        options: expect.objectContaining({ shallow: false }),
      })
    )
  })

  it('should_clear_both_filters_when_reset_is_clicked', async () => {
    const onUrlUpdate = vi.fn()

    render(
      <NuqsTestingAdapter
        searchParams='?onlyDue=true&onlyStarred=true'
        onUrlUpdate={onUrlUpdate}
      >
        <StudyFilters />
      </NuqsTestingAdapter>
    )
    await userEvent.click(screen.getByRole('button', { name: 'All cards' }))
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: '' })
    )
  })
})
