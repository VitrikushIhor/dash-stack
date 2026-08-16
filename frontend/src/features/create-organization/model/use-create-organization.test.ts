import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { resolveLogoUrl, handleServerError } from '@/shared/api'
import { createOrganizationAction } from '../api/create-organization.action'
import { useCreateOrganization } from './use-create-organization'

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

vi.mock('../api/create-organization.action', () => ({
  createOrganizationAction: vi.fn(),
}))

describe('useCreateOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an organization successfully, displays toast, and triggers onSuccess callback', async () => {
    vi.mocked(resolveLogoUrl).mockResolvedValue('https://example.com/logo.png')
    vi.mocked(createOrganizationAction).mockResolvedValue({
      success: true,
      data: {
        id: 'org-1',
        name: 'New Corp',
        slug: 'new-corp',
        description: 'Desc',
        logo: 'https://example.com/logo.png',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateOrganization())

    let success = false
    await act(async () => {
      success = await result.current.createOrganization(
        {
          name: 'New Corp',
          description: 'Desc',
          logo: '',
          logoFile: null,
        },
        { onSuccess }
      )
    })

    expect(success).toBe(true)
    expect(toast.success).toHaveBeenCalledWith(
      'Organization New Corp created successfully!'
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('handles organization creation failure and passes server error to handler', async () => {
    vi.mocked(resolveLogoUrl).mockResolvedValue(null)
    vi.mocked(createOrganizationAction).mockResolvedValue({
      success: false,
      error: 'Name is already in use',
    })

    const { result } = renderHook(() => useCreateOrganization())

    let success = false
    await act(async () => {
      success = await result.current.createOrganization({
        name: 'Duplicate Corp',
        description: '',
        logo: '',
        logoFile: null,
      })
    })

    expect(success).toBe(false)
    expect(handleServerError).toHaveBeenCalledWith('Name is already in use')
    expect(toast.success).not.toHaveBeenCalled()
  })
})
