import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test/test-utils'
import { SignUp } from './sign-up'

vi.mock('@/features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth')>()
  return {
    ...actual,
    SignUpForm: () => (
      <div data-testid='sign-up-form'>SignUpForm Component</div>
    ),
  }
})

describe('SignUp Page View', () => {
  it('renders title and description text', () => {
    render(<SignUp />)

    expect(screen.getByText('Create an account')).toBeInTheDocument()
    expect(
      screen.getByText(/enter your email and password below to/i)
    ).toBeInTheDocument()
  })

  it('renders sign in link and legal agreement links', () => {
    render(<SignUp />)

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/sign-in')

    const termsLink = screen.getByRole('link', { name: /terms of service/i })
    expect(termsLink).toBeInTheDocument()
    expect(termsLink).toHaveAttribute('href', '/terms')

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('renders SignUpForm component inside card content', () => {
    render(<SignUp />)

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
  })
})
