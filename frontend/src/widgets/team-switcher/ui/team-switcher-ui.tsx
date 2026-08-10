'use client'

import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { ROUTES } from '@/shared/config'
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
import {
  OrganizationLogo,
  type UserMembership,
  type OrganizationSummary,
} from '@/entities/organization'
import { setActiveOrganizationAction } from '@/features/switch-organization/server'

type Props = {
  activeOrg: OrganizationSummary
  memberships: UserMembership[] | undefined
}

export function TeamSwitcherUI({ activeOrg, memberships }: Props) {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const handleOrgSelect = async (orgId: string) => {
    await setActiveOrganizationAction(orgId)
    router.push(`${ROUTES.organizations}/${orgId}`)
  }

  const handleCreateOrg = () => {
    router.push(ROUTES.organizations)
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
              <OrganizationLogo
                name={activeOrg.name}
                logo={activeOrg.logo}
                size={32}
                className='bg-sidebar-primary text-sidebar-primary-foreground aspect-square size-8 rounded-lg text-xs'
              />
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{activeOrg.name}</span>
                <span className='text-sidebar-foreground/70 truncate text-xs'>
                  {activeOrg.slug}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <TeamSwitcherList
            memberships={memberships}
            isMobile={isMobile}
            onSelect={handleOrgSelect}
            onCreate={handleCreateOrg}
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function TeamSwitcherList({
  memberships,
  isMobile,
  onSelect,
  onCreate,
}: {
  memberships: UserMembership[] | undefined
  isMobile: boolean
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  return (
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
          onClick={() => onSelect(membership.organization.id)}
          className='gap-2 p-2'
        >
          <OrganizationLogo
            name={membership.organization.name}
            logo={membership.organization.logo}
            size={24}
            className='size-6 rounded-sm border text-xs'
          />
          <span className='flex-1 truncate'>
            {membership.organization.name}
          </span>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className='gap-2 p-2' onClick={onCreate}>
        <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
          <Plus className='size-4' />
        </div>
        <div className='text-muted-foreground font-medium'>
          Add organization
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
