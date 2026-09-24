import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type User } from '@/entities/user'
import { VocabularyNavigation } from './vocabulary-navigation'

const navigation = vi.hoisted(() => ({
  pathname: '/vocab/catalog',
  createDeck: null as string | null,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => ({
    get: (key: string) =>
      key === 'create-deck' ? navigation.createDeck : null,
  }),
}))

const user = {
  id: 'owner',
  firstName: 'Admin',
  email: 'admin@example.test',
} satisfies User

describe('VocabularyNavigation', () => {
  beforeEach(() => {
    navigation.pathname = '/vocab/catalog'
    navigation.createDeck = null
  })

  it('should_highlight_catalog_on_the_catalog_page', () => {
    render(<VocabularyNavigation user={user} />)

    expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'My decks' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('should_highlight_create_deck_when_the_create_flow_is_open', () => {
    navigation.pathname = '/vocab/decks'
    navigation.createDeck = 'true'

    render(<VocabularyNavigation user={user} />)

    expect(screen.getByRole('link', { name: 'Create deck' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'My decks' })).not.toHaveAttribute(
      'aria-current'
    )
  })
})
