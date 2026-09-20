import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type User } from '@/entities/user'
import { useLogout } from '@/features/auth'
import { VocabularyUserMenu } from './vocabulary-user-menu'

vi.mock('@/features/auth', () => ({
  useLogout: vi.fn(),
}))

const user = {
  id: 'owner',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.test',
} satisfies User

describe('VocabularyUserMenu', () => {
  it('should_expose_profile_and_sign_out_from_the_user_menu', async () => {
    const handleLogout = vi.fn()
    vi.mocked(useLogout).mockReturnValue({
      handleLogout,
      isPending: false,
    })

    render(<VocabularyUserMenu user={user} />)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'User menu: Admin User, admin@example.test',
      })
    )

    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/vocab/settings'
    )
    expect(
      screen.getByRole('menuitem', { name: 'Sign out' })
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }))

    expect(handleLogout).toHaveBeenCalledOnce()
  })
})
