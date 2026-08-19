import { useParams, useRouter } from 'next/navigation'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatCalendarDate,
  getCalendarViewUrl,
  useCalendarNavigation,
} from './navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}))

describe('calendar navigation helpers', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>)
    vi.mocked(useParams).mockReturnValue({ slug: 'test-org' })
  })

  describe('formatCalendarDate', () => {
    it('formats date to yyyy-MM-dd', () => {
      const date = new Date(2026, 7, 11) // Aug 11, 2026
      expect(formatCalendarDate(date)).toBe('2026-08-11')
    })
  })

  describe('getCalendarViewUrl', () => {
    it('returns month view URL without date', () => {
      expect(getCalendarViewUrl('test-org', 'month')).toBe(
        '/organizations/test-org/calendar'
      )
    })

    it('returns month view URL with date query', () => {
      const date = new Date(2026, 7, 11)
      expect(getCalendarViewUrl('test-org', 'month', date)).toBe(
        '/organizations/test-org/calendar?date=2026-08-11'
      )
    })

    it('returns specific view URL with date query', () => {
      const date = new Date(2026, 7, 11)
      expect(getCalendarViewUrl('test-org', 'day', date)).toBe(
        '/organizations/test-org/calendar/day?date=2026-08-11'
      )
    })
  })

  describe('useCalendarNavigation', () => {
    it('navigates to day view', () => {
      const { result } = renderHook(() => useCalendarNavigation())
      const date = new Date(2026, 7, 11)

      result.current.navigateToDay(date)
      expect(mockPush).toHaveBeenCalledWith(
        '/organizations/test-org/calendar/day?date=2026-08-11'
      )
    })

    it('navigates to month view', () => {
      const { result } = renderHook(() => useCalendarNavigation())
      const date = new Date(2026, 7, 1)

      result.current.navigateToMonth(date)
      expect(mockPush).toHaveBeenCalledWith(
        '/organizations/test-org/calendar?date=2026-08-01'
      )
    })

    it('does not navigate if slug is missing', () => {
      vi.mocked(useParams).mockReturnValue({})
      const { result } = renderHook(() => useCalendarNavigation())
      const date = new Date(2026, 7, 11)

      result.current.navigateToDay(date)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
