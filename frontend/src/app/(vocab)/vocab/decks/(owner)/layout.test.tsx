import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureHasOrganization } from '@/entities/organization/server'
import { requireAuthenticatedUser } from '@/entities/user/server'
import OwnerVocabularyLayout from './layout'

vi.mock('server-only', () => ({}))
vi.mock('@/entities/organization/server', () => ({
  ensureHasOrganization: vi.fn(),
}))
vi.mock('@/entities/user/server', () => ({
  requireAuthenticatedUser: vi.fn(),
}))

describe('OwnerVocabularyLayout', () => {
  beforeEach(() => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: 'owner',
      firstName: 'Owner',
      email: 'owner@example.test',
    })
  })

  it('should_require_an_authenticated_user_without_requiring_an_organization', async () => {
    render(
      await OwnerVocabularyLayout({
        children: <div>Owner vocabulary content</div>,
      })
    )

    expect(requireAuthenticatedUser).toHaveBeenCalledOnce()
    expect(ensureHasOrganization).not.toHaveBeenCalled()
    expect(screen.getByText('Owner vocabulary content')).toBeInTheDocument()
  })

  it('should_surface_the_existing_guest_auth_failure', async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(
      new Error('Unauthorized')
    )

    await expect(
      OwnerVocabularyLayout({ children: <div>Protected</div> })
    ).rejects.toThrow('Unauthorized')
  })
})
