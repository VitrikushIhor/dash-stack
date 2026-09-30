import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { revokeSessionAction } from '../api/actions/revoke-session.action'
import { ActiveSessions } from './active-sessions'

const { replace, refresh } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
vi.mock('../api/actions/revoke-session.action', () => ({
  revokeSessionAction: vi.fn(),
}))
const current = {
  id: 'current-session',
  createdAt: '2026-09-28T09:00:00.000Z',
  lastUsedAt: '2026-09-29T09:00:00.000Z',
  expiresAt: '2026-10-28T09:00:00.000Z',
  userAgent: null,
  isCurrent: true,
}
const other = { ...current, id: 'other-session', isCurrent: false }

function setup(
  selectedId = other.id,
  onUrlUpdate?: (event: UrlUpdateEvent) => void
) {
  const client = new QueryClient()
  client.setQueryData(['private-test'], { secret: 'cached' })
  render(
    <QueryClientProvider client={client}>
      <NuqsTestingAdapter
        searchParams={`?page=2&revoke-session=${selectedId}`}
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        <ActiveSessions
          data={{
            data: [current, other],
            meta: {
              total: 60,
              lastPage: 3,
              currentPage: 2,
              perPage: 20,
              prev: 1,
              next: 3,
            },
          }}
          page={2}
        />
      </NuqsTestingAdapter>
    </QueryClientProvider>
  )
  return client
}

describe('ActiveSessions', () => {
  afterEach(() => vi.clearAllMocks())

  it('should_render_server_data_and_page_links_without_a_list_query', () => {
    setup('')
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/user/settings/sessions?page=1'
    )
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/user/settings/sessions?page=3'
    )
    expect(
      screen.getByRole('link', { name: 'Sign out session', hidden: true })
    ).toHaveAttribute(
      'href',
      '/user/settings/sessions?page=2&revoke-session=other-session'
    )
  })

  it('should_show_current_activity_and_stored_last_used_time_for_other_sessions', () => {
    setup('')
    expect(screen.getByText('Active now', { exact: false })).toBeVisible()
    const otherActivity = screen.getAllByText(
      new Date(other.lastUsedAt).toLocaleString()
    )
    expect(otherActivity).toHaveLength(1)
    expect(otherActivity[0]).toHaveAttribute('datetime', other.lastUsedAt)
  })

  it('should_clear_only_dialog_param_when_cancelled_without_revoking', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    setup(other.id, onUrlUpdate)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.toString()).toBe(
        'page=2'
      )
    })
    expect(revokeSessionAction).not.toHaveBeenCalled()
  })

  it('should_refresh_server_list_when_selected_other_session_is_revoked', async () => {
    vi.mocked(revokeSessionAction).mockResolvedValue({
      success: true,
      data: { revokedCurrentSession: false },
    })
    const client = setup()
    expect(revokeSessionAction).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm sign out' }))
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
    expect(revokeSessionAction).toHaveBeenCalledWith(other.id)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(client.getQueryData(['private-test'])).toBeDefined()
    expect(replace).not.toHaveBeenCalled()
  })

  it.each(['action', 'transport'] as const)(
    'should_keep_confirmation_retryable_when_%s_fails',
    async (failure) => {
      if (failure === 'action') {
        vi.mocked(revokeSessionAction).mockResolvedValue({
          success: false,
          error: 'Unavailable',
        })
      } else {
        vi.mocked(revokeSessionAction).mockRejectedValue(
          new Error('Unavailable')
        )
      }
      const client = setup()
      fireEvent.click(screen.getByRole('button', { name: 'Confirm sign out' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Unavailable')
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Confirm sign out' })
        ).toBeEnabled()
      )
      expect(client.getQueryData(['private-test'])).toBeDefined()
      expect(refresh).not.toHaveBeenCalled()
      expect(replace).not.toHaveBeenCalled()
    }
  )

  it('should_clear_private_cache_and_navigate_when_current_session_is_revoked', async () => {
    vi.mocked(revokeSessionAction).mockResolvedValue({
      success: true,
      data: { revokedCurrentSession: true },
    })
    const client = setup(current.id)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm sign out' }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/sign-in'))
    expect(client.getQueryData(['private-test'])).toBeUndefined()
  })
})
