import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test/test-utils'
import { ResetPassword } from './reset-password'

vi.mock('@/features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth')>()
  return {
    ...actual,
    ResetPasswordForm: ({ token }: { token: string }) => (
      <div data-testid='reset-password-form'>Form Token: {token}</div>
    ),
  }
})

describe('ResetPassword Page View', () => {
  it('renders invalid link card when token is missing', () => {
    render(<ResetPassword />)

    expect(screen.getByText('Invalid Link')).toBeInTheDocument()
    expect(
      screen.getByText(/this password reset link is invalid or has expired/i)
    ).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /request new link/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/forgot-password')
  })

  it('renders ResetPasswordForm when valid token is provided', () => {
    render(<ResetPassword token='valid-reset-token' />)

    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument()
    expect(
      screen.getByText('Form Token: valid-reset-token')
    ).toBeInTheDocument()
  })
})
