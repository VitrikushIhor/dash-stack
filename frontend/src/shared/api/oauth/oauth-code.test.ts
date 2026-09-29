import { afterEach, describe, expect, it, vi } from 'vitest'
import { exchangeOAuthCode } from './oauth-code'

describe('exchangeOAuthCode', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('should_forward_browser_user_agent_during_code_exchange', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    await exchangeOAuthCode(
      'http://backend.test',
      'code',
      'verifier',
      'Browser test agent'
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend.test/api/auth/oauth/code',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Browser test agent',
        },
      })
    )
  })
})
