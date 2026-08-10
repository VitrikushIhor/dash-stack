import { useRouter } from 'next/navigation'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useCreateOrganization } from './use-create-organization'
import { useCreateOrganizationForm } from './use-create-organization-form'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('./use-create-organization', () => ({
  useCreateOrganization: vi.fn(),
}))

describe('useCreateOrganizationForm', () => {
  const mockReplace = vi.fn()
  const mockCreateOrganization = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
    } as unknown as ReturnType<typeof useRouter>)

    vi.mocked(useCreateOrganization).mockReturnValue({
      createOrganization: mockCreateOrganization,
      isPending: false,
    })
  })

  it('initializes form with empty default values', () => {
    const { result } = renderHook(() => useCreateOrganizationForm())

    expect(result.current.form.getValues()).toEqual({
      name: '',
      description: '',
      logo: '',
      logoFile: null,
    })
    expect(result.current.isPending).toBe(false)
  })

  it('resets form, triggers onSuccess, and redirects to organizations on successful submission', async () => {
    mockCreateOrganization.mockImplementation(async (_values, options) => {
      options?.onSuccess?.()
      return true
    })

    const onSuccessMock = vi.fn()
    const { result } = renderHook(() =>
      useCreateOrganizationForm({ onSuccess: onSuccessMock })
    )

    await act(async () => {
      result.current.form.setValue('name', 'Valid Organization')
      await result.current.onSubmit()
    })

    expect(mockCreateOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Valid Organization' }),
      expect.any(Object)
    )
    expect(onSuccessMock).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith('/organizations')
  })
})
