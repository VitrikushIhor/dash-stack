import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type User } from '@/entities/user'
import { VocabularyMobileMenu } from './vocabulary-mobile-menu'

const navigation = vi.hoisted(() => ({
  pathname: '/vocab/decks',
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => ({ get: () => null }),
}))

const user = {
  id: 'owner',
  firstName: 'Admin',
  email: 'admin@example.test',
} satisfies User

describe('VocabularyMobileMenu', () => {
  beforeEach(() => {
    navigation.pathname = '/vocab/decks'
  })

  it('should_expose_owner_navigation_in_the_mobile_menu', async () => {
    render(<VocabularyMobileMenu user={user} />)

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    const mobileMenu = screen.getByRole('dialog')
    expect(
      within(mobileMenu).getByRole('link', { name: 'Catalog' })
    ).toHaveAttribute('href', '/vocab/catalog')
    expect(
      within(mobileMenu).getByRole('link', { name: 'My decks' })
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(mobileMenu).getByRole('link', { name: 'Create deck' })
    ).toHaveAttribute('href', '/vocab/decks?create-deck=true')
  })
})
