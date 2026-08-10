import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApiError } from '@/shared/api'
import { organizationServerApi } from '@/entities/organization/server'
import { createOrganizationAction } from './create-organization.action'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/entities/organization/server', () => ({
  organizationServerApi: {
    create: vi.fn(),
  },
}))

describe('createOrganizationAction', () => {
  const mockSetCookie = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue({
      set: mockSetCookie,
    } as unknown as Awaited<ReturnType<typeof cookies>>)
  })

  it('successfully creates an organization, sets active_org_id cookie and revalidates cache tag', async () => {
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
    expect(mockSetCookie).toHaveBeenCalledWith(
      'active_org_id',
      'org-123',
      expect.objectContaining({ httpOnly: false })
    )
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
