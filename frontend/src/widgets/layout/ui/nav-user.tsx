'use client'

import Link from 'next/link'
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react'
import { getFileUrl } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { getUserInitials, getUserDisplayName } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/core/sidebar'
import { useCurrentUser } from '@/entities/user'
import { useLogout } from '@/features/auth'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()

  const displayName = getUserDisplayName(
    user?.firstName,
    user?.lastName,
    user?.email
  )
  const initials = getUserInitials(user?.firstName, user?.lastName, user?.email)
  const avatarUrl = getFileUrl(user?.avatar) ?? undefined

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <NavUserTrigger
            displayName={displayName}
            email={user?.email}
            avatarUrl={avatarUrl}
            initials={initials}
          />
          <NavUserDropdown
            isMobile={isMobile}
            displayName={displayName}
            email={user?.email}
            avatarUrl={avatarUrl}
            initials={initials}
            onLogout={handleLogout}
            isLoggingOut={logoutMutation.isPending}
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavUserTrigger({
  displayName,
  email,
  avatarUrl,
  initials,
}: {
  displayName: string
  email?: string
  avatarUrl?: string
  initials: string
}) {
  return (
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size='lg'
        className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
      >
        <Avatar className='h-8 w-8 rounded-lg'>
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
        </Avatar>
        <div className='grid flex-1 text-start text-sm leading-tight'>
          <span className='truncate font-semibold'>{displayName}</span>
          <span className='truncate text-xs'>{email}</span>
        </div>
        <ChevronsUpDown className='ms-auto size-4' />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  )
}

function NavUserDropdown({
  isMobile,
  displayName,
  email,
  avatarUrl,
  initials,
  onLogout,
  isLoggingOut,
}: {
  isMobile: boolean
  displayName: string
  email?: string
  avatarUrl?: string
  initials: string
  onLogout: () => void
  isLoggingOut: boolean
}) {
  return (
    <DropdownMenuContent
      className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
      side={isMobile ? 'bottom' : 'right'}
      align='end'
      sideOffset={4}
    >
      <DropdownMenuLabel className='p-0 font-normal'>
        <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
          <Avatar className='h-8 w-8 rounded-lg'>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
          </Avatar>
          <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>{displayName}</span>
            <span className='truncate text-xs'>{email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.settings}>
            <BadgeCheck />
            Profile
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant='destructive'
        disabled={isLoggingOut}
        onClick={onLogout}
      >
        <LogOut />
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
