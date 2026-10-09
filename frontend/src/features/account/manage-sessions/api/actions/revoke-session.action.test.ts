import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { refreshSession } from '@/shared/api/session'
import { clearAuthCookies, setAuthCookies } from '@/shared/lib/session-cookies'
import { sessionsServerApi } from '../sessions-api.server'
import { revokeSessionAction } from './revoke-session.action'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'session-secret' }) }),
}))
vi.mock('../sessions-api.server', () => ({
  sessionsServerApi: { revokeSession: vi.fn() },
}))
vi.mock('@/shared/api/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api/session')>()),
  refreshSession: vi.fn(),
}))
vi.mock('@/shared/lib/session-cookies', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/session-cookies')>()),
  clearAuthCookies: vi.fn(),
  setAuthCookies: vi.fn(),
}))

describe('revokeSessionAction', () => {
  beforeEach(() => vi.resetAllMocks())
  it('should_clear_cookies_only_when_backend_confirms_current_session_revocation', async () => {
    vi.mocked(sessionsServerApi.revokeSession).mockResolvedValue({
      revokedCurrentSession: true,
    })
    expect(await revokeSessionAction('own-session')).toEqual({
      success: true,
      data: { revokedCurrentSession: true },
    })
    expect(clearAuthCookies).toHaveBeenCalledOnce()
  })
  it('should_preserve_cookies_when_another_session_is_revoked', async () => {
    vi.mocked(sessionsServerApi.revokeSession).mockResolvedValue({
      revokedCurrentSession: false,
    })
    expect((await revokeSessionAction('other-session')).success).toBe(true)
    expect(clearAuthCookies).not.toHaveBeenCalled()
  })
  it('should_refresh_and_retry_once_when_access_expired_before_mutation', async () => {
    vi.mocked(sessionsServerApi.revokeSession)
      .mockRejectedValueOnce(new ApiError(401, 'Expired'))
      .mockResolvedValueOnce({ revokedCurrentSession: false })
    vi.mocked(refreshSession).mockResolvedValue({
      status: 'success',
      tokens: { accessToken: 'new-access', refreshToken: 'session-secret' },
    })
    expect((await revokeSessionAction('other-session')).success).toBe(true)
    expect(sessionsServerApi.revokeSession).toHaveBeenCalledTimes(2)
    expect(setAuthCookies).toHaveBeenCalledOnce()
    expect(clearAuthCookies).not.toHaveBeenCalled()
  })
  it('should_preserve_cookies_and_surface_unavailable_recovery', async () => {
    vi.mocked(sessionsServerApi.revokeSession).mockRejectedValue(
      new ApiError(401, 'Expired')
    )
    vi.mocked(refreshSession).mockResolvedValue({ status: 'unavailable' })
    const result = await revokeSessionAction('other-session')
    expect(result.success).toBe(false)
    expect(sessionsServerApi.revokeSession).toHaveBeenCalledOnce()
    expect(clearAuthCookies).not.toHaveBeenCalled()
    expect(setAuthCookies).not.toHaveBeenCalled()
  })
  it('should_not_retry_mutation_after_a_server_failure', async () => {
    vi.mocked(sessionsServerApi.revokeSession).mockRejectedValue(
      new ApiError(503, 'Unavailable')
    )
    expect((await revokeSessionAction('other-session')).success).toBe(false)
    expect(refreshSession).not.toHaveBeenCalled()
    expect(clearAuthCookies).not.toHaveBeenCalled()
  })
  it('should_reject_invalid_session_ids_before_requesting_backend', async () => {
    expect((await revokeSessionAction('../foreign')).success).toBe(false)
    expect(sessionsServerApi.revokeSession).not.toHaveBeenCalled()
  })
})
