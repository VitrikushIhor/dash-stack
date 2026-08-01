import {
  type Collapsible,
  LayoutProvider,
  SearchProvider,
  type Variant,
} from '@/shared/lib/providers'
import { cn } from '@/shared/lib/utils'
import { SidebarInset, SidebarProvider } from '@/shared/ui/core/sidebar'
import { SkipToMain } from '@/shared/ui/skip-to-main'
import { ManageTaskModal } from '@/features/manage-task'
import { AppSidebar, CommandMenu } from '@/widgets/layout'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
  defaultOpen?: boolean
  defaultCollapsible?: Collapsible
  defaultVariant?: Variant
}

export function AuthenticatedLayout({
  children,
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
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children}
            <ManageTaskModal />
            <CommandMenu />
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
