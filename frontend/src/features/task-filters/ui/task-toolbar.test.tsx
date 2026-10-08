import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { TaskToolbar } from './task-toolbar'

describe('TaskToolbar', () => {
  it('should_offer_reset_and_reset_page_when_only_due_date_is_filtered', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    render(
      <NuqsTestingAdapter
        searchParams='?dueDate=1791158400000,1791244800000&page=4&perPage=25&update-task=task-1'
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        <TaskToolbar labels={[]} members={[]} />
      </NuqsTestingAdapter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Reset/ }))

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    const params = onUrlUpdate.mock.lastCall?.[0].searchParams
    expect(params?.has('dueDate')).toBe(false)
    expect(params?.has('page')).toBe(false)
    expect(params?.get('perPage')).toBe('25')
    expect(params?.get('update-task')).toBe('task-1')
  })

  it('should_reset_page_atomically_when_search_changes', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    render(
      <NuqsTestingAdapter
        searchParams='?page=4&labels=bug'
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        <TaskToolbar labels={[]} members={[]} />
      </NuqsTestingAdapter>
    )

    fireEvent.change(screen.getByPlaceholderText('Filter tasks...'), {
      target: { value: 'deadline' },
    })

    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('filter')).toBe(
        'deadline'
      )
    )
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has('page')).toBe(false)
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('labels')).toBe(
      'bug'
    )
  })
})
