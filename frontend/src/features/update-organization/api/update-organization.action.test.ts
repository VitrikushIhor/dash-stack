import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { organizationServerApi } from '@/entities/organization/server'
import { updateOrganizationAction } from './update-organization.action'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/entities/organization/server', () => ({
  organizationServerApi: {
    update: vi.fn(),
  },
}))

describe('updateOrganizationAction', () => {
  const validSlug = 'acme-corp'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully updates an organization and revalidates relevant cache tags', async () => {
    const mockUpdatedOrg = {
      id: 'cju1234567890123456789012',
      name: 'Updated Name',
      slug: 'updated-name',
      description: 'Updated Description',
      logo: undefined,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    }
    vi.mocked(organizationServerApi.update).mockResolvedValue(mockUpdatedOrg)

    const result = await updateOrganizationAction(validSlug, {
      name: 'Updated Name',
      description: 'Updated Description',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockUpdatedOrg)
    }
    expect(revalidateTag).toHaveBeenCalledWith(SERVER_CACHE_TAGS.organizations)
    expect(revalidateTag).toHaveBeenCalledWith(
      SERVER_CACHE_TAGS.orgDetail(validSlug)
    )
  })

  it('returns failure when organization ID is invalid', async () => {
    const result = await updateOrganizationAction('', {
      name: 'New Name',
    })

    expect(result.success).toBe(false)
    expect(organizationServerApi.update).not.toHaveBeenCalled()
  })

  it('handles ApiError correctly on update failure', async () => {
    vi.mocked(organizationServerApi.update).mockRejectedValue(
      new ApiError(403, 'Permission denied')
    )

    const result = await updateOrganizationAction(validSlug, {
      name: 'Forbidden Name',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Permission denied')
    }
  })
})
