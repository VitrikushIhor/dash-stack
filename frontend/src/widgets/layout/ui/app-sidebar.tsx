'use client'

import { useLayout } from '@/shared/lib/providers'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/ui/core/sidebar'
import { useOrgSlug } from '@/entities/organization'
import { getSidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'

export function AppSidebar({
  teamSwitcher,
}: {
  teamSwitcher?: React.ReactNode
}) {
  const { collapsible, variant } = useLayout()
  const slug = useOrgSlug()

  const currentSidebarData = getSidebarData(slug)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>{teamSwitcher}</SidebarHeader>
      <SidebarContent>
        {currentSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
