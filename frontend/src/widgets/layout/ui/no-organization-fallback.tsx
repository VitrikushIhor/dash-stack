import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/core/sidebar'

export function NoOrganizationFallback() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className='text-muted-foreground' asChild>
          <Link href={ROUTES.organizations}>
            <div className='bg-sidebar-accent flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Building2 className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>No organization</span>
              <span className='truncate text-xs'>Create or join one</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
