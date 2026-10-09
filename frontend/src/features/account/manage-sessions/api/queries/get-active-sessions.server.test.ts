import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionsServerApi } from '../sessions-api.server'
import { getActiveSessionsQuery } from './get-active-sessions.server'

vi.mock('../sessions-api.server', () => ({
  sessionsServerApi: { sessions: vi.fn() },
}))

describe('getActiveSessionsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(sessionsServerApi.sessions).mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        lastPage: 1,
        currentPage: 1,
        perPage: 20,
        prev: null,
        next: null,
      },
    })
  })

  it('should_validate_page_and_return_server_sessions', async () => {
    const result = await getActiveSessionsQuery({ page: '3' })
    expect(sessionsServerApi.sessions).toHaveBeenCalledWith(3)
    expect(result).toEqual({
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

  it.each([undefined, '0', '-1', '2.5', 'abc', '100001', ['2']])(
    'should_use_first_page_when_page_is_invalid_%s',
    async (page) => {
      const result = await getActiveSessionsQuery({ page })
      expect(sessionsServerApi.sessions).toHaveBeenCalledWith(1)
      expect(result).toEqual({
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
          page: 1,
        },
      })
    }
  )

  it('should_return_explicit_query_error_when_backend_fails', async () => {
    vi.mocked(sessionsServerApi.sessions).mockRejectedValueOnce(
      new Error('Unavailable')
    )
    const result = await getActiveSessionsQuery({ page: '1' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNKNOWN')
  })
})
