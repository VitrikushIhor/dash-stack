import Link from 'next/link'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type User } from '@/entities/user'
import { VocabularyHeader } from './vocabulary-header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/vocab/catalog',
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('./vocabulary-mobile-menu', () => ({
  VocabularyMobileMenu: () => <div>Mobile menu</div>,
}))
vi.mock('./vocabulary-user-menu', () => ({
  VocabularyUserMenu: ({ user }: { user: User }) => (
    <button aria-label={`User menu: ${user.firstName} User, ${user.email}`}>
      {user.firstName}
    </button>
  ),
}))
vi.mock('@/shared/ui/theme-switch', () => ({
  ThemeSwitch: () => <div>Theme switch</div>,
}))
const owner = {
  id: 'owner',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.test',
} satisfies User

const navigationState = vi.hoisted(() => ({
  shouldSuspend: false,
}))

vi.mock('./vocabulary-navigation', () => ({
  VocabularyNavigation: ({ user }: { user: User | null }) => {
    if (navigationState.shouldSuspend) {
      throw new Promise<never>(() => undefined)
    }

    return (
      <nav aria-label='Vocabulary navigation'>
        <Link href='/vocab/catalog'>Catalog</Link>
        {user && (
          <>
            <Link href='/vocab/decks'>My decks</Link>
            <Link href='/vocab/decks?create-deck=true'>Create deck</Link>
          </>
        )}
      </nav>
    )
  },
}))

function renderHeader(user: User | null) {
  return render(<VocabularyHeader user={user} />)
}

describe('VocabularyHeader', () => {
  beforeEach(() => {
    navigationState.shouldSuspend = false
  })

  it('should_place_the_user_menu_before_vocabulary_navigation', () => {
    renderHeader(owner)

    const header = screen.getByRole('banner')
    const userMenu = within(header).getByRole('button', {
      name: 'User menu: Admin User, admin@example.test',
    })
    const navigation = within(header).getByRole('navigation', {
      name: 'Vocabulary navigation',
    })
    const headerContainer = header.firstElementChild

    expect(headerContainer).toHaveClass('p-4')
    expect(headerContainer).not.toHaveClass('max-w-7xl')
    expect(
      userMenu.compareDocumentPosition(navigation) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      within(navigation).getByRole('link', { name: 'Catalog' })
    ).toHaveAttribute('href', '/vocab/catalog')
    expect(
      within(navigation).getByRole('link', { name: 'Create deck' })
    ).toHaveAttribute('href', '/vocab/decks?create-deck=true')
  })

  it('should_keep_catalog_and_sign_in_available_to_a_guest', () => {
    renderHeader(null)

    expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute(
      'href',
      '/vocab/catalog'
    )
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in'
    )
    expect(screen.queryByRole('link', { name: 'Create deck' })).toBeNull()
  })

  it('should_keep_guest_identity_actions_available_when_navigation_suspends', () => {
    navigationState.shouldSuspend = true

    renderHeader(null)

    expect(screen.getByRole('link', { name: 'Vocabulary' })).toHaveAttribute(
      'href',
      '/vocab/catalog'
    )
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in'
    )
  })
})
