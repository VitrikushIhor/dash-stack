import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthCookies } from '@/shared/lib/session-cookies'
import { persistAuthCookies } from './persist-auth-cookies'

vi.mock('@/shared/lib/session-cookies', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/session-cookies')>()),
  setAuthCookies: vi.fn(),
}))

describe('persistAuthCookies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores backend HttpOnly auth cookies on the frontend origin', async () => {
    const response = new Response(null, { status: 200 })

    response.headers.append(
      'set-cookie',
      'access_token=access-value; Path=/; HttpOnly'
    )
    response.headers.append(
      'set-cookie',
      'refresh_token=session-value; Path=/; HttpOnly'
    )

    await persistAuthCookies(response)

    expect(setAuthCookies).toHaveBeenCalledWith({
      accessToken: 'access-value',
      refreshToken: 'session-value',
    })
  })

  it('does not modify cookies when response has no complete auth pair', async () => {
    await persistAuthCookies(new Response(null, { status: 200 }))

    expect(setAuthCookies).not.toHaveBeenCalled()
  })
})
