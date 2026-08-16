import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen, waitFor } from '@/shared/lib/test'
import { SignInForm } from './sign-in-form'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

const mockSignInAction = vi.fn()
vi.mock('../api/actions/sign-in.action', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
}))

describe('SignInForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form input fields, links, and buttons', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /forgot password\?/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()
  })

  it('displays validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<SignInForm />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText(/please enter your email/i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/please enter your password/i)
    ).toBeInTheDocument()
    expect(mockSignInAction).not.toHaveBeenCalled()
  })

  it('submits form with valid user credentials and redirects to create-organization by default', async () => {
    const user = userEvent.setup()
    mockSignInAction.mockResolvedValueOnce({ success: true })

    render(<SignInForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignInAction).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123!',
      })
    })

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.organizations)
    })
  })

  it('redirects to custom target URL when redirectTo prop is specified', async () => {
    const user = userEvent.setup()
    mockSignInAction.mockResolvedValueOnce({ success: true })

    render(<SignInForm redirectTo='/analytics' />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/analytics')
    })
  })
})
