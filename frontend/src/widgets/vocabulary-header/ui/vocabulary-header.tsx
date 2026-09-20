import Link from 'next/link'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { ThemeSwitch } from '@/shared/ui/theme-switch'
import { type User } from '@/entities/user'
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
          <VocabularyUserMenu user={user} />
        ) : (
          <Link
            className='shrink-0 font-semibold tracking-tight'
            href={ROUTES.vocabCatalog}
          >
            Vocabulary
          </Link>
        )}
        <VocabularyNavigation user={user} />
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <VocabularyMobileMenu user={user} />
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
