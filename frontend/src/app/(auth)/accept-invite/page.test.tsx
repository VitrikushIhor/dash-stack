import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test'
import AcceptInviteRoute from './page'

vi.mock('@/features/organization-invite', () => ({
  AcceptInviteCard: ({ token }: { token?: string }) => (
    <div data-testid='accept-invite-card'>Token: {token ?? 'none'}</div>
  ),
}))

describe('AcceptInviteRoute App Page', () => {
  it('extracts token from searchParams and passes to AcceptInviteCard', async () => {
    const pageComponent = await AcceptInviteRoute({
      searchParams: Promise.resolve({ token: 'test-invite-token-123' }),
    })

    render(pageComponent)

    expect(screen.getByTestId('accept-invite-card')).toBeInTheDocument()
    expect(screen.getByText('Token: test-invite-token-123')).toBeInTheDocument()
  })
})
