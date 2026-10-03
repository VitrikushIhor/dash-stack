import { notFound } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderCalendarPage } from '@/views/calendar'
import OrganizationCalendarViewRoute from './page'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND')
  }),
}))
vi.mock('@/views/calendar', () => ({ renderCalendarPage: vi.fn() }))

describe('OrganizationCalendarViewRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['day', 'week', 'year', 'agenda'])(
    'should_render_%s_view_when_url_segment_is_valid',
    async (view) => {
      const searchParams = Promise.resolve({ date: '2026-10-03' })

      await OrganizationCalendarViewRoute({
        params: Promise.resolve({ slug: 'acme', view }),
        searchParams,
      })

      expect(renderCalendarPage).toHaveBeenCalledWith({
        slug: 'acme',
        searchParams,
        view,
      })
    }
  )

  it('should_return_404_when_view_is_unknown', async () => {
    await expect(
      OrganizationCalendarViewRoute({
        params: Promise.resolve({ slug: 'acme', view: 'unknown' }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow('NOT_FOUND')

    expect(notFound).toHaveBeenCalledOnce()
    expect(renderCalendarPage).not.toHaveBeenCalled()
  })
})
