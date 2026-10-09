import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { getLinkedAccountsQuery } from '@/features/account/manage-connected-accounts/server'
import { AccountsSettingsPage } from './accounts-settings-page'

vi.mock('@/entities/user/server', () => ({ requireAuthenticatedUser: vi.fn() }))
vi.mock('@/features/account/manage-connected-accounts/server', () => ({
  getLinkedAccountsQuery: vi.fn(),
}))
vi.mock('@/features/account/manage-connected-accounts', () => ({
  ConnectedAccounts: () => null,
}))

describe('AccountsSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getLinkedAccountsQuery).mockResolvedValue({
      ok: true,
      data: { providers: ['google'] },
    })
  })

  it('should_load_providers_on_server_for_authenticated_user', async () => {
    const result = await AccountsSettingsPage()
    expect(requireAuthenticatedUser).toHaveBeenCalledOnce()
    expect(getLinkedAccountsQuery).toHaveBeenCalledOnce()
    expect(result.props).toEqual({ data: { providers: ['google'] } })
  })

  it('should_render_page_error_handler_when_query_fails', async () => {
    vi.mocked(getLinkedAccountsQuery).mockResolvedValue({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Unavailable' },
    })
    const result = await AccountsSettingsPage()
    expect(result.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Unavailable' },
      withContainer: false,
    })
  })

  it('should_not_load_providers_when_authentication_fails', async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValueOnce(
      new Error('Unauthorized')
    )
    await expect(AccountsSettingsPage()).rejects.toThrow('Unauthorized')
    expect(getLinkedAccountsQuery).not.toHaveBeenCalled()
  })
})
