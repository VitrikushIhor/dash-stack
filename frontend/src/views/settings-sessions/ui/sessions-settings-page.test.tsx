import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { getActiveSessionsQuery } from '@/features/account/manage-sessions/server'
import { SessionsSettingsPage } from './sessions-settings-page'

vi.mock('@/entities/user/server', () => ({ requireAuthenticatedUser: vi.fn() }))
vi.mock('@/features/account/manage-sessions/server', () => ({
  getActiveSessionsQuery: vi.fn(),
}))
vi.mock('@/features/account/manage-sessions', () => ({
  ActiveSessions: () => null,
}))

describe('SessionsSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getActiveSessionsQuery).mockResolvedValue({
      ok: true,
      data: {
        sessions: {
          data: [],
          meta: {
            total: 0,
            lastPage: 1,
            currentPage: 1,
            perPage: 20,
            prev: null,
            next: null,
          },
        },
        page: 3,
      },
    })
  })

  it('should_load_requested_page_on_server_after_authentication', async () => {
    const result = await SessionsSettingsPage({
      searchParams: Promise.resolve({ page: '3' }),
    })
    expect(requireAuthenticatedUser).toHaveBeenCalledOnce()
    expect(getActiveSessionsQuery).toHaveBeenCalledWith({ page: '3' })
    expect(result.props).toEqual({
      data: {
        data: [],
        meta: {
          total: 0,
          lastPage: 1,
          currentPage: 1,
          perPage: 20,
          prev: null,
          next: null,
        },
      },
      page: 3,
    })
  })

  it('should_render_page_error_handler_when_query_fails', async () => {
    vi.mocked(getActiveSessionsQuery).mockResolvedValueOnce({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Unavailable' },
    })
    const result = await SessionsSettingsPage({
      searchParams: Promise.resolve({}),
    })
    expect(result.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Unavailable' },
      withContainer: false,
    })
  })

  it('should_not_load_sessions_when_authentication_fails', async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValueOnce(
      new Error('Unauthorized')
    )
    await expect(
      SessionsSettingsPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow('Unauthorized')
    expect(getActiveSessionsQuery).not.toHaveBeenCalled()
  })
})
