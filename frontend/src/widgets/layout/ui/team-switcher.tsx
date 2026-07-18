import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Building2, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { Skeleton } from '@/shared/ui/core/skeleton'
import { useActiveOrganization } from '@/entities/organization'

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const { activeOrg, memberships, isLoading, setActiveOrgId } =
    useActiveOrganization()
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className='flex items-center gap-2 p-2'>
            <Skeleton className='size-8 rounded-lg' />
            <div className='flex flex-col gap-1'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-2 w-16' />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            onClick={() => navigate({ to: '/organizations' })}
            className='text-muted-foreground'
          >
            <div className='bg-sidebar-accent flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Building2 className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>No organization</span>
              <span className='truncate text-xs'>Create or join one</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold'>
                {activeOrg.logo ? (
                  <img
                    src={activeOrg.logo}
                    alt={activeOrg.name}
                    className='size-full rounded-lg object-cover'
                  />
                ) : (
                  activeOrg.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{activeOrg.name}</span>
                <span className='text-sidebar-foreground/70 truncate text-xs'>
                  {activeOrg.slug}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Organizations
            </DropdownMenuLabel>
            {memberships?.map((membership) => (
              <DropdownMenuItem
                key={membership.organization.id}
                onClick={() => {
                  setActiveOrgId(membership.organization.id)
                  navigate({
                    to: '/organizations/$orgId',
                    params: { orgId: membership.organization.id },
                  })
                }}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border text-xs font-bold'>
                  {membership.organization.logo ? (
                    <img
                      src={membership.organization.logo}
                      alt={membership.organization.name}
                      className='size-full rounded-sm object-cover'
                    />
                  ) : (
                    membership.organization.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className='flex-1 truncate'>
                  {membership.organization.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => navigate({ to: '/organizations' })}
            >
              <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
