import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test'
import ResetPasswordRoute from './page'

vi.mock('@/views/auth', () => ({
  ResetPassword: ({ token }: { token?: string }) => (
    <div data-testid='reset-password-view'>Token: {token ?? 'none'}</div>
  ),
}))

describe('ResetPasswordRoute App Page', () => {
  it('extracts token from searchParams and passes to ResetPassword view', async () => {
    const pageComponent = await ResetPasswordRoute({
      searchParams: Promise.resolve({ token: 'test-token-123' }),
    })

    render(pageComponent)

    expect(screen.getByTestId('reset-password-view')).toBeInTheDocument()
    expect(screen.getByText('Token: test-token-123')).toBeInTheDocument()
  })
})
