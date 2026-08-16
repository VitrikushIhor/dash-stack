import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type OrganizationSummary } from '@/entities/organization'
import { setActiveOrganizationAction } from '../api/set-active-organization.action'
import { OrganizationCard } from './organization-card'

vi.mock('../api/set-active-organization.action', () => ({
  setActiveOrganizationAction: vi.fn(),
}))

describe('OrganizationCard', () => {
  const mockOrg: OrganizationSummary = {
    id: 'org-555',
    name: 'Cyberdyne Systems',
    slug: 'cyberdyne',
    description: 'AI & Robotics research',
    logo: undefined,
    stats: {
      projects: 0,
      members: 12,
      events: 0,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders organization name, description, member count, and user role', () => {
    render(
      <OrganizationCard organization={mockOrg} role='Owner' memberCount={12} />
    )

    expect(screen.getByText('Cyberdyne Systems')).toBeInTheDocument()
    expect(screen.getByText('AI & Robotics research')).toBeInTheDocument()
    expect(screen.getByText('12 members')).toBeInTheDocument()
    expect(screen.getByText('owner')).toBeInTheDocument()
  })

  it('correctly handles singular member count label', () => {
    render(<OrganizationCard organization={mockOrg} memberCount={1} />)

    expect(screen.getByText('1 member')).toBeInTheDocument()
  })

  it('calls setActiveOrganizationAction and onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelectMock = vi.fn()

    render(<OrganizationCard organization={mockOrg} onSelect={onSelectMock} />)

    const cardLink = screen.getByRole('link', { name: /cyberdyne systems/i })
    await user.click(cardLink)

    expect(setActiveOrganizationAction).toHaveBeenCalledWith('org-555')
    expect(onSelectMock).toHaveBeenCalledWith(mockOrg)
  })
})
