import { useRouter } from 'next/navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SidebarProvider } from '@/shared/ui/core/sidebar'
import {
  OrgRole,
  type OrganizationSummary,
  type UserMembership,
} from '@/entities/organization'
import { setActiveOrganizationAction } from '@/features/switch-organization/server'
import { TeamSwitcherUI } from './team-switcher-ui'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/features/switch-organization/server', () => ({
  setActiveOrganizationAction: vi.fn(),
}))

describe('TeamSwitcherUI', () => {
  const mockPush = vi.fn()

  const activeOrg: OrganizationSummary = {
    id: 'org-1',
    name: 'Active Corp',
    slug: 'active-corp',
    description: 'Active organization',
    logo: undefined,
  }

  const memberships: UserMembership[] = [
    {
      role: OrgRole.ADMIN,
      organization: activeOrg,
    },
    {
      role: OrgRole.MEMBER,
      organization: {
        id: 'org-2',
        name: 'Secondary Corp',
        slug: 'secondary-corp',
        description: undefined,
        logo: undefined,
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>)
  })

  it('renders active organization name and slug in trigger button', () => {
    render(
      <SidebarProvider>
        <TeamSwitcherUI activeOrg={activeOrg} memberships={memberships} />
      </SidebarProvider>
    )

    expect(screen.getByText('Active Corp')).toBeInTheDocument()
    expect(screen.getByText('active-corp')).toBeInTheDocument()
  })

  it('opens dropdown menu with organization memberships and Add organization option when clicked', async () => {
    const user = userEvent.setup()
    render(
      <SidebarProvider>
        <TeamSwitcherUI activeOrg={activeOrg} memberships={memberships} />
      </SidebarProvider>
    )

    const trigger = screen.getByRole('button', { name: /active corp/i })
    await user.click(trigger)

    expect(screen.getByText('Organizations')).toBeInTheDocument()
    expect(screen.getByText('Secondary Corp')).toBeInTheDocument()
    expect(screen.getByText('Add organization')).toBeInTheDocument()
  })

  it('switches organization when menu item is selected', async () => {
    const user = userEvent.setup()
    render(
      <SidebarProvider>
        <TeamSwitcherUI activeOrg={activeOrg} memberships={memberships} />
      </SidebarProvider>
    )

    const trigger = screen.getByRole('button', { name: /active corp/i })
    await user.click(trigger)

    const secondOrgItem = screen.getByText('Secondary Corp')
    await user.click(secondOrgItem)

    expect(setActiveOrganizationAction).toHaveBeenCalledWith('org-2')
    expect(mockPush).toHaveBeenCalledWith('/organizations/org-2')
  })
})
