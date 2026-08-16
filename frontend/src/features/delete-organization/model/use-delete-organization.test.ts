import { useRouter } from 'next/navigation'
import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerError } from '@/shared/api'
import { deleteOrganizationAction } from '../api/delete-organization.action'
import { useDeleteOrganization } from './use-delete-organization'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

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
    handleServerError: vi.fn(),
  }
})

vi.mock('../api/delete-organization.action', () => ({
  deleteOrganizationAction: vi.fn(),
}))

describe('useDeleteOrganization', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>)
  })

  it('deletes organization successfully, displays toast, calls onSuccess, and redirects user', async () => {
    vi.mocked(deleteOrganizationAction).mockResolvedValue({
      success: true,
      data: { message: 'Deleted' },
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useDeleteOrganization({ onSuccess, redirectTo: '/custom-redirect' })
    )

    let success = false
    await act(async () => {
      success = await result.current.deleteOrganization('org-999')
    })

    expect(success).toBe(true)
    expect(deleteOrganizationAction).toHaveBeenCalledWith('org-999')
    expect(toast.success).toHaveBeenCalledWith(
      'Organization deleted successfully'
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/custom-redirect')
  })

  it('handles deletion error from server action', async () => {
    vi.mocked(deleteOrganizationAction).mockResolvedValue({
      success: false,
      error: 'Cannot delete organization with active subscriptions',
    })

    const { result } = renderHook(() => useDeleteOrganization())

    let success = false
    await act(async () => {
      success = await result.current.deleteOrganization('org-999')
    })

    expect(success).toBe(false)
    expect(handleServerError).toHaveBeenCalledWith(
      'Cannot delete organization with active subscriptions'
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
