import { type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { useTaskFiltersController } from './use-task-filters-controller'

describe('useTaskFiltersController', () => {
  it.each([
    ['setStatuses', 'status'],
    ['setLabels', 'labels'],
    ['setMembers', 'members'],
    ['setDueDateRange', 'dueDate'],
  ] as const)(
    'should_reset_page_and_preserve_other_params_when_%s_changes',
    async (method, key) => {
      const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
      const wrapper = ({ children }: { children: ReactNode }) => (
        <NuqsTestingAdapter
          searchParams='?page=4&perPage=25&update-task=task-1'
          onUrlUpdate={onUrlUpdate}
          hasMemory
        >
          {children}
        </NuqsTestingAdapter>
      )
      const { result } = renderHook(useTaskFiltersController, { wrapper })

      act(() => {
        result.current[method](['selected'])
      })

      await waitFor(() =>
        expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get(key)).toBe(
          'selected'
        )
      )
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has('page')).toBe(
        false
      )
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('perPage')).toBe(
        '25'
      )
      expect(
        onUrlUpdate.mock.lastCall?.[0].searchParams.get('update-task')
      ).toBe('task-1')
      expect(onUrlUpdate.mock.lastCall?.[0].options.shallow).toBe(false)
      act(() => {
        result.current[method]([])
      })
      await waitFor(() =>
        expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has(key)).toBe(false)
      )
    }
  )
})
