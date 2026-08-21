import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test'
import { OAuthCallback } from './oauth-callback'

vi.mock('@/features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth')>()
  return {
    ...actual,
    OAuthCallbackCard: ({ code, error }: { code?: string; error?: string }) => (
      <div data-testid='oauth-callback-card'>
        Card Code: {code ?? 'none'}, Error: {error ?? 'none'}
      </div>
    ),
  }
})

describe('OAuthCallback Page View', () => {
  it('renders OAuthCallbackCard component with code and error props', () => {
    render(<OAuthCallback code='test-code' error='access_denied' />)

    expect(screen.getByTestId('oauth-callback-card')).toBeInTheDocument()
    expect(
      screen.getByText('Card Code: test-code, Error: access_denied')
    ).toBeInTheDocument()
  })
})
