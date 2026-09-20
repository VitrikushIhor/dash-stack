import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureHasOrganization } from '@/entities/organization/server'
import { requireAuthenticatedUser } from '@/entities/user/server'
import VocabularySettingsPage from './page'

vi.mock('server-only', () => ({}))
vi.mock('@/entities/organization/server', () => ({
  ensureHasOrganization: vi.fn(),
}))
vi.mock('@/entities/user/server', () => ({
  requireAuthenticatedUser: vi.fn(),
}))
vi.mock('@/features/update-profile', () => ({
  UpdateProfileForm: ({ user }: { user: { email: string } }) => (
    <div>Profile form for {user.email}</div>
  ),
}))

describe('VocabularySettingsPage', () => {
  beforeEach(() => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: 'owner',
      firstName: 'Owner',
      email: 'owner@example.test',
    })
  })

  it('should_render_profile_settings_for_an_authenticated_user_without_an_organization', async () => {
    render(await VocabularySettingsPage())

    expect(requireAuthenticatedUser).toHaveBeenCalledOnce()
    expect(ensureHasOrganization).not.toHaveBeenCalled()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Settings' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Profile form for owner@example.test')
    ).toBeVisible()
  })

  it('should_surface_the_existing_guest_auth_failure', async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(
      new Error('Unauthorized')
    )

    await expect(VocabularySettingsPage()).rejects.toThrow('Unauthorized')
  })
})
