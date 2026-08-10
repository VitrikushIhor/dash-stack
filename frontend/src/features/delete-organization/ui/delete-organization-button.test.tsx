import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useDeleteOrganization } from '../model/use-delete-organization'
import { DeleteOrganizationButton } from './delete-organization-button'

vi.mock('../model/use-delete-organization', () => ({
  useDeleteOrganization: vi.fn(),
}))

describe('DeleteOrganizationButton', () => {
  const mockDeleteOrganization = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDeleteOrganization).mockReturnValue({
      deleteOrganization: mockDeleteOrganization,
      isPending: false,
    })
  })

  it('renders trigger button for organization deletion', () => {
    render(<DeleteOrganizationButton orgId='org-1' />)

    expect(
      screen.getByRole('button', { name: /delete organization/i })
    ).toBeInTheDocument()
  })

  it('opens confirmation modal and triggers deletion when confirmed', async () => {
    const user = userEvent.setup()
    render(<DeleteOrganizationButton orgId='org-1' />)

    const triggerBtn = screen.getByRole('button', {
      name: /delete organization/i,
    })
    await user.click(triggerBtn)

    expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', {
      name: 'Delete Organization',
    })
    await user.click(confirmBtn)

    expect(mockDeleteOrganization).toHaveBeenCalledWith('org-1')
  })
})
