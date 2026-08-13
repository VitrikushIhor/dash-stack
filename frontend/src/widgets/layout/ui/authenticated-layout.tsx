'use client'

import {
  type Collapsible,
  LayoutProvider,
  SearchProvider,
  type Variant,
} from '@/shared/lib/providers'
import { cn } from '@/shared/lib/utils'
import { SidebarInset, SidebarProvider } from '@/shared/ui/core/sidebar'
import { SkipToMain } from '@/shared/ui/skip-to-main'
import { AppSidebar, CommandMenu } from '@/widgets/layout'
import { AppHeader } from './app-header'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
  teamSwitcher?: React.ReactNode
  defaultOpen?: boolean
  defaultCollapsible?: Collapsible
  defaultVariant?: Variant
}

export function AuthenticatedLayout({
  children,
  teamSwitcher,
  defaultOpen = true,
  defaultCollapsible,
  defaultVariant,
}: AuthenticatedLayoutProps) {
  return (
    <SearchProvider>
      <LayoutProvider
        initialCollapsible={defaultCollapsible}
        initialVariant={defaultVariant}
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar teamSwitcher={teamSwitcher} />
          <SidebarInset
            className={cn(
              '@container/content',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <AppHeader />
            {children}
            <CommandMenu />
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
