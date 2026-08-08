import { Suspense } from 'react'
import { Building2 } from 'lucide-react'
import {
  CreateOrganizationButton,
  CreateOrganizationDialog,
} from '@/features/organization'
import { Main } from '@/widgets/layout'
import {
  OrganizationListSkeleton,
  OrganizationListWidget,
} from '@/widgets/organization-list'

export function OrganizationsPage() {
  return (
    <Main className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-2.5'>
          <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl'>
            <Building2 className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-foreground text-2xl font-bold tracking-tight'>
              Organizations
            </h1>
            <p className='text-muted-foreground text-xs sm:text-sm'>
              Manage your workspaces and team collaborations
            </p>
          </div>
        </div>
        <CreateOrganizationButton />
      </div>

      <Suspense fallback={<OrganizationListSkeleton />}>
        <OrganizationListWidget />
      </Suspense>

      <CreateOrganizationDialog />
    </Main>
  )
}
