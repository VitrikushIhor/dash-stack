'use client'

import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { type User } from '@/entities/user'
import { useVocabularyNavigationState } from '../model/use-vocabulary-navigation-state'

type VocabularyNavigationProps = {
  user: User | null
}

export function VocabularyNavigation({ user }: VocabularyNavigationProps) {
  const { isCatalog, isMyDecks, isCreateDeck } = useVocabularyNavigationState()

  return (
    <nav
      aria-label='Vocabulary navigation'
      className='hidden items-center gap-1 md:flex md:gap-2'
    >
      <Button asChild size='sm' variant={isCatalog ? 'secondary' : 'ghost'}>
        <Link
          aria-current={isCatalog ? 'page' : undefined}
          href={ROUTES.vocabCatalog}
        >
          Catalog
        </Link>
      </Button>
      {user && (
        <>
          <Button asChild size='sm' variant={isMyDecks ? 'secondary' : 'ghost'}>
            <Link
              aria-current={isMyDecks ? 'page' : undefined}
              href={ROUTES.vocabDecks}
            >
              My decks
            </Link>
          </Button>
          <Button
            asChild
            size='sm'
            variant={isCreateDeck ? 'secondary' : 'ghost'}
          >
            <Link
              aria-current={isCreateDeck ? 'page' : undefined}
              href={`${ROUTES.vocabDecks}?create-deck=true`}
            >
              Create deck
            </Link>
          </Button>
        </>
      )}
    </nav>
  )
}
