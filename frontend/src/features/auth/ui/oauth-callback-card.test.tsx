import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen, waitFor } from '@/shared/lib/test'
import { userKeys } from '@/entities/user'
import { OAuthCallbackCard } from './oauth-callback-card'

const mockOAuthExchangeAction = vi.fn()
const mockReplace = vi.fn()

vi.mock('../api/actions/oauth-exchange.action', () => ({
  oauthExchangeAction: (...args: unknown[]) => mockOAuthExchangeAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

describe('OAuthCallbackCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders authenticating card UI', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <OAuthCallbackCard code='valid-code' />
      </QueryClientProvider>
    )

    expect(screen.getByText('Authenticating...')).toBeInTheDocument()
    expect(
      screen.getByText('Completing sign in, please wait.')
    ).toBeInTheDocument()
  })

  it('redirects to vocabulary decks after a successful OAuth login', async () => {
    mockOAuthExchangeAction.mockResolvedValueOnce({ success: true })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(userKeys.me(), { id: 'user-a' })

    render(
      <QueryClientProvider client={queryClient}>
        <OAuthCallbackCard code='valid-code' />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.vocabDecks)
    })

    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined()
  })
})
