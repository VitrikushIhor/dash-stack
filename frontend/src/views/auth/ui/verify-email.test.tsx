import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test/test-utils'
import { VerifyEmail } from './verify-email'

vi.mock('@/features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth')>()
  return {
    ...actual,
    VerifyEmailCard: ({ token }: { token?: string }) => (
      <div data-testid='verify-email-card'>Card Token: {token ?? 'none'}</div>
    ),
  }
})

describe('VerifyEmail Page View', () => {
  it('renders VerifyEmailCard component', () => {
    render(<VerifyEmail token='test-token' />)

    expect(screen.getByTestId('verify-email-card')).toBeInTheDocument()
    expect(screen.getByText('Card Token: test-token')).toBeInTheDocument()
  })
})
