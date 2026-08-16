import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { type Organization } from '@/entities/organization'
import { useUpdateOrganization } from '../model/use-update-organization'
import { OrganizationSettingsForm } from './organization-settings-form'

vi.mock('../model/use-update-organization', () => ({
  useUpdateOrganization: vi.fn(),
}))

describe('OrganizationSettingsForm', () => {
  const mockOrg: Organization = {
    id: 'cju1234567890123456789012',
    name: 'Acme Corp',
    slug: 'acme-corp',
    description: 'Existing description',
    logo: 'https://example.com/logo.png',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  }

  const mockUpdateOrganization = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateOrganization).mockReturnValue({
      updateOrganization: mockUpdateOrganization,
      isPending: false,
    })
  })

  it('renders pre-populated organization name and description labels', () => {
    render(<OrganizationSettingsForm organization={mockOrg} />)

    expect(screen.getByLabelText(/organization name/i)).toHaveValue('Acme Corp')
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Existing description'
    )
  })

  it('disables save button when form is untouched (not dirty)', () => {
    render(<OrganizationSettingsForm organization={mockOrg} />)

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' })
    expect(saveBtn).toBeDisabled()
  })

  it('enables save button and submits when input values are modified', async () => {
    const user = userEvent.setup()
    mockUpdateOrganization.mockResolvedValue(true)

    render(<OrganizationSettingsForm organization={mockOrg} />)

    const nameInput = screen.getByLabelText(/organization name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Acme Global Corp')

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' })
    expect(saveBtn).toBeEnabled()

    await user.click(saveBtn)

    expect(mockUpdateOrganization).toHaveBeenCalledWith(
      mockOrg,
      expect.objectContaining({ name: 'Acme Global Corp' }),
      expect.any(Object)
    )
  })
})
