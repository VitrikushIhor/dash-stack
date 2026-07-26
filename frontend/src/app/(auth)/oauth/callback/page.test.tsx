import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test/test-utils'
import OAuthCallbackRoute from './page'

vi.mock('@/views/auth', () => ({
  OAuthCallback: ({ code, error }: { code?: string; error?: string }) => (
    <div data-testid='oauth-callback-view'>
      Code: {code ?? 'none'}, Error: {error ?? 'none'}
    </div>
  ),
}))

describe('OAuthCallbackRoute App Page', () => {
  it('extracts code and error from searchParams and passes to OAuthCallback view', async () => {
    const pageComponent = await OAuthCallbackRoute({
      searchParams: Promise.resolve({
        code: 'oauth-code-123',
        error: 'invalid_scope',
      }),
    })

    render(pageComponent)

    expect(screen.getByTestId('oauth-callback-view')).toBeInTheDocument()
    expect(
      screen.getByText('Code: oauth-code-123, Error: invalid_scope')
    ).toBeInTheDocument()
  })
})
