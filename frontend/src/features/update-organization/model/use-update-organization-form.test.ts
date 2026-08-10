import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { type Organization } from '@/entities/organization'
import { useUpdateOrganization } from './use-update-organization'
import { useUpdateOrganizationForm } from './use-update-organization-form'

vi.mock('./use-update-organization', () => ({
  useUpdateOrganization: vi.fn(),
}))

describe('useUpdateOrganizationForm', () => {
  const mockUpdateOrganization = vi.fn()

  const mockOrg: Organization = {
    id: 'org-200',
    name: 'Tech Inc',
    slug: 'tech-inc',
    description: 'Tech solutions provider',
    logo: 'https://example.com/logo.jpg',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateOrganization).mockReturnValue({
      updateOrganization: mockUpdateOrganization,
      isPending: false,
    })
  })

  it('pre-populates form with existing organization details', () => {
    const { result } = renderHook(() => useUpdateOrganizationForm(mockOrg))

    expect(result.current.form.getValues()).toEqual({
      name: 'Tech Inc',
      description: 'Tech solutions provider',
      logo: 'https://example.com/logo.jpg',
      logoFile: undefined,
    })
  })

  it('submits updated values when form is submitted', async () => {
    mockUpdateOrganization.mockResolvedValue(true)

    const { result } = renderHook(() => useUpdateOrganizationForm(mockOrg))

    await act(async () => {
      result.current.form.setValue('name', 'Tech Global Inc')
      await result.current.onSubmit()
    })

    expect(mockUpdateOrganization).toHaveBeenCalledWith(
      mockOrg,
      expect.objectContaining({ name: 'Tech Global Inc' }),
      expect.any(Object)
    )
  })
})
