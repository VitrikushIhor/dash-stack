import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test'
import VerifyEmailRoute from './page'

vi.mock('@/views/auth', () => ({
  VerifyEmail: ({ token }: { token?: string }) => (
    <div data-testid='verify-email-view'>Token: {token ?? 'none'}</div>
  ),
}))

describe('VerifyEmailRoute App Page', () => {
  it('extracts token from searchParams and passes to VerifyEmail view', async () => {
    const pageComponent = await VerifyEmailRoute({
      searchParams: Promise.resolve({ token: 'verify-token-456' }),
    })

    render(pageComponent)

    expect(screen.getByTestId('verify-email-view')).toBeInTheDocument()
    expect(screen.getByText('Token: verify-token-456')).toBeInTheDocument()
  })
})
