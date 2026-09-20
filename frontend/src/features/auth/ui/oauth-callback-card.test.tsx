import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen, waitFor } from '@/shared/lib/test'
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
    render(<OAuthCallbackCard code='valid-code' />)

    expect(screen.getByText('Authenticating...')).toBeInTheDocument()
    expect(
      screen.getByText('Completing sign in, please wait.')
    ).toBeInTheDocument()
  })

  it('redirects to vocabulary decks after a successful OAuth login', async () => {
    mockOAuthExchangeAction.mockResolvedValueOnce({ success: true })

    render(<OAuthCallbackCard code='valid-code' />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.vocabDecks)
    })
  })
})
