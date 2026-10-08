import { describe, expect, it, vi } from 'vitest'
import {
  getOrganizationBySlug,
  getOrganizationMembers,
} from '@/entities/organization/server'
import OrganizationMembersPage from './page'

vi.mock('@/entities/organization/server', () => ({
  getOrganizationBySlug: vi.fn(),
  getOrganizationMembers: vi.fn(),
}))

describe('OrganizationMembersPage', () => {
  it('should_start_members_request_before_organization_result_settles', async () => {
    let resolveOrganization!: (
      value: Awaited<ReturnType<typeof getOrganizationBySlug>>
    ) => void
    vi.mocked(getOrganizationBySlug).mockReturnValue(
      new Promise((resolve) => {
        resolveOrganization = resolve
      })
    )
    vi.mocked(getOrganizationMembers).mockResolvedValue({ ok: true, data: [] })

    const page = OrganizationMembersPage({
      params: Promise.resolve({ slug: 'acme-corp' }),
    })

    await vi.waitFor(() =>
      expect(getOrganizationMembers).toHaveBeenCalledWith('acme-corp')
    )
    resolveOrganization({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Organization unavailable' },
    })
    expect((await page).props.error.message).toBe('Organization unavailable')
  })
})
