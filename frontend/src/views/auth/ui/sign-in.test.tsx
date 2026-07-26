import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test/test-utils'
import { SignIn } from './sign-in'

vi.mock('@/features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth')>()
  return {
    ...actual,
    SignInForm: ({ redirectTo }: { redirectTo?: string }) => (
      <div data-testid='sign-in-form' data-redirect-to={redirectTo}>
        SignInForm Component
      </div>
    ),
  }
})

describe('SignIn Page View', () => {
  it('renders the sign in heading and description text', () => {
    render(<SignIn />)

    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(
      screen.getByText(/enter your email and password below to/i)
    ).toBeInTheDocument()
  })

  it('renders sign up link and legal agreement links', () => {
    render(<SignIn />)

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/sign-up')

    const termsLink = screen.getByRole('link', { name: /terms of service/i })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '/terms')

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('passes redirectTo parameter down to SignInForm', () => {
    render(<SignIn redirectTo='/dashboard/projects' />)

    const formElement = screen.getByTestId('sign-in-form')
    expect(formElement).toBeInTheDocument()
    expect(formElement).toHaveAttribute(
      'data-redirect-to',
      '/dashboard/projects'
    )
  })
})
