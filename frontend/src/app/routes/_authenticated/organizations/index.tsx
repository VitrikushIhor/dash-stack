import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Plus } from 'lucide-react'
import { ConfigDrawer, Search, ThemeSwitch } from '@/shared/ui'
import { Button } from '@/shared/ui/core/button'
import { useGetOrganizations } from '@/entities/organization'
import {
  OrganizationCard,
  CreateOrganizationDialog,
} from '@/features/organization'
import { Header, Main, NavUser } from '@/widgets/layout'

export const Route = createFileRoute('/_authenticated/organizations/')({
  component: OrganizationsListPage,
})

function OrganizationsListPage() {
  const { data: organizations, isLoading } = useGetOrganizations()

  if (isLoading) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    )
  }

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
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Organizations</h1>
            <p className='text-muted-foreground'>
              Manage your organizations and teams.
            </p>
          </div>
          <CreateOrganizationDialog>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              New Organization
            </Button>
          </CreateOrganizationDialog>
        </div>

        {!organizations || organizations.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center'>
            <h3 className='text-lg font-medium'>No organizations found</h3>
            <p className='text-muted-foreground'>
              Get started by creating your first organization.
            </p>
            <div className='mt-4'>
              <CreateOrganizationDialog />
            </div>
          </div>
        ) : (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </Main>
    </>
  )
}
