import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/lib/test'
import { SignUpForm } from './sign-up-form'

const mockSignUpAction = vi.fn()
vi.mock('../api/actions/sign-up.action', () => ({
  signUpAction: (...args: unknown[]) => mockSignUpAction(...args),
}))

describe('SignUpForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input fields and submit button', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument()
  })

  it('displays validation errors on empty submission', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/please enter your email/i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/please enter your password/i)
    ).toBeInTheDocument()
    expect(mockSignUpAction).not.toHaveBeenCalled()
  })

  it('displays validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'DifferentPassword!'
    )
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/passwords don't match\./i)
    ).toBeInTheDocument()
    expect(mockSignUpAction).not.toHaveBeenCalled()
  })

  it('submits form with valid data and switches to check email confirmation view', async () => {
    const user = userEvent.setup()
    mockSignUpAction.mockResolvedValueOnce({ success: true })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockSignUpAction).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
    })

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to sign in/i })
    ).toBeInTheDocument()
  })
})
