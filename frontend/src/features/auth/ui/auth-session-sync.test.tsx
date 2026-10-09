import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AUTH_SESSION_EVENT_KEY,
  AUTH_SESSION_EVENT_KIND,
  parseAuthSessionEvent,
} from '@/shared/lib/auth-session-events'
import { AuthSessionSync } from './auth-session-sync'

describe('AuthSessionSync OAuth completion', () => {
  afterEach(() => vi.restoreAllMocks())
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/vocab/decks')
  })

  it('should_publish_identity_change_once_and_clear_private_cache_after_oauth_redirect', () => {
    window.history.replaceState(
      null,
      '',
      '/vocab/decks?auth-session=changed&keep=1'
    )
    const client = new QueryClient()
    client.setQueryData(['private-test-data'], { owner: 'previous-user' })
    const publish = vi.spyOn(Storage.prototype, 'setItem')

    render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <AuthSessionSync>
            <div>Content</div>
          </AuthSessionSync>
        </QueryClientProvider>
      </StrictMode>
    )

    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(
      parseAuthSessionEvent(window.localStorage.getItem(AUTH_SESSION_EVENT_KEY))
        ?.kind
    ).toBe(AUTH_SESSION_EVENT_KIND.SIGNED_IN)
    expect(publish).toHaveBeenCalledTimes(1)
    expect(window.location.search).toBe('?keep=1')
    expect(screen.getByText('Content')).toBeVisible()
    publish.mockRestore()
  })

  it('should_not_broadcast_on_regular_page_load', () => {
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <AuthSessionSync>
          <div>Content</div>
        </AuthSessionSync>
      </QueryClientProvider>
    )
    expect(window.localStorage.getItem(AUTH_SESSION_EVENT_KEY)).toBeNull()
  })
  it('should_keep_content_visible_when_notification_storage_is_unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    const client = new QueryClient()
    render(
      <QueryClientProvider client={client}>
        <AuthSessionSync>
          <div>Content</div>
        </AuthSessionSync>
      </QueryClientProvider>
    )
    fireEvent(window, new Event('pageshow'))
    expect(screen.getByText('Content')).toBeVisible()
  })
})
