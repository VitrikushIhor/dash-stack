import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { organizationServerApi } from '@/entities/organization/server'
import { createOrganizationAction } from './create-organization.action'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/entities/organization/server', () => ({
  organizationServerApi: {
    create: vi.fn(),
  },
}))

describe('createOrganizationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully creates an organization and revalidates cache tag', async () => {
    const mockOrg = {
      id: 'org-123',
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'A test company',
      logo: undefined,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }
    vi.mocked(organizationServerApi.create).mockResolvedValue(mockOrg)

    const result = await createOrganizationAction({
      name: 'Acme Corp',
      description: 'A test company',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockOrg)
    }
    expect(revalidateTag).toHaveBeenCalledWith('organizations')
  })

  it('returns failure when DTO validation fails (e.g. empty name)', async () => {
    const result = await createOrganizationAction({
      name: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
    expect(organizationServerApi.create).not.toHaveBeenCalled()
  })

  it('returns failure with error message when API throws ApiError', async () => {
    vi.mocked(organizationServerApi.create).mockRejectedValue(
      new ApiError(400, 'Organization name already taken')
    )

    const result = await createOrganizationAction({
      name: 'Existing Org',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Organization name already taken')
    }
  })
})
