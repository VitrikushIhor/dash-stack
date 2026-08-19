import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerError, resolveLogoUrl } from '@/shared/api'
import { type Organization } from '@/entities/organization'
import { updateOrganizationAction } from '../api/update-organization.action'
import { useUpdateOrganization } from './use-update-organization'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    useUploadImage: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    resolveLogoUrl: vi.fn(),
    handleServerError: vi.fn(),
  }
})

vi.mock('../api/update-organization.action', () => ({
  updateOrganizationAction: vi.fn(),
}))

describe('useUpdateOrganization', () => {
  const baseOrg: Organization = {
    id: 'org-100',
    name: 'Original Name',
    slug: 'original-name',
    description: 'Original description',
    logo: 'https://example.com/old-logo.png',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers update action only for modified fields and displays success toast', async () => {
    vi.mocked(resolveLogoUrl).mockResolvedValue(
      'https://example.com/old-logo.png'
    )
    vi.mocked(updateOrganizationAction).mockResolvedValue({
      success: true,
      data: {
        ...baseOrg,
        name: 'Brand New Name',
      },
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useUpdateOrganization())

    let success = false
    await act(async () => {
      success = await result.current.updateOrganization(
        baseOrg,
        {
          name: 'Brand New Name',
          description: 'Original description',
          logo: 'https://example.com/old-logo.png',
          logoFile: undefined,
        },
        { onSuccess }
      )
    })

    expect(success).toBe(true)
    expect(updateOrganizationAction).toHaveBeenCalledWith('original-name', {
      name: 'Brand New Name',
    })
    expect(toast.success).toHaveBeenCalledWith(
      'Organization updated successfully!'
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('does not invoke update action if no fields were actually changed', async () => {
    vi.mocked(resolveLogoUrl).mockResolvedValue(
      'https://example.com/old-logo.png'
    )

    const { result } = renderHook(() => useUpdateOrganization())

    let success = false
    await act(async () => {
      success = await result.current.updateOrganization(baseOrg, {
        name: 'Original Name',
        description: 'Original description',
        logo: 'https://example.com/old-logo.png',
        logoFile: undefined,
      })
    })

    expect(success).toBe(true)
    expect(updateOrganizationAction).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith(
      'Organization updated successfully!'
    )
  })

  it('handles server action error response with handleServerError', async () => {
    vi.mocked(resolveLogoUrl).mockResolvedValue(
      'https://example.com/old-logo.png'
    )
    vi.mocked(updateOrganizationAction).mockResolvedValue({
      success: false,
      error: 'Update failed',
    })

    const { result } = renderHook(() => useUpdateOrganization())

    let success = false
    await act(async () => {
      success = await result.current.updateOrganization(baseOrg, {
        name: 'Failed Name Change',
        description: 'Original description',
        logo: 'https://example.com/old-logo.png',
        logoFile: undefined,
      })
    })

    expect(success).toBe(false)
    expect(handleServerError).toHaveBeenCalledWith('Update failed')
  })
})
