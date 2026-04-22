import { createFileRoute } from '@tanstack/react-router'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import {
  ForbiddenError,
  GeneralError,
  MaintenanceError,
  NotFoundError,
  UnauthorisedError,
} from '@/shared/ui/components/errors'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { sidebarData } from '@/widgets/layout/ui/data/sidebar-data'
import { Header } from '@/widgets/layout/ui/header'
import { NavUser } from '@/widgets/layout/ui/nav-user'

export const Route = createFileRoute('/_authenticated/errors/$error')({
  component: RouteComponent,
})

function RouteComponent() {
  const { error } = Route.useParams()

  const errorMap: Record<string, React.ComponentType> = {
    unauthorized: UnauthorisedError,
    forbidden: ForbiddenError,
    'not-found': NotFoundError,
    'internal-server-error': GeneralError,
    'maintenance-error': MaintenanceError,
  }
  const ErrorComponent = errorMap[error] || NotFoundError

  return (
    <>
      <Header fixed className='border-b'>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser user={sidebarData.user} />
        </div>
      </Header>
      <div className='flex-1 [&>div]:h-full'>
        <ErrorComponent />
      </div>
    </>
  )
}
