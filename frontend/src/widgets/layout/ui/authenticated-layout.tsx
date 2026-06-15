import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/shared/lib/cookies'
import { cn } from '@/shared/lib/utils'
import { SkipToMain } from '@/shared/ui'
import { SidebarInset, SidebarProvider } from '@/shared/ui/core/sidebar'
import { ManageTaskModal } from '@/features/manage-task'
import { AppSidebar } from '@/widgets/layout/ui/app-sidebar'
import { LayoutProvider } from '@/app/context/layout-provider'
import { SearchProvider } from '@/app/context/search-provider'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
            <ManageTaskModal />
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
