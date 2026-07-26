import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test/test-utils'
import { OAuthCallbackCard } from './oauth-callback-card'

const mockOAuthExchangeAction = vi.fn()
const mockReplace = vi.fn()

vi.mock('../model/mutations/auth-actions', () => ({
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
})
