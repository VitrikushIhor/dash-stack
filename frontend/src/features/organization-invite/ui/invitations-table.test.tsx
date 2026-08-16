import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Invitation, OrgRole } from '@/entities/organization'
import { useRevokeInvite } from '../model/use-revoke-invite'
import { InvitationsTable } from './invitations-table'

// Mock the hook that handles the server action
vi.mock('../model/use-revoke-invite', () => ({
  useRevokeInvite: vi.fn(),
}))

const mockRevokeInvite = vi.fn()

const defaultInvitations: Invitation[] = [
  {
    id: 'invite-1',
    email: 'test1@example.com',
    role: OrgRole.MEMBER,
    orgId: 'org-1',
    token: 'token-1',
    invitedBy: 'admin-1',
    createdAt: '2026-12-01T00:00:00.000Z',
    expiresAt: '2026-12-31T00:00:00.000Z',
  },
  {
    id: 'invite-2',
    email: 'test2@example.com',
    role: OrgRole.ADMIN,
    orgId: 'org-1',
    token: 'token-2',
    invitedBy: 'admin-1',
    createdAt: '2026-12-01T00:00:00.000Z',
    expiresAt: '2026-12-31T00:00:00.000Z',
  },
]

describe('InvitationsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRevokeInvite).mockReturnValue({
      revokeInvite: mockRevokeInvite,
      isPending: false,
    })
  })

  it('renders "No results." when the invitations list is empty', () => {
    render(<InvitationsTable orgId='org-1' invitations={[]} />)
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('renders a list of invitations correctly', () => {
    render(<InvitationsTable orgId='org-1' invitations={defaultInvitations} />)

    // Check if emails are rendered
    expect(screen.getByText('test1@example.com')).toBeInTheDocument()
    expect(screen.getByText('test2@example.com')).toBeInTheDocument()

    // Check if roles are rendered
    expect(screen.getByText('MEMBER')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('calls revokeInvite when the revoke button is clicked', async () => {
    const user = userEvent.setup()
    render(<InvitationsTable orgId='org-1' invitations={defaultInvitations} />)

    // Find all revoke buttons
    const revokeButtons = screen.getAllByRole('button', {
      name: /revoke invitation/i,
    })
    expect(revokeButtons).toHaveLength(2)

    // Click the first one (invite-1)
    await user.click(revokeButtons[0])

    expect(mockRevokeInvite).toHaveBeenCalledTimes(1)
    expect(mockRevokeInvite).toHaveBeenCalledWith('org-1', 'invite-1')
  })

  it('disables ONLY the button for the row being revoked', async () => {
    const user = userEvent.setup()

    // For this test, we need `useRevokeInvite` to return `isPending: true` AFTER the button is clicked.
    // We can simulate this by re-rendering the component with updated mock values.
    const { rerender } = render(
      <InvitationsTable orgId='org-1' invitations={defaultInvitations} />
    )

    const revokeButtons = screen.getAllByRole('button', {
      name: /revoke invitation/i,
    })
    expect(revokeButtons[0]).not.toBeDisabled()
    expect(revokeButtons[1]).not.toBeDisabled()

    // User clicks the first row button
    await user.click(revokeButtons[0])

    // Mock the state change that would happen inside `useRevokeInvite`
    vi.mocked(useRevokeInvite).mockReturnValue({
      revokeInvite: mockRevokeInvite,
      isPending: true,
    })

    // Rerender with the new mock value (simulating React's re-render on state change)
    rerender(
      <InvitationsTable orgId='org-1' invitations={defaultInvitations} />
    )

    // Find buttons again
    const updatedButtons = screen.getAllByRole('button', {
      name: /revoke invitation/i,
    })

    // The clicked button should be disabled (revoking)
    expect(updatedButtons[0]).toBeDisabled()

    // The OTHER button should still be enabled (we only disable the revoking row)
    expect(updatedButtons[1]).not.toBeDisabled()
  })

  it('clears revokingId when isPending becomes false', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <InvitationsTable orgId='org-1' invitations={defaultInvitations} />
    )

    // Click to start revoking
    const revokeButtons = screen.getAllByRole('button', {
      name: /revoke invitation/i,
    })
    await user.click(revokeButtons[0])

    // Simulate pending state
    vi.mocked(useRevokeInvite).mockReturnValue({
      revokeInvite: mockRevokeInvite,
      isPending: true,
    })
    rerender(
      <InvitationsTable orgId='org-1' invitations={defaultInvitations} />
    )

    // Verify first button is disabled
    expect(
      screen.getAllByRole('button', { name: /revoke invitation/i })[0]
    ).toBeDisabled()

    // Simulate transition complete (isPending -> false)
    vi.mocked(useRevokeInvite).mockReturnValue({
      revokeInvite: mockRevokeInvite,
      isPending: false,
    })
    rerender(
      <InvitationsTable orgId='org-1' invitations={defaultInvitations} />
    )

    // Both buttons should be enabled again
    const finalButtons = screen.getAllByRole('button', {
      name: /revoke invitation/i,
    })
    expect(finalButtons[0]).not.toBeDisabled()
    expect(finalButtons[1]).not.toBeDisabled()
  })
})
