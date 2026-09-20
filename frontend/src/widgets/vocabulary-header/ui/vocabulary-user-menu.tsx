'use client'

import Link from 'next/link'
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react'
import { getFileUrl } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { getUserDisplayName, getUserInitials } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { Button } from '@/shared/ui/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { type User } from '@/entities/user'
import { useLogout } from '@/features/auth'

type VocabularyUserMenuProps = {
  user: User
}

export function VocabularyUserMenu({ user }: VocabularyUserMenuProps) {
  const { isPending, handleLogout } = useLogout()
  const displayName = getUserDisplayName(
    user.firstName,
    user.lastName,
    user.email
  )
  const initials = getUserInitials(user.firstName, user.lastName, user.email)
  const avatarUrl = getFileUrl(user.avatar) ?? undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`User menu: ${displayName}, ${user.email}`}
          className='h-auto min-w-0 justify-start gap-2 px-1.5 py-1'
          variant='ghost'
        >
          <Avatar className='size-9 rounded-lg'>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
          </Avatar>
          <span className='hidden min-w-0 text-start leading-tight sm:grid'>
            <span className='truncate text-sm font-semibold'>
              {displayName}
            </span>
            <span className='text-muted-foreground truncate text-xs font-normal'>
              {user.email}
            </span>
          </span>
          <ChevronsUpDown className='size-4 shrink-0' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='min-w-56 rounded-lg' align='start'>
        <DropdownMenuLabel className='font-normal'>
          <div className='grid text-sm leading-tight'>
            <span className='truncate font-semibold'>{displayName}</span>
            <span className='text-muted-foreground truncate text-xs'>
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.vocabSettings}>
              <BadgeCheck />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          disabled={isPending}
          onClick={() => handleLogout()}
        >
          <LogOut />
          {isPending ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
