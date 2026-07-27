import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetOrganizations } from '@/entities/organization'
import { useIsAuthenticated } from '@/entities/session'
import { useCurrentUser } from '@/entities/user'
import { useLogout } from '@/features/auth'
import { LandingNavbarAuth } from './landing-navbar-auth'

vi.mock('@/entities/session', () => ({
  useIsAuthenticated: vi.fn(),
}))

vi.mock('@/entities/user', () => ({
  useCurrentUser: vi.fn(),
}))

vi.mock('@/entities/organization', () => ({
  useGetOrganizations: vi.fn(),
}))

vi.mock('@/features/auth', () => ({
  useLogout: vi.fn(),
}))

describe('LandingNavbarAuth', () => {
  const mockLogoutMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLogout).mockReturnValue({
      mutate: mockLogoutMutate,
      isPending: false,
    } as Partial<ReturnType<typeof useLogout>> as ReturnType<typeof useLogout>)
    vi.mocked(useGetOrganizations).mockReturnValue({
      data: [],
    } as Partial<ReturnType<typeof useGetOrganizations>> as ReturnType<
      typeof useGetOrganizations
    >)
  })

  it('displays "Sign In" and "Start Free" buttons in desktop mode when unauthenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({
      isAuthenticated: false,
    } as Partial<ReturnType<typeof useIsAuthenticated>> as ReturnType<
      typeof useIsAuthenticated
    >)
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as Partial<
      ReturnType<typeof useCurrentUser>
    > as ReturnType<typeof useCurrentUser>)

    render(<LandingNavbarAuth variant='desktop' />)

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /start free/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /go to app/i })
    ).not.toBeInTheDocument()
  })

  it('displays "Go to App" button and user avatar dropdown when authenticated in desktop mode', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({
      isAuthenticated: true,
    } as Partial<ReturnType<typeof useIsAuthenticated>> as ReturnType<
      typeof useIsAuthenticated
    >)
    vi.mocked(useCurrentUser).mockReturnValue({
      data: {
        id: 'usr-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)

    render(<LandingNavbarAuth variant='desktop' />)

    expect(screen.getByRole('link', { name: /go to app/i })).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument() // Avatar fallback
    expect(
      screen.queryByRole('link', { name: /sign in/i })
    ).not.toBeInTheDocument()
  })

  it('displays user info, "Go to App" button, and "Sign out" button inline without a dropdown when authenticated in mobile mode', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({
      isAuthenticated: true,
    } as Partial<ReturnType<typeof useIsAuthenticated>> as ReturnType<
      typeof useIsAuthenticated
    >)
    vi.mocked(useCurrentUser).mockReturnValue({
      data: {
        id: 'usr-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)

    render(<LandingNavbarAuth variant='mobile' />)

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to app/i })).toBeInTheDocument()

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    expect(signOutButton).toBeInTheDocument()

    fireEvent.click(signOutButton)
    expect(mockLogoutMutate).toHaveBeenCalledTimes(1)
  })

  it('triggers the logout mutation when clicking "Sign out" in the dropdown', async () => {
    const userEvent = (
      await import('@testing-library/user-event')
    ).default.setup()
    vi.mocked(useIsAuthenticated).mockReturnValue({
      isAuthenticated: true,
    } as Partial<ReturnType<typeof useIsAuthenticated>> as ReturnType<
      typeof useIsAuthenticated
    >)
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as Partial<
      ReturnType<typeof useCurrentUser>
    > as ReturnType<typeof useCurrentUser>)

    render(<LandingNavbarAuth variant='desktop' />)

    const avatarButton = screen.getByRole('button', { expanded: false })
    await userEvent.click(avatarButton)

    const signOutMenuItem = await screen.findByRole('menuitem', {
      name: /sign out/i,
    })
    await userEvent.click(signOutMenuItem)

    expect(mockLogoutMutate).toHaveBeenCalledTimes(1)
  })
})
