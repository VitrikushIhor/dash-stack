'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Button } from '@/shared/ui/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { useLandingNavbarAuth } from './use-landing-navbar-auth'

interface LandingNavbarAuthProps {
  variant?: 'desktop' | 'mobile'
}

export function LandingNavbarAuth({
  variant = 'desktop',
}: LandingNavbarAuthProps) {
  const {
    isAuthenticated,
    isLoading,
    displayName,
    initials,
    email,
    avatar,
    isPendingLogout,
    logout,
  } = useLandingNavbarAuth()

  if (isLoading) {
    return variant === 'mobile' ? (
      <Skeleton className='h-10 w-full rounded-md' />
    ) : (
      <div className='flex items-center gap-3'>
        <Skeleton className='h-9 w-24 rounded-md' />
        <Skeleton className='h-8 w-8 rounded-full' />
      </div>
    )
  }

  if (variant === 'mobile') {
    if (isAuthenticated) {
      return (
        <>
          <div className='flex items-center gap-3 px-2 py-2'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={avatar ?? undefined} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{displayName}</span>
              <span className='text-muted-foreground text-xs'>{email}</span>
            </div>
          </div>
          <Button className='w-full' asChild>
            <Link href={ROUTES.createOrganization}>Go to App</Link>
          </Button>
          <Button
            variant='destructive'
            className='w-full'
            disabled={isPendingLogout}
            onClick={logout}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Sign out
          </Button>
        </>
      )
    }

    return (
      <div className='flex gap-3'>
        <Button variant='outline' className='flex-1' asChild>
          <Link href={ROUTES.signIn}>Sign In</Link>
        </Button>
        <Button
          className='bg-primary text-primary-foreground hover:bg-primary/90 flex-1'
          asChild
        >
          <Link href={ROUTES.signUp}>Start Free</Link>
        </Button>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <>
        <Button
          variant='outline'
          className='border-primary/20 text-primary hover:bg-primary/10'
          asChild
        >
          <Link href={ROUTES.createOrganization}>Go to App</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 rounded-full p-0'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={avatar ?? undefined} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  {displayName}
                </p>
                <p className='text-muted-foreground text-xs leading-none'>
                  {email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='cursor-pointer text-red-600'
              disabled={isPendingLogout}
              onClick={logout}
            >
              <LogOut className='mr-2 h-4 w-4' />
              {isPendingLogout ? 'Signing out...' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  return (
    <>
      <Button variant='outline' asChild>
        <Link href={ROUTES.signIn}>Sign In</Link>
      </Button>
      <Button
        className='bg-primary text-primary-foreground hover:bg-primary/90'
        asChild
      >
        <Link href={ROUTES.signUp}>Start Free</Link>
      </Button>
    </>
  )
}
