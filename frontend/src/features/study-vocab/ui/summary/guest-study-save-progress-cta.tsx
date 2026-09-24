'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import { useCurrentUser } from '@/entities/user'

export function GuestStudySaveProgressCta() {
  const { data: user } = useCurrentUser()
  const pathname = usePathname()

  if (user) {
    return null
  }

  const signInHref =
    pathname && pathname !== '/'
      ? `${ROUTES.signIn}?redirectTo=${encodeURIComponent(pathname)}`
      : ROUTES.signIn
  const signUpHref =
    pathname && pathname !== '/'
      ? `${ROUTES.signUp}?redirectTo=${encodeURIComponent(pathname)}`
      : ROUTES.signUp

  return (
    <section
      aria-labelledby='save-progress-title'
      className='border-primary/20 bg-primary/5 mb-8 w-full rounded-xl border p-5 text-left'
    >
      <h3 id='save-progress-title' className='text-base font-semibold'>
        Save your progress
      </h3>
      <p className='text-muted-foreground mt-1 text-sm'>
        Sign in or create an account to save your progress and return to it
        later.
      </p>
      <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
        <Button asChild size='sm' className='gap-2'>
          <Link href={signInHref}>
            <LogIn className='h-4 w-4' />
            Sign in
          </Link>
        </Button>
        <Button asChild size='sm' variant='outline' className='gap-2'>
          <Link href={signUpHref}>
            <UserPlus className='h-4 w-4' />
            Create account
          </Link>
        </Button>
      </div>
    </section>
  )
}
