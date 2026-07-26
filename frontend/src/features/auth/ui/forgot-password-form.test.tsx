import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/lib/test/test-utils'
import { ForgotPasswordForm } from './forgot-password-form'

const mockForgotPasswordAction = vi.fn()
vi.mock('../model/mutations/auth-actions', () => ({
  forgotPasswordAction: (...args: unknown[]) =>
    mockForgotPasswordAction(...args),
}))

describe('ForgotPasswordForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input field and submit button', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  it('displays validation error on empty submission', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(
      await screen.findByText(/please enter your email/i)
    ).toBeInTheDocument()
    expect(mockForgotPasswordAction).not.toHaveBeenCalled()
  })

  it('submits form with valid email and displays check email confirmation view', async () => {
    const user = userEvent.setup()
    mockForgotPasswordAction.mockResolvedValueOnce({ success: true })

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(mockForgotPasswordAction).toHaveBeenCalledWith('user@example.com')
    })

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to sign in/i })
    ).toBeInTheDocument()
  })
})
