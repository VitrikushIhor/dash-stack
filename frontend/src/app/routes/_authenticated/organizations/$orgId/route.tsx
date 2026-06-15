import {
  createFileRoute,
  Outlet,
  Link,
  useParams,
} from '@tanstack/react-router'
import { Loader2, LayoutDashboard, Users, Settings } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ConfigDrawer, Search, ThemeSwitch } from '@/shared/ui'
import {
  organizationApi,
  organizationKeys,
  useGetOrganization,
} from '@/features/organization'
import { Header } from '@/widgets/layout/ui/header'
import { Main } from '@/widgets/layout/ui/main'
import { NavUser } from '@/widgets/layout/ui/nav-user'

export const Route = createFileRoute('/_authenticated/organizations/$orgId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: organizationKeys.detail(params.orgId),
      queryFn: () => organizationApi.getById(params.orgId),
    }),
  component: OrganizationLayout,
})

function OrganizationLayout() {
  const { orgId } = useParams({ from: '/_authenticated/organizations/$orgId' })
  const { data: organization, isLoading } = useGetOrganization(orgId, {
    staleTime: Infinity,
  })

  if (isLoading) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className='container mx-auto py-20 text-center'>
        <h1 className='text-2xl font-bold'>Organization not found</h1>
        <Link to='/organizations' className='text-primary hover:underline'>
          Back to organizations
        </Link>
      </div>
    )
  }

  const navItems = [
    {
      label: 'Overview',
      to: '/organizations/$orgId',
      icon: LayoutDashboard,
    },
    {
      label: 'Team Members',
      to: '/organizations/$orgId/members',
      icon: Users,
    },
    {
      label: 'Settings',
      to: '/organizations/$orgId/settings',
      icon: Settings,
    },
  ]

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <NavUser />
        </div>
      </Header>

      <Main>
        <div className='mb-8 flex items-center gap-4'>
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className='h-12 w-12 rounded-xl object-cover'
            />
          ) : (
            <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold'>
              {organization.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className='text-3xl font-bold'>{organization.name}</h1>
        </div>

        <div className='flex flex-col gap-8 md:flex-row'>
          <aside className='w-full md:w-64'>
            <nav className='flex flex-col gap-1'>
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  params={{ orgId }}
                  activeProps={{
                    className: 'bg-accent text-accent-foreground',
                  }}
                  inactiveProps={{
                    className:
                      'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                  )}
                  activeOptions={{ exact: item.to === '/organizations/$orgId' }}
                >
                  <item.icon className='h-4 w-4' />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className='flex-1'>
            <Outlet />
          </main>
        </div>
      </Main>
    </>
  )
}
