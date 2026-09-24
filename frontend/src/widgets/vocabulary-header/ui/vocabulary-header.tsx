import { Suspense } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { ThemeSwitch } from '@/shared/ui/theme-switch'
import { type User } from '@/entities/user'
import { VocabularyHeaderActions } from './vocabulary-header-actions'
import { VocabularyMobileMenu } from './vocabulary-mobile-menu'
import { VocabularyNavigation } from './vocabulary-navigation'
import { VocabularyUserMenu } from './vocabulary-user-menu'

type VocabularyHeaderProps = {
  user: User | null
}

export function VocabularyHeader({ user }: VocabularyHeaderProps) {
  return (
    <header className='bg-background/95 border-b backdrop-blur'>
      <div className='flex h-16 items-center gap-3 p-4 sm:gap-4'>
        {user ? (
          <VocabularyHeaderActions
            fallback={<Skeleton className='h-11 w-44 rounded-md' />}
          >
            <VocabularyUserMenu user={user} />
          </VocabularyHeaderActions>
        ) : (
          <Link
            className='shrink-0 font-semibold tracking-tight'
            href={ROUTES.vocabCatalog}
          >
            Vocabulary
          </Link>
        )}
        <Suspense fallback={<Skeleton className='h-10 w-40 rounded-md' />}>
          <VocabularyNavigation user={user} />
        </Suspense>
        <div className='ms-auto flex items-center gap-2'>
          <VocabularyHeaderActions
            fallback={<Skeleton className='size-10 rounded-full' />}
          >
            <ThemeSwitch />
          </VocabularyHeaderActions>
          <VocabularyHeaderActions
            fallback={<Skeleton className='size-10 rounded-md md:hidden' />}
          >
            <Suspense fallback={<Skeleton className='h-10 w-40 rounded-md' />}>
              <VocabularyMobileMenu user={user} />
            </Suspense>
          </VocabularyHeaderActions>
          {!user && (
            <Button asChild size='sm' variant='outline'>
              <Link href={ROUTES.signIn}>Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
