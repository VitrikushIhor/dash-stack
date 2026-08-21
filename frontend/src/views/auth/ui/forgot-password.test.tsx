import { describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen } from '@/shared/lib/test'
import { ForgotPassword } from './forgot-password'

// Mock ForgotPasswordForm to isolate ForgotPassword view component behavior
vi.mock('@/features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth')>()
  return {
    ...actual,
    ForgotPasswordForm: () => (
      <div data-testid='forgot-password-form'>ForgotPasswordForm Component</div>
    ),
  }
})

describe('ForgotPassword Page View', () => {
  it('renders title and description text', () => {
    render(<ForgotPassword />)

    expect(screen.getByText('Forgot Password')).toBeInTheDocument()
    expect(
      screen.getByText(/enter your registered email and/i)
    ).toBeInTheDocument()
  })

  it('renders sign up link', () => {
    render(<ForgotPassword />)

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', ROUTES.signUp)
  })

  it('renders ForgotPasswordForm component inside card content', () => {
    render(<ForgotPassword />)

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
  })
})
