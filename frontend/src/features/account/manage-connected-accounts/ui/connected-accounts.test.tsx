import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnectedAccounts } from './connected-accounts'
import { ConnectedAccountsSkeleton } from './connected-accounts-skeleton'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setup(link = '') {
  const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
  render(
    <StrictMode>
      <NuqsTestingAdapter
        searchParams={`?page=2${link ? `&link=${link}` : ''}`}
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        <ConnectedAccounts data={{ providers: ['google'] }} />
      </NuqsTestingAdapter>
    </StrictMode>
  )
  return onUrlUpdate
}

describe('ConnectedAccounts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_show_server_provider_data_and_post_confirmation_form', () => {
    setup()
    expect(screen.getByLabelText('Google connected')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Connect Google' })
    ).not.toBeInTheDocument()
    const form = screen
      .getByRole('button', { name: 'Connect GitHub' })
      .closest('form')
    expect(form).toHaveAttribute('method', 'post')
    expect(form).toHaveAttribute('action', '/api/auth/oauth/start')
    expect(form?.querySelector('[name="connection"]')).toHaveValue('github')
    expect(form?.querySelector('[name="returnTo"]')).toHaveValue(
      '/user/settings/accounts'
    )
  })

  it.each(['success', 'failed'] as const)(
    'should_notify_once_and_clear_url_when_link_result_is_%s',
    async (result) => {
      const onUrlUpdate = setup(result)
      await waitFor(() =>
        expect(onUrlUpdate.mock.lastCall?.[0].searchParams.toString()).toBe(
          'page=2'
        )
      )
      const notification = result === 'success' ? toast.success : toast.error
      const otherNotification =
        result === 'success' ? toast.error : toast.success
      expect(notification).toHaveBeenCalledOnce()
      expect(otherNotification).not.toHaveBeenCalled()
    }
  )

  it('should_not_claim_link_result_when_url_value_is_unknown', () => {
    setup('unknown')
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should_render_accessible_skeleton_for_route_loading', () => {
    render(<ConnectedAccountsSkeleton />)
    expect(
      screen.getByRole('status', { name: 'Loading connected accounts' })
    ).toBeVisible()
  })
})
