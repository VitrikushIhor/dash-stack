import { useRouter } from 'next/navigation'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrgRole } from '@/entities/organization'
import { sendInviteAction } from '../api/actions/send-invite.action'
import { useInviteMemberModalStore } from '../model/use-invite-member-modal-store'
import { InviteMemberDialog } from './invite-member-dialog'

// Mock the state store to control dialog visibility
vi.mock('../model/use-invite-member-modal-store', () => ({
  useInviteMemberModalStore: vi.fn(),
}))

// Mock the server action
vi.mock('../api/actions/send-invite.action', () => ({
  sendInviteAction: vi.fn(),
}))

// Mock UI dependencies
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    handleServerError: vi.fn(),
  }
})

describe('InviteMemberDialog', () => {
  const mockClose = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useInviteMemberModalStore).mockReturnValue({
      isOpen: true,
      slug: 'org-1',
      close: mockClose,
      open: vi.fn(),
    })

    vi.mocked(useRouter).mockReturnValue({
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    })
  })

  it('renders correctly when open', () => {
    render(<InviteMemberDialog />)
    expect(screen.getByText('Invite Member')).toBeInTheDocument()
    expect(
      screen.getByText('Send an invitation to join your organization.')
    ).toBeInTheDocument()
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send invitation/i })
    ).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    vi.mocked(useInviteMemberModalStore).mockReturnValue({
      isOpen: false,
      slug: 'org-1',
      close: mockClose,
      open: vi.fn(),
    })

    render(<InviteMemberDialog />)
    expect(screen.queryByText('Invite Member')).not.toBeInTheDocument()
  })

  it('shows validation errors if submitted empty', async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog />)

    const submitButton = screen.getByRole('button', {
      name: /send invitation/i,
    })
    await user.click(submitButton)

    // Zod validation should kick in for the email field
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument()
    expect(sendInviteAction).not.toHaveBeenCalled()
  })

  it('submits successfully, closes modal, and shows success toast', async () => {
    vi.mocked(sendInviteAction).mockResolvedValue({
      success: true,
      data: {
        id: 'invite-1',
        email: 'test@example.com',
        role: OrgRole.MEMBER,
        orgId: 'org-1',
        token: 'token-1',
        invitedBy: 'admin-1',
        expiresAt: '2026-12-31T00:00:00.000Z',
        createdAt: '2026-12-01T00:00:00.000Z',
      },
    })
    const user = userEvent.setup()

    render(<InviteMemberDialog />)

    // Fill out the form
    const emailInput = screen.getByPlaceholderText('user@example.com')
    await user.type(emailInput, 'test@example.com')

    // Submit
    const submitButton = screen.getByRole('button', {
      name: /send invitation/i,
    })
    await user.click(submitButton)

    // Verify action called with correct data
    await waitFor(() => {
      expect(sendInviteAction).toHaveBeenCalledWith('org-1', {
        email: 'test@example.com',
        role: 'MEMBER', // default role in the form
      })
    })

    // Verify side effects
    expect(toast.success).toHaveBeenCalledWith('Invitation sent successfully')
    expect(mockClose).toHaveBeenCalledTimes(1)
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
