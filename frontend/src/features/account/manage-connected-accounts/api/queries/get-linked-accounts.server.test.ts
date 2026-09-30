import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectedAccountsServerApi } from '../connected-accounts-api.server'
import { getLinkedAccountsQuery } from './get-linked-accounts.server'

vi.mock('../connected-accounts-api.server', () => ({
  connectedAccountsServerApi: { linkedAccounts: vi.fn() },
}))

describe('getLinkedAccountsQuery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_return_connected_providers_when_server_request_succeeds', async () => {
    vi.mocked(connectedAccountsServerApi.linkedAccounts).mockResolvedValue({
      providers: ['google'],
    })
    expect(await getLinkedAccountsQuery()).toEqual({
      ok: true,
      data: { providers: ['google'] },
    })
  })

  it('should_return_query_error_when_server_request_fails', async () => {
    vi.mocked(connectedAccountsServerApi.linkedAccounts).mockRejectedValue(
      new Error('Unavailable')
    )
    const result = await getLinkedAccountsQuery()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNKNOWN')
  })
})
