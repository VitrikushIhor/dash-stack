'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/core/sheet'
import { type User } from '@/entities/user'
import { useVocabularyNavigationState } from '../model/use-vocabulary-navigation-state'

type VocabularyMobileMenuProps = {
  user: User | null
}

export function VocabularyMobileMenu({ user }: VocabularyMobileMenuProps) {
  const { isCatalog, isMyDecks, isCreateDeck } = useVocabularyNavigationState()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label='Open menu'
          className='md:hidden'
          size='icon'
          variant='ghost'
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side='right'>
        <SheetTitle className='px-4 pt-4'>Vocabulary</SheetTitle>
        <nav
          aria-label='Vocabulary mobile navigation'
          className='flex flex-col gap-2 px-4'
        >
          <SheetClose asChild>
            <Button
              asChild
              className='justify-start'
              variant={isCatalog ? 'secondary' : 'ghost'}
            >
              <Link
                aria-current={isCatalog ? 'page' : undefined}
                href={ROUTES.vocabCatalog}
              >
                Catalog
              </Link>
            </Button>
          </SheetClose>
          {user && (
            <>
              <SheetClose asChild>
                <Button
                  asChild
                  className='justify-start'
                  variant={isMyDecks ? 'secondary' : 'ghost'}
                >
                  <Link
                    aria-current={isMyDecks ? 'page' : undefined}
                    href={ROUTES.vocabDecks}
                  >
                    My decks
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  asChild
                  className='justify-start'
                  variant={isCreateDeck ? 'secondary' : 'ghost'}
                >
                  <Link
                    aria-current={isCreateDeck ? 'page' : undefined}
                    href={`${ROUTES.vocabDecks}?create-deck=true`}
                  >
                    Create deck
                  </Link>
                </Button>
              </SheetClose>
            </>
          )}
          {!user && (
            <SheetClose asChild>
              <Button asChild className='justify-start' variant='outline'>
                <Link href={ROUTES.signIn}>Sign in</Link>
              </Button>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
