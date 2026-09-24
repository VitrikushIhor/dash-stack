import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen, waitFor } from '@/shared/lib/test'
import { userKeys } from '@/entities/user'
import { SignInForm } from './sign-in-form'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

const mockSignInAction = vi.fn()
let queryClient: QueryClient

vi.mock('../api/actions/sign-in.action', () => ({
  signInAction: (...args: unknown[]) => mockSignInAction(...args),
}))

describe('SignInForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('renders all form input fields, links, and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SignInForm />
      </QueryClientProvider>
    )

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

    render(
      <QueryClientProvider client={queryClient}>
        <SignInForm />
      </QueryClientProvider>
    )

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText(/please enter your email/i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/please enter your password/i)
    ).toBeInTheDocument()
    expect(mockSignInAction).not.toHaveBeenCalled()
  })

  it('submits valid credentials and redirects to vocabulary decks by default', async () => {
    const user = userEvent.setup()

    mockSignInAction.mockResolvedValueOnce({ success: true })
    queryClient.setQueryData(userKeys.me(), { id: 'user-a' })

    render(
      <QueryClientProvider client={queryClient}>
        <SignInForm />
      </QueryClientProvider>
    )

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
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.vocabDecks)
    })

    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined()
  })

  it('redirects to custom target URL when redirectTo prop is specified', async () => {
    const user = userEvent.setup()

    mockSignInAction.mockResolvedValueOnce({ success: true })

    render(
      <QueryClientProvider client={queryClient}>
        <SignInForm redirectTo='/analytics' />
      </QueryClientProvider>
    )

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/analytics')
    })
  })
})
