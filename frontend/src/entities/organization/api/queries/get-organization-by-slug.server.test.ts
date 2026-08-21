import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrgRole } from '@/shared/model'
import { organizationServerApi } from '../organization-api.server'
import { getOrganizationBySlug } from './get-organization-by-slug.server'

vi.mock('../organization-api.server', () => ({
  organizationServerApi: {
    getBySlug: vi.fn(),
  },
}))

describe('getOrganizationBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns organization data when slug matches and API succeeds', async () => {
    const mockOrgDetail = {
      id: 'cly1234567890123456789012',
      name: 'Acme Corp',
      slug: 'acme-corp',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      currentUserRole: OrgRole.OWNER,
    }

    vi.mocked(organizationServerApi.getBySlug).mockResolvedValue(mockOrgDetail)

    const result = await getOrganizationBySlug('acme-corp')

    expect(result).toEqual({
      data: mockOrgDetail,
      error: null,
    })
    expect(organizationServerApi.getBySlug).toHaveBeenCalledWith('acme-corp')
  })

  it('returns error when organization details query fails (e.g. 403 or 404)', async () => {
    vi.mocked(organizationServerApi.getBySlug).mockRejectedValue(
      new Error('Organization not found or access denied')
    )

    const result = await getOrganizationBySlug('unknown-org')

    expect(result).toEqual({
      data: null,
      error: 'Organization not found or access denied',
    })
    expect(organizationServerApi.getBySlug).toHaveBeenCalledWith('unknown-org')
  })

  it('handles network/API rejection gracefully', async () => {
    vi.mocked(organizationServerApi.getBySlug).mockRejectedValue(
      new Error('Network error')
    )

    const result = await getOrganizationBySlug('acme-corp')

    expect(result).toEqual({
      data: null,
      error: 'Network error',
    })
  })
})
