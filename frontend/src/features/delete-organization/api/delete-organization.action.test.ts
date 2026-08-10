import { revalidateTag } from 'next/cache'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApiError } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { organizationServerApi } from '@/entities/organization/server'
import { deleteOrganizationAction } from './delete-organization.action'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/entities/organization/server', () => ({
  organizationServerApi: {
    delete: vi.fn(),
  },
}))

describe('deleteOrganizationAction', () => {
  const validOrgId = 'cju1234567890123456789012'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully deletes an organization and triggers revalidation', async () => {
    vi.mocked(organizationServerApi.delete).mockResolvedValue({
      message: 'Organization deleted',
    })

    const result = await deleteOrganizationAction(validOrgId)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toBe('Organization deleted')
    }
    expect(revalidateTag).toHaveBeenCalledWith(SERVER_CACHE_TAGS.organizations)
    expect(revalidateTag).toHaveBeenCalledWith(
      SERVER_CACHE_TAGS.orgDetail(validOrgId)
    )
  })

  it('returns failure when given invalid empty orgId', async () => {
    const result = await deleteOrganizationAction('')

    expect(result.success).toBe(false)
    expect(organizationServerApi.delete).not.toHaveBeenCalled()
  })

  it('returns failure response when ApiError occurs', async () => {
    vi.mocked(organizationServerApi.delete).mockRejectedValue(
      new ApiError(404, 'Organization not found')
    )

    const result = await deleteOrganizationAction(validOrgId)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Organization not found')
    }
  })
})
