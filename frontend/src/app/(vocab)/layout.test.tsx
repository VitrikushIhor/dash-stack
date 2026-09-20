import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureHasOrganization } from '@/entities/organization/server'
import {
  getCurrentUser,
  requireAuthenticatedUser,
} from '@/entities/user/server'
import VocabularyLayout from './layout'

vi.mock('server-only', () => ({}))
vi.mock('@/entities/organization/server', () => ({
  ensureHasOrganization: vi.fn(),
}))
vi.mock('@/entities/user/server', () => ({
  getCurrentUser: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}))
vi.mock('@/widgets/vocabulary-header', () => ({
  VocabularyHeader: ({ user }: { user: { firstName: string } | null }) => (
    <div>
      {user ? `${user.firstName} vocabulary header` : 'Guest vocabulary header'}
    </div>
  ),
}))

describe('VocabularyLayout', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      data: null,
      error: 'Unauthorized',
      statusCode: 401,
    })
  })

  it('should_keep_public_vocabulary_available_without_strict_auth_or_organization', async () => {
    render(await VocabularyLayout({ children: <div>Public deck</div> }))

    expect(screen.getByText('Public deck')).toBeInTheDocument()
    expect(screen.getByText('Guest vocabulary header')).toBeInTheDocument()
    expect(requireAuthenticatedUser).not.toHaveBeenCalled()
    expect(ensureHasOrganization).not.toHaveBeenCalled()
  })

  it('should_expose_owner_navigation_to_an_authenticated_user', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      data: {
        id: 'owner',
        firstName: 'Owner',
        email: 'owner@example.test',
      },
      error: null,
      statusCode: null,
    })

    render(await VocabularyLayout({ children: <div>My vocabulary</div> }))

    expect(screen.getByText('Owner vocabulary header')).toBeInTheDocument()
    expect(screen.queryByText('Team Switcher')).toBeNull()
  })
})
